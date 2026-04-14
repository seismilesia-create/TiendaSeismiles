/**
 * Validates an uploaded image File before sending it to Supabase Storage.
 *
 * Why this exists: the storage bucket is public, so anything we upload is
 * directly servable. Without this check, an admin (or anyone who reaches an
 * upload action) could upload `.svg` containing `<script>`, `.html`, or any
 * arbitrary content with a spoofed Content-Type — which would then be served
 * from our origin and execute as same-origin JS in any browser that opens it.
 *
 * Defenses applied:
 *   1. Allowlist MIME type (jpeg / png / webp). SVG, HTML, anything else
 *      is rejected.
 *   2. Cap file size (5 MB) to prevent storage abuse.
 *   3. Magic-byte sniff: the first bytes of the buffer must actually match
 *      the claimed content type. The client's `file.type` is hostile input.
 *   4. Return a server-derived extension. Callers must NOT use `file.name`
 *      to build the storage path — that field is attacker-controlled.
 */

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

const ALLOWED: Record<string, 'jpg' | 'png' | 'webp'> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export interface ValidatedImage {
  buffer: ArrayBuffer
  contentType: 'image/jpeg' | 'image/png' | 'image/webp'
  ext: 'jpg' | 'png' | 'webp'
}

export type ValidateImageResult =
  | { ok: true; image: ValidatedImage }
  | { ok: false; error: string }

/** True if the buffer's leading bytes match the declared content type. */
function magicBytesMatch(buf: Uint8Array, contentType: string): boolean {
  if (contentType === 'image/jpeg') {
    // FF D8 FF
    return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  }
  if (contentType === 'image/png') {
    // 89 50 4E 47 0D 0A 1A 0A
    return (
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a
    )
  }
  if (contentType === 'image/webp') {
    // "RIFF" .... "WEBP"
    return (
      buf.length >= 12 &&
      buf[0] === 0x52 &&
      buf[1] === 0x49 &&
      buf[2] === 0x46 &&
      buf[3] === 0x46 &&
      buf[8] === 0x57 &&
      buf[9] === 0x45 &&
      buf[10] === 0x42 &&
      buf[11] === 0x50
    )
  }
  return false
}

export async function validateImageUpload(file: File): Promise<ValidateImageResult> {
  if (!file || typeof file.size !== 'number') {
    return { ok: false, error: 'Archivo invalido.' }
  }

  if (file.size === 0) {
    return { ok: false, error: 'El archivo esta vacio.' }
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'La imagen supera el tamano maximo de 5 MB.' }
  }

  const ext = ALLOWED[file.type]
  if (!ext) {
    return {
      ok: false,
      error: 'Formato no permitido. Solo se aceptan JPG, PNG o WebP.',
    }
  }

  const buffer = await file.arrayBuffer()

  // Re-check size on the actual buffer in case file.size was misreported.
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) {
    return { ok: false, error: 'La imagen supera el tamano maximo de 5 MB.' }
  }

  const head = new Uint8Array(buffer.slice(0, 12))
  if (!magicBytesMatch(head, file.type)) {
    return {
      ok: false,
      error: 'El archivo no es una imagen valida.',
    }
  }

  return {
    ok: true,
    image: {
      buffer,
      contentType: file.type as ValidatedImage['contentType'],
      ext,
    },
  }
}
