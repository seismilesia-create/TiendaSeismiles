'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { LAUNCH_DATE, LAUNCH_ENABLED } from '../config'

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2.5l1.9 5.6a4 4 0 0 0 2.5 2.5l5.6 1.9-5.6 1.9a4 4 0 0 0-2.5 2.5L12 22.5l-1.9-5.6a4 4 0 0 0-2.5-2.5L2 12.5l5.6-1.9a4 4 0 0 0 2.5-2.5z" /></svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  )
}

const TARGET = LAUNCH_DATE.getTime()

type Remaining = { total: number; days: number; hours: number; minutes: number; seconds: number }

function getRemaining(): Remaining {
  const total = Math.max(TARGET - Date.now(), 0)
  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1_000) % 60),
  }
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

// Una celda de la cuenta regresiva (Días / Horas / Min / Seg).
function CountUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-sm w-[68px] h-[72px] sm:w-[88px] sm:h-[96px] tabular-nums font-display font-normal text-white leading-none text-[34px] sm:text-[48px]"
        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.12)' }}
      >
        {value}
      </div>
      <span className="font-sans font-semibold uppercase tracking-[0.22em] text-white/55 text-[10px] sm:text-[11px]">
        {label}
      </span>
    </div>
  )
}

export function LaunchGate({ children }: { children: ReactNode }) {
  // Arranca bloqueado (coincide con el render del servidor); el efecto
  // recalcula en el cliente y lo desbloquea si la fecha ya pasó.
  const [locked, setLocked] = useState(LAUNCH_ENABLED)
  const [remaining, setRemaining] = useState<Remaining | null>(null)

  useEffect(() => {
    if (!LAUNCH_ENABLED) {
      setLocked(false)
      return
    }
    const tick = () => {
      const r = getRemaining()
      setRemaining(r)
      if (r.total <= 0) setLocked(false)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Mientras está bloqueado, frenamos el scroll del body.
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [locked])

  if (!locked) return <>{children}</>

  const ready = remaining !== null && remaining.total <= 0

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Degradado volcánico (mismo lenguaje que el hero) */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg,#1A1614 0%,#3E1C13 34%,#5E2814 62%,#A04830 86%,#C75B39 100%)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(58% 75% at 12% 12%, rgba(244,160,104,.40) 0%, rgba(244,160,104,.10) 38%, transparent 64%)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(50% 80% at 92% 110%, rgba(220,138,108,.50) 0%, transparent 60%)' }}
      />
      {/* Textura de puntos con máscara diagonal */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,.07) 1.1px, transparent 1.1px)',
          backgroundSize: '24px 24px',
          WebkitMaskImage: 'linear-gradient(105deg, transparent 30%, rgba(0,0,0,.9) 100%)',
          maskImage: 'linear-gradient(105deg, transparent 30%, rgba(0,0,0,.9) 100%)',
        }}
      />
      {/* Silueta de montañas */}
      <svg
        className="absolute right-0 bottom-0 w-[min(760px,60vw)] h-auto opacity-40 pointer-events-none hidden md:block"
        viewBox="0 0 760 540"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline points="0,540 150,300 250,420 420,150 520,330 640,210 760,360 760,540" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth={1.5} />
        <polyline points="0,540 200,380 340,470 500,260 620,400 760,300" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth={1.5} />
      </svg>
      {/* Marco fino decorativo */}
      <div
        className="absolute border border-white/10 rounded-[3px] pointer-events-none"
        style={{ inset: 'clamp(14px,1.6vw,24px)' }}
      />

      <div className="relative z-10 flex min-h-full flex-col items-center justify-center text-center px-6 py-12">
        {/* Marca */}
        <span className="font-display text-white tracking-[0.18em] text-[clamp(28px,4vw,44px)] mb-6">
          SEISMILES
        </span>

        {/* Badge */}
        <span className="inline-flex items-center gap-[10px] px-5 py-[9px] rounded-full border border-white/25 bg-white/[0.07] font-medium uppercase tracking-[0.28em] text-white/90 text-[clamp(10px,1vw,12px)] mb-8">
          <SparkleIcon className="w-[14px] h-[14px] text-[#F4A068]" />
          Próximamente
        </span>

        {/* Titular */}
        <h1
          className="font-display font-normal text-white tracking-[0.012em] leading-[0.9] text-[clamp(40px,7vw,104px)]"
          style={{ textShadow: '0 4px 40px rgba(0,0,0,.25)' }}
        >
          Preparate para<br />el lanzamiento
        </h1>

        <p className="mt-6 max-w-[540px] leading-[1.6] text-white/[0.72] text-[clamp(15px,1.3vw,18px)]">
          Estamos por estrenar nuestra tienda online. Faltan los últimos detalles para que vivas SEISMILES como nunca.
        </p>

        {/* Cuenta regresiva */}
        <div className="mt-10 flex items-end gap-3 sm:gap-5">
          <CountUnit value={remaining ? pad(remaining.days) : '--'} label="Días" />
          <span className="font-display text-white/40 text-[34px] sm:text-[48px] leading-none pb-7 sm:pb-9">:</span>
          <CountUnit value={remaining ? pad(remaining.hours) : '--'} label="Horas" />
          <span className="font-display text-white/40 text-[34px] sm:text-[48px] leading-none pb-7 sm:pb-9">:</span>
          <CountUnit value={remaining ? pad(remaining.minutes) : '--'} label="Min" />
          <span className="font-display text-white/40 text-[34px] sm:text-[48px] leading-none pb-7 sm:pb-9">:</span>
          <CountUnit value={remaining ? pad(remaining.seconds) : '--'} label="Seg" />
        </div>

        {/* Botón "Ver colección" — bloqueado hasta que termine la cuenta */}
        <div className="mt-12">
          <button
            type="button"
            disabled={!ready}
            aria-disabled={!ready}
            onClick={() => setLocked(false)}
            className={`group inline-flex items-center gap-3 px-[38px] py-[18px] rounded-full font-semibold tracking-[0.01em] text-[16px] transition-all duration-300 ${
              ready
                ? 'bg-[#FDFCFA] text-volcanic-900 shadow-[0_18px_40px_-14px_rgba(0,0,0,.5)] hover:-translate-y-0.5 cursor-pointer'
                : 'bg-white/15 text-white/50 border border-white/20 cursor-not-allowed'
            }`}
          >
            Ver colección
            <ArrowRightIcon className={`w-[18px] h-[18px] transition-transform duration-300 ${ready ? 'group-hover:translate-x-1' : ''}`} />
          </button>
          {!ready && (
            <p className="mt-4 text-white/45 text-[12.5px] tracking-[0.04em]">
              Se habilita al finalizar la cuenta regresiva
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
