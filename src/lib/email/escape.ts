/**
 * Minimal HTML escaper for embedding untrusted user input into email bodies.
 *
 * Why: any string that came from a public form (or, more generally, from
 * outside the trust boundary) must be escaped before being interpolated into
 * an HTML template. Otherwise an attacker can inject `<a href="phish">…</a>`,
 * tracking pixels, or arbitrary CSS into the mail received by staff.
 *
 * This is intentionally tiny — no DOM, no third-party deps. It covers the
 * five characters that are dangerous in HTML element/attribute contexts.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Strips line breaks and surrounding whitespace from a string before using
 * it in an email header (Subject, From display name, etc.). Prevents header
 * injection on SMTP backends that do not escape CRLF themselves.
 */
export function sanitizeHeader(input: string): string {
  return input.replace(/[\r\n]+/g, ' ').trim()
}
