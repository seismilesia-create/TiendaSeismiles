'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { shopConfig } from '../config'

const markdownComponents: Components = {
  a: ({ href, children }) => {
    if (!href) return <>{children}</>
    const isInternal = href.startsWith('/')
    const cls =
      'font-medium text-terra-600 underline underline-offset-2 hover:text-terra-700'
    if (isInternal) {
      return (
        <Link href={href} className={cls}>
          {children}
        </Link>
      )
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    )
  },
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
  ),
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
}

type Message = { role: 'user' | 'assistant'; content: string }

function buildWhatsAppHandoff(messages: Message[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  const snippet = lastUser?.content.trim().slice(0, 400)
  const text = snippet
    ? `Hola! Vengo del chat web y me gustaría que me ayude una persona. Mi consulta: "${snippet}"`
    : 'Hola! Tengo una consulta sobre SEISMILES y me gustaría hablar con alguien.'
  return `${shopConfig.brand.whatsapp}?text=${encodeURIComponent(text)}`
}

const INITIAL_GREETING: Message = {
  role: 'assistant',
  content:
    '¡Hola! Soy el asistente de SEISMILES. Preguntame sobre productos, envíos, talles, cambios, formas de pago o lo que necesites.',
}

const SUGGESTIONS = [
  '¿Hacen envíos a todo el país?',
  '¿Qué formas de pago aceptan?',
  '¿Cómo son los cambios?',
]

export function ChatBot() {
  const pathname = usePathname()
  const isProductPage = /^\/catalogo\/[^/]+$/.test(pathname)

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return

    setError(null)
    setInput('')

    const nextMessages: Message[] = [
      ...messages,
      { role: 'user', content: trimmed },
      { role: 'assistant', content: '' },
    ]
    setMessages(nextMessages)
    setIsStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const payload = nextMessages
        .slice(0, -1)
        .filter((m) => m.content.trim().length > 0 || m.role === 'user')

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const { error: errMsg } = await res
          .json()
          .catch(() => ({ error: 'No pude procesar tu mensaje.' }))
        throw new Error(errMsg || 'Error del servidor')
      }
      if (!res.body) throw new Error('Respuesta vacía del servidor')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: acc }
          return copy
        })
      }

      if (!acc.trim()) {
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = {
            role: 'assistant',
            content: 'No recibí respuesta. Probá reformular la pregunta.',
          }
          return copy
        })
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      const msg =
        err instanceof Error ? err.message : 'Algo salió mal. Probá de nuevo.'
      setError(msg)
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  const floatOffset = isProductPage ? 'bottom-[5.5rem] lg:bottom-6' : 'bottom-6'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
        aria-expanded={open}
        className={`fixed right-6 ${floatOffset} z-50 flex h-14 w-14 items-center justify-center rounded-full bg-terra-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-terra-600 active:scale-95`}
      >
        {open ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-7 w-7"
          >
            <path d="M12 3C6.48 3 2 6.86 2 11.5c0 2.3 1.1 4.4 2.87 5.93L4 21l3.9-1.68c1.25.43 2.63.68 4.1.68 5.52 0 10-3.86 10-8.5S17.52 3 12 3zm-4 9.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm4 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm4 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
          </svg>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Asistente SEISMILES"
          className="fixed bottom-24 right-4 z-50 flex h-[min(600px,80vh)] w-[min(calc(100vw-2rem),380px)] flex-col overflow-hidden rounded-2xl border border-sand-300 bg-white shadow-2xl sm:right-6"
        >
          <div className="flex items-center justify-between gap-2 bg-volcanic-900 px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="font-heading text-lg leading-tight">Asistente SEISMILES</p>
              <p className="truncate text-xs text-sand-300">
                {isStreaming ? 'Escribiendo…' : 'Te respondemos al instante'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <a
                href={buildWhatsAppHandoff(messages)}
                target="_blank"
                rel="noopener noreferrer"
                title="Hablar con una persona por WhatsApp"
                aria-label="Hablar con una persona por WhatsApp"
                className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#1EBE57]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="hidden sm:inline">Hablar con alguien</span>
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="rounded-full p-1 transition hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-sand-50 px-4 py-4"
          >
            {messages.map((m, i) => (
              <MessageBubble
                key={i}
                role={m.role}
                content={m.content}
                pending={
                  isStreaming &&
                  i === messages.length - 1 &&
                  m.role === 'assistant' &&
                  m.content.length === 0
                }
              />
            ))}

            {!isStreaming && messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="rounded-full border border-sand-300 bg-white px-3 py-1.5 text-xs text-volcanic-800 transition hover:border-terra-400 hover:text-terra-600"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <p className="rounded-md border border-error-100 bg-error-50 px-3 py-2 text-sm text-error-700">
                {error}
              </p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 border-t border-sand-300 bg-white p-3"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              placeholder="Escribí tu mensaje…"
              rows={1}
              maxLength={2000}
              disabled={isStreaming}
              className="max-h-32 min-h-[40px] flex-1 resize-none rounded-lg border border-sand-300 bg-sand-50 px-3 py-2 text-sm text-volcanic-900 placeholder:text-volcanic-400 focus:border-terra-500 focus:outline-none focus:ring-2 focus:ring-terra-200 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              aria-label="Enviar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terra-500 text-white transition hover:bg-terra-600 disabled:cursor-not-allowed disabled:bg-sand-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}

function MessageBubble({
  role,
  content,
  pending,
}: {
  role: 'user' | 'assistant'
  content: string
  pending?: boolean
}) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isUser
            ? 'whitespace-pre-wrap rounded-br-sm bg-terra-500 text-white'
            : 'rounded-bl-sm border border-sand-300 bg-white text-volcanic-900'
        }`}
      >
        {pending ? (
          <TypingDots />
        ) : isUser ? (
          content
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Escribiendo">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-volcanic-400 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-volcanic-400 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-volcanic-400" />
    </span>
  )
}
