declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq: (...args: any[]) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _fbq: any
  }
}

export {}
