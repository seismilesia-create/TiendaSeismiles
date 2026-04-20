'use client'

import Image from 'next/image'
import { useState, useEffect, useTransition } from 'react'
import { subscribeNewsletter } from '@/actions/newsletter'
import { shopConfig } from '@/features/shop/config'

// 🗓 Fecha de lanzamiento — cambiala cuando quieras
const LAUNCH_DATE = new Date('2026-08-01T00:00:00-03:00')

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

const CountdownTile = ({
  value,
  label,
  pulse = false,
}: {
  value: number
  label: string
  pulse?: boolean
}) => (
  <div
    className="flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm border border-sand-300 rounded-2xl py-5 px-2"
    style={{ boxShadow: 'var(--shadow-md)' }}
  >
    <span
      className={`font-display text-5xl sm:text-6xl text-volcanic-900 leading-none tabular-nums ${pulse ? 'animate-pulse' : ''
        }`}
    >
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-volcanic-400 text-[10px] sm:text-xs mt-2 uppercase tracking-[0.18em] font-medium">
      {label}
    </span>
  </div>
)

type Star = {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

// Duración del ciclo día-noche completo (en ms)
const CYCLE_MS = 80000

export default function ComingSoonPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(LAUNCH_DATE))
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [cycle, setCycle] = useState(0) // 0 → 1, avanza continuamente
  const [stars, setStars] = useState<Star[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    // Generamos las estrellas sólo en el cliente para evitar mismatch de hidratación
    setStars(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 55,
        size: Math.random() * 1.6 + 0.6,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 3,
      })),
    )
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(LAUNCH_DATE)), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      setCycle(((now - start) % CYCLE_MS) / CYCLE_MS)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    startTransition(async () => {
      const result = await subscribeNewsletter(email)
      if (result.error) {
        setFormError(result.error)
      } else {
        setSubmitted(true)
      }
    })
  }

  const units = [
    { value: timeLeft.days, label: 'Días' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg', pulse: true },
  ]

  // ─── Ciclo día/noche ─────────────────────────────────────────────────
  // cycle: 0=medianoche, 0.25=amanecer, 0.5=mediodía, 0.75=atardecer, 1=medianoche
  const nightness = (1 + Math.cos(2 * Math.PI * cycle)) / 2 // 1=noche, 0=día

  // Sol: visible en [0.25, 0.75]. Luna: en [0.75, 1] ∪ [0, 0.25]
  const sunT = (cycle - 0.25) * 2 // 0→1 durante el día
  const moonT =
    cycle >= 0.75 ? (cycle - 0.75) * 2 : cycle < 0.25 ? (cycle + 0.25) * 2 : -1

  // En mobile: trayectoria casi horizontal, cruzando de izquierda a derecha con un arco suave
  const arcPeakDrop = isMobile ? 14 : 68 // cuánto sube respecto al horizonte
  const arcHorizon = isMobile ? 28 : 85 // posición Y del horizonte (%) — en mobile queda alto
  const arcXStart = isMobile ? -2 : 8   // entra desde fuera de pantalla
  const arcXSpan = isMobile ? 104 : 84  // sale por fuera de pantalla
  const arc = (t: number) => {
    if (t < 0 || t > 1) return { visible: 0, x: 50, y: 80 }
    const h = Math.sin(Math.PI * t) // 0→1→0
    return {
      visible: Math.min(1, h * 1.4),
      x: arcXStart + t * arcXSpan,
      y: arcHorizon - h * arcPeakDrop,
    }
  }
  const sun = arc(sunT)
  const moon = arc(moonT)

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        // Cielo que interpola entre día y noche
        background: `linear-gradient(to bottom,
          rgb(${Math.round(245 - nightness * 225)}, ${Math.round(240 - nightness * 218)}, ${Math.round(232 - nightness * 197)}) 0%,
          rgb(${Math.round(240 - nightness * 215)}, ${Math.round(230 - nightness * 205)}, ${Math.round(218 - nightness * 180)}) 55%,
          rgb(${Math.round(232 - nightness * 200)}, ${Math.round(220 - nightness * 190)}, ${Math.round(205 - nightness * 170)}) 100%)`,
        transition: 'background 1s linear',
      }}
    >

      {/* Keyframes */}
      <style>{`
        @keyframes mountain-far {
          0%, 100% { transform: translateX(0); }
          50%       { transform: translateX(-14px); }
        }
        @keyframes mountain-mid {
          0%, 100% { transform: translateX(0); }
          50%       { transform: translateX(22px); }
        }
        @keyframes mountain-near {
          0%, 100% { transform: translateX(0); }
          50%       { transform: translateX(-18px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1.15); }
        }
      `}</style>

      {/* Estrellas — fade-in según oscuridad del cielo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: Math.max(0, (nightness - 0.35) * 1.6) }}
      >
        {stars.map((s) => (
          <span
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              boxShadow: `0 0 ${s.size * 2}px rgba(255,255,255,0.8)`,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Sol */}
      {sun.visible > 0 && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${sun.x}%`,
            top: `${sun.y}%`,
            width: isMobile ? '72px' : '110px',
            height: isMobile ? '72px' : '110px',
            transform: 'translate(-50%, -50%)',
            opacity: sun.visible,
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(255,220,160,0.55) 0%, rgba(255,200,140,0.25) 40%, transparent 70%)',
              transform: 'scale(2.8)',
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 35%, #FFE9B5 0%, #F7C873 55%, #E39A52 100%)',
              boxShadow: '0 0 48px rgba(243, 180, 105, 0.6)',
            }}
          />
        </div>
      )}

      {/* Luna */}
      {moon.visible > 0 && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${moon.x}%`,
            top: `${moon.y}%`,
            width: isMobile ? '56px' : '80px',
            height: isMobile ? '56px' : '80px',
            transform: 'translate(-50%, -50%)',
            opacity: moon.visible,
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(230,235,255,0.45) 0%, rgba(200,210,240,0.15) 45%, transparent 75%)',
              transform: 'scale(3)',
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 35%, #F5F3EC 0%, #D8D2C2 60%, #9E9581 100%)',
              boxShadow: '0 0 32px rgba(220, 220, 210, 0.5)',
            }}
          />
        </div>
      )}

      {/* Siluetas de montañas — 3 capas. Se oscurecen durante la noche */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '45vh', filter: `brightness(${1 - nightness * 0.65})`, transition: 'filter 1s linear' }}
      >
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1440 400"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g style={{ animation: 'mountain-far 10s ease-in-out infinite' }}>
            <path
              d="M-50,400 L-50,278 L100,270 L230,255 L360,262 L460,240 L590,250 L710,228 L840,244 L970,230 L1100,240 L1250,248 L1390,236 L1490,242 L1490,400 Z"
              fill="#DDD6CE"
              opacity="0.60"
            />
          </g>
          <g style={{ animation: 'mountain-mid 7s ease-in-out infinite' }}>
            <path
              d="M-50,400 L-50,288 L70,278 L195,255 L318,218 L418,250 L548,198 L668,230 L798,208 L920,234 L1058,202 L1198,228 L1338,212 L1490,222 L1490,400 Z"
              fill="#C4B8AA"
              opacity="0.60"
            />
          </g>
          <g style={{ animation: 'mountain-near 5s ease-in-out infinite' }}>
            <path
              d="M-50,400 L-50,298 L55,290 L175,272 L305,232 L415,262 L555,182 L685,238 L818,158 L948,212 L1088,175 L1228,222 L1375,188 L1490,204 L1490,400 Z"
              fill="#A89A88"
              opacity="0.65"
            />
          </g>
        </svg>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-16 w-full max-w-2xl mx-auto">

        {/* Logo */}
        <div className="mb-10 animate-fade-in">
          <Image
            src="/images/logo-seismiles-v2.png"
            alt="SEISMILES"
            width={180}
            height={78}
            className="w-auto h-14 brightness-[0.35] contrast-[1.1]"
            priority
          />
        </div>

        {/* Badge "Pronto" */}
        <div
          className="mb-7 animate-fade-in"
          style={{ animationFillMode: 'both', animationDelay: '0.1s' }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terra-100 text-terra-600 text-sm font-medium tracking-wide border border-terra-200">
            <span className="w-2 h-2 rounded-full bg-terra-500 animate-pulse inline-block" />
            Pronto
          </span>
        </div>

        {/* Título principal */}
        <h1
          className="animate-fade-in-up font-heading text-6xl sm:text-7xl lg:text-8xl text-volcanic-900 leading-[0.9] mb-5"
          style={{ animationFillMode: 'both', animationDelay: '0.15s' }}
        >
          Algo grande
          <br />
          <span className="italic text-terra-500">se viene</span>
        </h1>

        {/* Subtítulo */}
        <p
          className="animate-fade-in-up text-volcanic-500 text-base sm:text-lg mb-14 tracking-wide"
          style={{ animationFillMode: 'both', animationDelay: '0.25s' }}
        >
          Catamarca, Argentina &middot; {shopConfig.brand.subtitle}
        </p>

        {/* Cuenta regresiva */}
        <div
          className="animate-fade-in-up grid grid-cols-4 gap-3 sm:gap-4 mb-12 w-full"
          style={{ animationFillMode: 'both', animationDelay: '0.35s' }}
        >
          {units.map(({ value, label, pulse }) => (
            <CountdownTile key={label} value={value} label={label} pulse={pulse} />
          ))}
        </div>

        {/* Formulario de email */}
        <div
          className="animate-fade-in-up w-full max-w-md"
          style={{ animationFillMode: 'both', animationDelay: '0.45s' }}
        >
          {submitted ? (
            <div className="flex flex-col items-center gap-2 py-5 px-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-sand-300" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="w-10 h-10 rounded-full bg-terra-100 flex items-center justify-center mb-1">
                <svg className="w-5 h-5 text-terra-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-volcanic-800 font-semibold">¡Ya estás en la lista!</p>
              <p className="text-volcanic-400 text-sm">Te avisamos cuando abramos. Revisá tu casilla.</p>
            </div>
          ) : (
            <>
              <p className="text-volcanic-600 text-sm mb-3 font-medium">
                Anotate para ser el primero en enterarte
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="flex-1 px-4 py-3 rounded-xl border border-sand-300 bg-white/80 backdrop-blur-sm text-volcanic-900 placeholder:text-volcanic-300 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-terra-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-3 bg-terra-500 hover:bg-terra-600 active:bg-terra-600 text-white font-semibold rounded-xl text-sm transition-all duration-200 disabled:opacity-60 whitespace-nowrap cursor-pointer"
                  style={{ boxShadow: '0 4px 16px rgb(199 91 57 / 0.28)' }}
                >
                  {isPending ? 'Enviando...' : 'Anotarme'}
                </button>
              </form>
              {formError && (
                <p className="text-red-500 text-xs mt-2 text-center">{formError}</p>
              )}
            </>
          )}
        </div>

        {/* Botón de Instagram */}
        <div
          className="animate-fade-in-up mt-6"
          style={{ animationFillMode: 'both', animationDelay: '0.55s' }}
        >
          <a
            href={shopConfig.brand.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-6 py-3 bg-volcanic-900 hover:bg-volcanic-800 text-white rounded-xl font-medium text-sm transition-all duration-200"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            {/* Instagram icon */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            Seguinos en Instagram
            <svg
              className="w-3 h-3 opacity-50 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Tagline final */}
        <p
          className="animate-fade-in mt-16 text-volcanic-300 text-xs uppercase tracking-[0.22em]"
          style={{ animationFillMode: 'both', animationDelay: '0.7s' }}
        >
          {shopConfig.brand.subtitle}
        </p>
      </div>
    </main>
  )
}
