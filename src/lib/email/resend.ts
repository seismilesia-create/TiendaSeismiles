import { Resend } from 'resend'

// Lazy initialize Resend client to avoid build-time errors
let resendInstance: Resend | null = null

export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

// Email configuration
// Production uses the verified seismilestextil.com.ar domain; override via
// RESEND_FROM_EMAIL only if you need a different sender for a specific env.
export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || 'SEISMILES <hola@seismilestextil.com.ar>',
  replyTo: 'seismilestextil@gmail.com',
}
