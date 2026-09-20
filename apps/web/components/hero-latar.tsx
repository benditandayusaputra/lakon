'use client'

import { useEffect, useState } from 'react'
import { Briefcase, Bus, Coffee, Hand, HeartPulse, PersonStanding, Siren } from 'lucide-react'

const JALAN =
  'M -60 560 C 180 560 260 420 420 400 S 700 470 860 380 S 1120 160 1300 150 S 1500 110 1560 60'

const PIN_DESKTOP = [
  { Icon: Coffee, x: 7, y: 86, warna: '#b4632c', tunda: '0s' },
  { Icon: HeartPulse, x: 19, y: 70, warna: '#3e7d5e', tunda: '-1.3s' },
  { Icon: Bus, x: 81, y: 50, warna: '#33608c', tunda: '-2.1s' },
  { Icon: Briefcase, x: 90, y: 27, warna: '#8a6a45', tunda: '-0.7s' },
  { Icon: Siren, x: 95, y: 22, warna: '#5b7285', tunda: '-2.8s' },
] as const

const PIN_PONSEL = [
  { Icon: Coffee, x: 9, y: 17, warna: '#b4632c', tunda: '0s' },
  { Icon: Siren, x: 91, y: 17, warna: '#5b7285', tunda: '-1.6s' },
] as const

export function HeroLatar({ ringkas = false }: { ringkas?: boolean }) {
  const [gerak, setGerak] = useState(false)
  useEffect(() => {
    setGerak(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-grid absolute inset-0 opacity-60" />
      <span className="hero-orb bg-sorot/25 absolute -left-24 top-8 h-72 w-72 rounded-full blur-3xl sm:h-96 sm:w-96" />
      <span
        className="hero-orb bg-aksen/25 absolute -right-20 bottom-0 h-80 w-80 rounded-full blur-3xl sm:h-[28rem] sm:w-[28rem]"
        style={{ animationDelay: '-9s' }}
      />

      <svg
        className="absolute inset-0 h-full w-full opacity-55 lg:opacity-100"
        viewBox="0 0 1440 620"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d={JALAN}
          fill="none"
          stroke="#f6efe4"
          strokeOpacity={0.08}
          strokeWidth={46}
          strokeLinecap="round"
        />
        <path
          d={JALAN}
          fill="none"
          stroke="#17120d"
          strokeOpacity={0.85}
          strokeWidth={30}
          strokeLinecap="round"
        />
        <path
          d={JALAN}
          fill="none"
          stroke="#f2c94c"
          strokeOpacity={0.9}
          strokeWidth={3}
          strokeDasharray="18 16"
          strokeLinecap="round"
          className={gerak ? 'hero-jalan' : undefined}
        />
        {gerak ? (
          <g>
            <animateMotion dur="18s" repeatCount="indefinite" path={JALAN} calcMode="linear" />
            <ellipse cx={0} cy={24} rx={16} ry={6} fill="rgb(0 0 0 / 0.35)" />
            <circle cx={0} cy={2} r={19} fill="#201a13" stroke="#f2c94c" strokeWidth={3} />
            <PersonStanding x={-12} y={-10} size={24} color="#f2c94c" strokeWidth={2.25} />
          </g>
        ) : null}
      </svg>

      {ringkas
        ? null
        : [
            ...PIN_DESKTOP.map((pin) => ({ ...pin, kelas: 'hidden lg:flex' })),
            ...PIN_PONSEL.map((pin) => ({ ...pin, kelas: 'hidden sm:flex lg:hidden' })),
          ].map(({ Icon, x, y, warna, tunda, kelas }) => (
            <span
              key={`${kelas}-${x}`}
              className={`hero-apung absolute -translate-x-1/2 -translate-y-full flex-col items-center ${kelas}`}
              style={{ left: `${x}%`, top: `${y}%`, animationDelay: tunda }}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white/90 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.7)] sm:h-12 sm:w-12"
                style={{ backgroundColor: warna }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#201a13] sm:h-8 sm:w-8">
                  <Icon size={16} strokeWidth={2.25} />
                </span>
              </span>
              <span
                className="-mt-2 h-4 w-4 rotate-45 border-b-[3px] border-r-[3px] border-white/90"
                style={{ backgroundColor: warna }}
              />
            </span>
          ))}

      {ringkas ? null : (
        <>
          <Hand
            className="hero-lambai text-sorot absolute left-[4%] top-[14%] hidden opacity-20 lg:block"
            size={120}
            strokeWidth={1.5}
          />
          <Hand
            className="hero-lambai text-halaman absolute bottom-[10%] right-[5%] hidden -scale-x-100 opacity-15 lg:block"
            size={140}
            strokeWidth={1.5}
            style={{ animationDelay: '-1.1s' }}
          />
        </>
      )}
    </div>
  )
}
