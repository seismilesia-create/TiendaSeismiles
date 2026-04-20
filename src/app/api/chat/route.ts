import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/rate-limit'
import { CHATBOT_SYSTEM_PROMPT } from '@/features/shop/chatbot/systemPrompt'
import { checkChatRateLimit, sweepIfStale } from '@/features/shop/chatbot/rate-limit'

export const runtime = 'nodejs'

const MODEL = 'google/gemini-2.5-flash'
const MAX_MESSAGES = 20
const MAX_CHARS_PER_MESSAGE = 2000
const RATE_LIMIT_COUNT = 20
const RATE_LIMIT_WINDOW_SEC = 60 * 60

type ClientMessage = { role: 'user' | 'assistant'; content: string }

function isValidMessage(m: unknown): m is ClientMessage {
  if (!m || typeof m !== 'object') return false
  const msg = m as Record<string, unknown>
  return (
    (msg.role === 'user' || msg.role === 'assistant') &&
    typeof msg.content === 'string' &&
    msg.content.trim().length > 0 &&
    msg.content.length <= MAX_CHARS_PER_MESSAGE
  )
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Chatbot no configurado.' },
      { status: 503 },
    )
  }

  sweepIfStale()

  const ip = await getClientIp()
  const rate = checkChatRateLimit(`chat:${ip}`, RATE_LIMIT_COUNT, RATE_LIMIT_WINDOW_SEC)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Alcanzaste el límite de mensajes por hora. Escribinos por WhatsApp si necesitás ayuda urgente.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rate.retryAfterSec) },
      },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const messages = (body as { messages?: unknown })?.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages requerido' }, { status: 400 })
  }
  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: 'Historial demasiado largo' }, { status: 400 })
  }
  if (!messages.every(isValidMessage)) {
    return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })
  }
  if (messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'El último mensaje debe ser del usuario' }, { status: 400 })
  }

  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://seismilestextil.com',
      'X-Title': 'SEISMILES',
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
        ...messages,
      ],
    }),
  })

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    console.error('[chat] openrouter error', upstream.status, detail)
    return NextResponse.json(
      { error: 'No pude conectarme al asistente. Probá de nuevo en un momento.' },
      { status: 502 },
    )
  }

  // Parse OpenRouter SSE and re-emit plain text chunks to the client.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader()
      const decoder = new TextDecoder()
      const encoder = new TextEncoder()
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const raw of lines) {
            const line = raw.trim()
            if (!line || !line.startsWith('data:')) continue
            const payload = line.slice(5).trim()
            if (payload === '[DONE]') {
              controller.close()
              return
            }
            try {
              const parsed = JSON.parse(payload) as {
                choices?: Array<{ delta?: { content?: string } }>
              }
              const delta = parsed.choices?.[0]?.delta?.content
              if (delta) controller.enqueue(encoder.encode(delta))
            } catch {
              // Ignore keepalive / comment lines.
            }
          }
        }
        controller.close()
      } catch (err) {
        console.error('[chat] stream error', err)
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
