'use client'

import type { ReactNode } from 'react'

export type PoseBarista = 'netral' | 'lambai' | 'tunjuk' | 'sajikan'

const KULIT = '#eab68c'
const RAMBUT = '#33221a'
const BAJU = '#d9a24a'
const BAJU_GELAP = '#b9832f'
const APRON = '#5a3a26'
const APRON_TUA = '#452a18'

export function Uap({ className = '', warna = '#f5e9d7' }: { className?: string; warna?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={`kk-uap ${className}`} aria-hidden>
      <path
        d="M18 52 C14 44 24 40 20 32 C17 26 22 22 22 16"
        fill="none"
        stroke={warna}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 54 C28 45 38 41 34 32 C31 26 36 21 36 14"
        fill="none"
        stroke={warna}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M46 52 C42 44 52 40 48 32 C45 26 50 22 50 16"
        fill="none"
        stroke={warna}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function LampuGantung({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 130" className={className} aria-hidden>
      <line x1="40" y1="0" x2="40" y2="52" stroke="#2b1a0e" strokeWidth="3" />
      <path d="M16 78 Q16 52 40 52 Q64 52 64 78 Z" fill="#7a4d2a" />
      <path d="M20 76 Q22 58 40 56 Q58 58 60 76 Z" fill="#8a5a33" />
      <circle cx="40" cy="84" r="9" fill="#ffce8a" className="kk-lampu-nyala" />
      <circle cx="40" cy="86" r="22" fill="rgba(255,206,138,0.22)" className="kk-lampu-nyala" />
    </svg>
  )
}

export function LampuTali({ className = '' }: { className?: string }) {
  const titik = [8, 20, 32, 44, 56, 68, 80, 92]
  return (
    <svg viewBox="0 0 100 16" preserveAspectRatio="none" className={className} aria-hidden>
      <path d="M0 3 Q50 14 100 3" fill="none" stroke="#2b1a0e" strokeWidth="0.8" />
      {titik.map((x, i) => {
        const t = x / 100
        const y = 3 + 22 * t * (1 - t)
        return (
          <circle
            key={x}
            cx={x}
            cy={y + 2.4}
            r="1.7"
            fill={i % 2 === 0 ? '#ffce8a' : '#f0a04b'}
            className="kk-lampu-nyala"
            style={{ animationDelay: `${(i % 4) * 0.5}s` }}
          />
        )
      })}
    </svg>
  )
}

export function TanamanGantung({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 110" className={className} aria-hidden>
      <line x1="40" y1="0" x2="40" y2="26" stroke="#2b1a0e" strokeWidth="2" />
      <path d="M22 26 H58 L54 48 H26 Z" fill="#a8582f" />
      <path d="M22 26 H58 L57 32 H23 Z" fill="rgba(0,0,0,0.18)" />
      {[
        'M28 46 C20 62 24 78 18 92',
        'M36 48 C34 66 40 80 34 100',
        'M46 48 C50 66 44 82 50 98',
        'M54 46 C62 60 58 76 64 88',
      ].map((d) => (
        <path key={d} d={d} fill="none" stroke="#4f7a44" strokeWidth="4" strokeLinecap="round" />
      ))}
      <ellipse cx="40" cy="28" rx="16" ry="7" fill="#5d8a4f" />
    </svg>
  )
}

export function PapanMenuKapur({
  judul = 'MENU HARI INI',
  className = '',
}: {
  judul?: string
  className?: string
}) {
  const item = [
    ['Kopi Susu', '20rb'],
    ['Teh Melati', '12rb'],
    ['Cokelat Panas', '25rb'],
    ['Kopi Tubruk', '15rb'],
    ['Roti Bakar', '14rb'],
  ]
  return (
    <div className={`kk-papan-kapur rounded-xl p-4 ${className}`} aria-hidden>
      <p className="kk-font-kapur text-center text-xl tracking-wide text-[#ece7d6]">{judul}</p>
      <div className="mx-auto mt-1 h-px w-16 bg-[#ece7d6]/50" />
      <ul className="kk-font-kapur mt-2 space-y-0.5 text-lg leading-snug text-[#d9d3bd]">
        {item.map(([nama, harga]) => (
          <li key={nama} className="flex items-baseline gap-2">
            <span>{nama}</span>
            <span className="min-w-4 flex-1 border-b border-dotted border-[#d9d3bd]/40" />
            <span className="text-[#ffce8a]">{harga}</span>
          </li>
        ))}
      </ul>
      <p className="kk-font-kapur mt-2 text-center text-base text-[#a8c79a]">
        ✻ ramah bahasa isyarat ✻
      </p>
    </div>
  )
}

export function ArtMinuman({ jenis, className = '' }: { jenis: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden>
      {jenis === 'Teh' ? (
        <g>
          <path d="M34 34 H86 L80 94 Q60 100 40 94 Z" fill="#f3e5cf" />
          <path d="M38 44 H82 L78 88 Q60 93 42 88 Z" fill="#c98a3b" />
          <path
            d="M86 44 Q102 48 98 62 Q94 74 80 72"
            fill="none"
            stroke="#f3e5cf"
            strokeWidth="7"
          />
          <ellipse cx="60" cy="44" rx="22" ry="5" fill="#e3b26a" />
          <path d="M60 20 Q66 26 60 34 Q54 26 60 20" fill="#5d8a4f" />
        </g>
      ) : jenis === 'Cokelat' ? (
        <g>
          <path d="M30 38 H90 L84 92 Q60 100 36 92 Z" fill="#8a5a33" />
          <path d="M34 46 H86 L82 86 Q60 93 38 86 Z" fill="#4a2e1e" />
          <ellipse cx="60" cy="46" rx="24" ry="6" fill="#6b4226" />
          <ellipse cx="60" cy="44" rx="20" ry="5" fill="#e8d3b8" />
          <circle cx="52" cy="43" r="3" fill="#4a2e1e" />
          <circle cx="66" cy="45" r="2.5" fill="#4a2e1e" />
        </g>
      ) : (
        <g>
          <path d="M30 40 H88 L83 90 Q59 98 35 90 Z" fill="#fdfbf3" />
          <path
            d="M88 48 Q104 52 100 66 Q96 78 82 76"
            fill="none"
            stroke="#fdfbf3"
            strokeWidth="7"
          />
          <ellipse cx="59" cy="46" rx="23" ry="6" fill="#e8d3b8" />
          <ellipse cx="59" cy="45" rx="19" ry="4.5" fill="#6b4226" />
          <path d="M50 52 Q59 60 54 70" stroke="#e8d3b8" strokeWidth="2.5" fill="none" />
          <path d="M66 52 Q60 60 66 68" stroke="#c98a3b" strokeWidth="2.5" fill="none" />
        </g>
      )}
      <g transform="translate(30 -14)">
        <Uap warna="#c9b695" className="h-10 w-10" />
      </g>
      <ellipse cx="60" cy="98" rx="34" ry="5" fill="rgba(43,26,14,0.15)" />
    </svg>
  )
}

export function Barista({ pose, className = '' }: { pose: PoseBarista; className?: string }) {
  return (
    <svg viewBox="0 0 320 330" className={className} aria-hidden>
      <g className="kk-nafas">
        {pose === 'sajikan' ? (
          <g>
            <path
              d="M116 184 Q116 226 140 246"
              fill="none"
              stroke={BAJU}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="144" cy="250" r="10" fill={KULIT} />
          </g>
        ) : (
          <g>
            <path
              d="M116 184 Q102 232 110 270"
              fill="none"
              stroke={BAJU}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="110" cy="277" r="10" fill={KULIT} />
          </g>
        )}

        <path d="M112 178 Q112 148 160 146 Q208 148 208 178 L216 330 L104 330 Z" fill={BAJU} />
        <path
          d="M112 178 Q112 148 160 146 Q208 148 208 178 L210 210 L110 210 Z"
          fill={BAJU_GELAP}
          opacity="0.35"
        />

        <path d="M128 168 L192 168 L204 330 L116 330 Z" fill={APRON} />
        <path d="M128 168 L192 168 L194 186 L126 186 Z" fill={APRON_TUA} />
        <path
          d="M140 168 L150 140 M180 168 L170 140"
          stroke={APRON_TUA}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <rect x="138" y="238" width="44" height="34" rx="5" fill={APRON_TUA} />
        <rect x="150" y="230" width="5" height="16" rx="2" fill="#e8d3b8" />
        <circle cx="160" cy="204" r="11" fill="#f5e9d7" />
        <path
          d="M156 200 q4 8 8 0 M158 206 q2 4 4 0"
          stroke="#6b4226"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="172" y="196" width="26" height="12" rx="3" fill="#f5e9d7" />
        <rect x="175" y="200" width="20" height="2.4" rx="1.2" fill="#8a5a33" />

        <rect x="149" y="120" width="22" height="26" rx="8" fill={KULIT} />
        <path d="M149 132 q11 8 22 0 v6 q-11 8 -22 0 Z" fill="rgba(0,0,0,0.08)" />

        <circle cx="160" cy="92" r="46" fill={KULIT} />
        <path
          d="M114 92 a46 46 0 0 1 92 0 l0 -14 q-14 -34 -46 -34 q-32 0 -46 34 Z"
          fill={RAMBUT}
        />
        <path
          d="M114 92 q-4 -28 14 -40"
          fill="none"
          stroke={RAMBUT}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle cx="207" cy="52" r="15" fill={RAMBUT} />
        <circle cx="112" cy="96" r="7" fill={KULIT} />
        <circle cx="208" cy="96" r="7" fill={KULIT} />

        <g className="kk-mata">
          <ellipse cx="143" cy="94" rx="4" ry="5.5" fill={RAMBUT} />
          <ellipse cx="177" cy="94" rx="4" ry="5.5" fill={RAMBUT} />
        </g>
        <path
          d="M136 82 q7 -5 14 -1 M170 81 q7 -4 14 1"
          stroke={RAMBUT}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M146 112 Q160 124 174 112"
          stroke="#a8623c"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="132" cy="106" r="6" fill="#e08a6a" opacity="0.35" />
        <circle cx="188" cy="106" r="6" fill="#e08a6a" opacity="0.35" />

        {pose === 'lambai' ? (
          <g className="kk-lambai">
            <path
              d="M206 186 Q238 166 248 132 Q252 112 244 92"
              fill="none"
              stroke={BAJU}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="243" cy="84" r="11" fill={KULIT} />
            <path
              d="M236 76 l-3 -8 M243 73 l0 -9 M250 76 l3 -8"
              stroke={KULIT}
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        ) : null}
        {pose === 'tunjuk' ? (
          <g>
            <path
              d="M206 186 Q248 194 278 186"
              fill="none"
              stroke={BAJU}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="284" cy="184" r="10" fill={KULIT} />
            <path d="M290 182 l14 -3" stroke={KULIT} strokeWidth="7" strokeLinecap="round" />
          </g>
        ) : null}
        {pose === 'netral' ? (
          <g>
            <path
              d="M204 184 Q218 232 210 270"
              fill="none"
              stroke={BAJU}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="210" cy="277" r="10" fill={KULIT} />
          </g>
        ) : null}
        {pose === 'sajikan' ? (
          <g>
            <path
              d="M204 184 Q204 226 180 246"
              fill="none"
              stroke={BAJU}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="176" cy="250" r="10" fill={KULIT} />
          </g>
        ) : null}
      </g>
    </svg>
  )
}

export function LatarKonter({ className = '' }: { className?: string }) {
  return (
    <div className={`kk-ubin absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="absolute left-[4%] top-[22%] w-[44%]">
        <div className="flex items-end gap-[6%] px-[6%]">
          <svg viewBox="0 0 40 52" className="w-[18%]">
            <rect x="8" y="10" width="24" height="40" rx="4" fill="#c9b695" />
            <rect x="8" y="10" width="24" height="12" rx="4" fill="#8a5a33" />
            <rect x="12" y="2" width="16" height="8" rx="2" fill="#6b4226" />
          </svg>
          <svg viewBox="0 0 40 44" className="w-[17%]">
            <rect x="6" y="6" width="28" height="36" rx="4" fill="#a8c79a" opacity="0.9" />
            <rect x="6" y="24" width="28" height="18" rx="4" fill="#5d8a4f" />
          </svg>
          <svg viewBox="0 0 48 40" className="w-[22%]">
            <path d="M8 38 q-6 -18 8 -26 q8 -5 16 0 q14 8 8 26 Z" fill="#4f7a44" />
            <rect x="12" y="30" width="24" height="10" rx="2" fill="#a8582f" />
          </svg>
          <svg viewBox="0 0 40 46" className="w-[16%]">
            <path d="M10 8 H30 L27 40 Q20 44 13 40 Z" fill="#b4632c" />
            <ellipse cx="20" cy="8" rx="10" ry="3" fill="#8a4a26" />
          </svg>
        </div>
        <div className="kk-kayu h-2.5 w-full rounded-sm shadow-md" />
      </div>
      <div className="absolute right-[8%] top-[16%] w-[22%] max-w-28 rotate-2 rounded-md border-4 border-[#7a4d2a] bg-[#26301f] p-1.5 shadow-lg">
        <svg viewBox="0 0 60 44" className="w-full">
          <path d="M12 30 H40 L37 40 H15 Z" fill="#ece7d6" opacity="0.85" />
          <path
            d="M40 32 q8 1 6 7 h-8"
            fill="none"
            stroke="#ece7d6"
            strokeWidth="2.5"
            opacity="0.85"
          />
          <path
            d="M20 24 q-3 -6 2 -9 M28 24 q-3 -7 2 -11 M36 25 q-3 -6 2 -9"
            fill="none"
            stroke="#ece7d6"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>
      <div className="absolute left-[10%] top-[52%] hidden w-[16%] max-w-20 -rotate-1 rounded-sm border-2 border-[#7a4d2a] bg-[#f3e5cf] p-1 shadow-md sm:block">
        <svg viewBox="0 0 40 30" className="w-full">
          <path d="M4 26 L14 12 L22 20 L30 8 L36 26 Z" fill="#c98a3b" opacity="0.7" />
          <circle cx="30" cy="7" r="3" fill="#e0955a" />
        </svg>
      </div>
      <svg
        viewBox="0 0 200 170"
        className="absolute bottom-14 right-[3%] w-[34%] max-w-56 sm:bottom-[72px]"
        aria-hidden
      >
        <rect x="20" y="60" width="160" height="70" rx="10" fill="#3a2a20" />
        <rect x="30" y="40" width="140" height="26" rx="8" fill="#57433a" />
        <rect x="40" y="46" width="60" height="12" rx="3" fill="#2b1a0e" />
        <rect x="132" y="30" width="26" height="14" rx="3" fill="#57433a" />
        <rect x="52" y="96" width="14" height="30" rx="4" fill="#8a8378" />
        <rect x="120" y="96" width="14" height="30" rx="4" fill="#8a8378" />
        <rect x="40" y="126" width="120" height="10" rx="4" fill="#241811" />
        <circle cx="100" cy="80" r="7" fill="#ffce8a" className="kk-lampu-nyala" />
        <rect x="44" y="130" width="30" height="18" rx="3" fill="#f5e9d7" />
        <rect x="126" y="130" width="30" height="18" rx="3" fill="#f5e9d7" />
      </svg>
      <LampuGantung className="absolute left-[8%] top-0 w-14 sm:w-16" />
      <LampuGantung className="absolute right-[38%] top-0 w-12 sm:w-14" />
    </div>
  )
}

export function KonterBar({ pose, className = '' }: { pose: PoseBarista; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 ${className}`} aria-hidden>
      {pose === 'sajikan' ? (
        <div className="absolute bottom-[74px] left-1/2 z-10 w-16 -translate-x-1/2 sm:bottom-[86px]">
          <Uap className="mx-auto h-12 w-12" />
          <svg viewBox="0 0 80 42" className="w-full">
            <ellipse cx="38" cy="36" rx="30" ry="5" fill="#e8d3b8" />
            <path d="M14 6 H62 L58 30 Q38 36 18 30 Z" fill="#fdfbf3" />
            <path
              d="M62 10 Q76 13 72 24 Q69 31 58 28"
              fill="none"
              stroke="#fdfbf3"
              strokeWidth="5"
            />
          </svg>
        </div>
      ) : null}
      <div className="relative">
        <div className="kk-kayu h-5 w-full rounded-t-[4px] shadow-[0_-6px_18px_rgba(0,0,0,0.35)] sm:h-6" />
        <div className="kk-kayu-gelap relative h-16 w-full sm:h-20">
          <div className="absolute inset-x-0 top-2 flex items-center justify-center">
            <p className="font-display text-[10px] font-bold tracking-[0.35em] text-[#c9a06a] sm:text-xs">
              KOPI LAKON
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PanggungBarista({
  pose,
  className = '',
}: {
  pose: PoseBarista
  className?: string
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <LatarKonter />
      <Barista
        pose={pose}
        className="absolute bottom-10 left-1/2 w-[min(260px,72%)] -translate-x-1/2 sm:bottom-12 sm:w-[min(300px,76%)]"
      />
      <KonterBar pose={pose} />
    </div>
  )
}

const QRIS_SEL: boolean[] = (() => {
  let benih = 7
  const sel: boolean[] = []
  for (let i = 0; i < 441; i += 1) {
    benih = (benih * 48271) % 2147483647
    sel.push(benih % 5 < 2)
  }
  return sel
})()

export function KartuQris({ className = '' }: { className?: string }) {
  const ukuran = 21
  return (
    <div className={`rounded-xl bg-white p-3 shadow-lg ${className}`} aria-hidden>
      <p className="text-center text-[10px] font-black tracking-widest text-[#e0242a]">
        QRIS <span className="font-normal text-[#2b2620]">· KOPI LAKON</span>
      </p>
      <svg viewBox="0 0 21 21" className="mx-auto mt-1.5 aspect-square w-full max-w-36">
        {QRIS_SEL.map((isi, i) => {
          const x = i % ukuran
          const y = Math.floor(i / ukuran)
          const dalamPenanda = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
          if (dalamPenanda || !isi) return null
          return <rect key={i} x={x} y={y} width="1" height="1" fill="#1a1a1a" />
        })}
        {(
          [
            [0, 0],
            [14, 0],
            [0, 14],
          ] as const
        ).map(([px, py]) => (
          <g key={`${px}-${py}`}>
            <rect x={px} y={py} width="7" height="7" fill="#1a1a1a" />
            <rect x={px + 1} y={py + 1} width="5" height="5" fill="#ffffff" />
            <rect x={px + 2} y={py + 2} width="3" height="3" fill="#1a1a1a" />
          </g>
        ))}
      </svg>
      <p className="mt-1.5 text-center text-[10px] text-[#5c554a]">Pindai untuk membayar</p>
    </div>
  )
}

export function FasadKedai({
  membuka,
  onMasuk,
  papanInfo,
}: {
  membuka: boolean
  onMasuk: () => void
  papanInfo: ReactNode
}) {
  return (
    <div className={`relative flex flex-1 flex-col overflow-hidden ${membuka ? 'kk-membuka' : ''}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {(
          [
            [8, 12],
            [16, 28],
            [26, 8],
            [38, 20],
            [55, 10],
            [64, 24],
            [78, 14],
            [88, 30],
            [94, 9],
          ] as const
        ).map(([x, y]) => (
          <span
            key={`${x}-${y}`}
            className="kk-lampu-nyala absolute h-1 w-1 rounded-full bg-[#ffe0b0]"
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(x % 5) * 0.6}s` }}
          />
        ))}
        <span className="absolute right-[10%] top-[8%] h-16 w-16 rounded-full bg-[#f5ddb5] opacity-90 shadow-[0_0_70px_24px_rgba(255,214,150,0.35)] sm:h-20 sm:w-20">
          <span className="absolute left-[22%] top-[30%] h-3 w-3 rounded-full bg-[#e3c493] opacity-70" />
          <span className="absolute left-[55%] top-[55%] h-2 w-2 rounded-full bg-[#e3c493] opacity-60" />
        </span>
      </div>

      <div
        className="kk-fasad-zoom relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-end px-3 sm:px-6"
        style={{ transformOrigin: '50% 72%' }}
      >
        <LampuTali className="relative z-10 -mb-1 h-6 w-full" />
        <div className="kk-bata relative rounded-t-lg px-[4%] pt-5 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] sm:pt-7">
          <div className="mx-auto w-fit rounded-lg border-2 border-[#2b1a0e] bg-[#241811] px-5 py-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.45)] sm:px-8 sm:py-3.5">
            <div className="flex items-center justify-center gap-3">
              <div className="relative">
                <svg viewBox="0 0 40 34" className="h-7 w-8 sm:h-8 sm:w-9" aria-hidden>
                  <path d="M6 12 H30 L27 30 Q18 34 9 30 Z" fill="#ffce8a" />
                  <path
                    d="M30 15 Q38 17 35 24 Q33 29 27 27"
                    fill="none"
                    stroke="#ffce8a"
                    strokeWidth="3"
                  />
                </svg>
                <Uap warna="#ffce8a" className="absolute -top-6 left-1 h-8 w-8" />
              </div>
              <div>
                <p className="font-display text-xl font-bold tracking-[0.18em] text-[#ffce8a] drop-shadow-[0_0_12px_rgba(255,206,138,0.6)] sm:text-3xl">
                  KOPI LAKON
                </p>
                <p className="text-center text-[9px] uppercase tracking-[0.4em] text-[#e0955a] sm:text-[11px]">
                  kedai ramah isyarat
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-4 sm:mt-5">
            <div className="kk-tenda h-9 rounded-t-md shadow-md sm:h-12" />
            <div className="kk-tenda-gigi h-[17px] w-full" />
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-[4%] px-[2%] sm:mt-4">
            <div
              className="relative h-32 overflow-hidden rounded-t-md border-4 border-[#2b1a0e] bg-[radial-gradient(ellipse_75%_70%_at_50%_45%,#ffce8a_0%,#e8964f_55%,#a85a2e_100%)] shadow-[0_0_44px_6px_rgba(255,184,92,0.35)] sm:h-44"
              aria-hidden
            >
              <div className="absolute inset-x-0 top-1/2 h-1 bg-[#2b1a0e]/70" />
              <div className="absolute inset-y-0 left-1/2 w-1 bg-[#2b1a0e]/70" />
              <LampuGantung className="absolute left-[16%] top-0 w-9 opacity-80 sm:w-11" />
              <svg viewBox="0 0 60 40" className="absolute bottom-1 left-[12%] w-[38%] opacity-70">
                <path d="M8 38 q-5 -14 7 -21 q7 -4 13 0 q12 7 7 21 Z" fill="#3d5c36" />
                <rect x="12" y="32" width="26" height="8" rx="2" fill="#7a3f22" />
              </svg>
            </div>

            <button
              type="button"
              onClick={onMasuk}
              disabled={membuka}
              aria-label="Buka pintu dan masuk ke kedai"
              className="kk-jalan-pintu group relative z-20 block w-32 cursor-pointer rounded-t-[14px] sm:w-40"
            >
              <span className="relative block h-52 overflow-hidden rounded-t-[14px] border-4 border-[#2b1a0e] bg-[#1d120a] sm:h-64">
                <span
                  aria-hidden
                  className="kk-ruang-dalam absolute inset-0 block bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,#ffe0b0_0%,#e8964f_60%,#8a4a26_100%)]"
                >
                  <span className="absolute bottom-0 left-1/2 block h-[38%] w-[130%] -translate-x-1/2 rounded-t-md bg-[#4a2b18]" />
                  <span className="absolute bottom-[34%] left-[20%] block h-[10%] w-[60%] rounded-sm bg-[#26301f]" />
                </span>
                <span className="kk-pintu absolute inset-0 block">
                  <span className="kk-kayu-gelap absolute inset-0 block rounded-t-[10px]">
                    <span
                      aria-hidden
                      className="absolute inset-x-[14%] top-[8%] block h-[30%] rounded-t-full border-[3px] border-[#2b1a0e] bg-[radial-gradient(ellipse_at_50%_60%,#ffce8a_0%,#c9713f_80%)]"
                    >
                      <span className="kk-goyang absolute left-1/2 top-[26%] block -translate-x-1/2 rounded-sm bg-[#f5e9d7] px-1.5 py-0.5 shadow-sm">
                        <span className="kk-font-kapur block text-[10px] font-bold leading-none text-[#2b1a0e] sm:text-xs">
                          BUKA
                        </span>
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="absolute inset-x-[16%] top-[46%] block h-[20%] rounded-sm border-2 border-[#2b1a0e]/50"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-x-[16%] top-[70%] block h-[20%] rounded-sm border-2 border-[#2b1a0e]/50"
                    />
                    <span
                      aria-hidden
                      className="absolute right-[10%] top-[52%] block h-3.5 w-3.5 rounded-full bg-[#d9a521] shadow-[0_0_8px_rgba(217,165,33,0.8)]"
                    />
                  </span>
                </span>
              </span>
              <span className="pointer-events-none absolute -bottom-8 left-1/2 w-max -translate-x-1/2 rounded-full bg-[#241811]/85 px-3 py-1 text-xs font-bold text-[#ffce8a] opacity-90 transition-opacity group-hover:opacity-100 sm:text-sm">
                Klik pintu untuk masuk
              </span>
            </button>

            <div
              className="relative h-32 overflow-hidden rounded-t-md border-4 border-[#2b1a0e] bg-[radial-gradient(ellipse_75%_70%_at_50%_45%,#ffce8a_0%,#e8964f_55%,#a85a2e_100%)] shadow-[0_0_44px_6px_rgba(255,184,92,0.35)] sm:h-44"
              aria-hidden
            >
              <div className="absolute inset-x-0 top-1/2 h-1 bg-[#2b1a0e]/70" />
              <div className="absolute inset-y-0 left-1/2 w-1 bg-[#2b1a0e]/70" />
              <LampuGantung className="absolute right-[16%] top-0 w-9 opacity-80 sm:w-11" />
              <svg viewBox="0 0 100 46" className="absolute bottom-2 right-[8%] w-[62%] opacity-75">
                <rect x="6" y="26" width="88" height="6" rx="2" fill="#241811" />
                <path d="M22 10 H50 L47 26 H25 Z" fill="#241811" />
                <path d="M60 14 h18 l-2 12 h-14 Z" fill="#241811" />
              </svg>
            </div>
          </div>

          <div className="mt-0 h-3 bg-[#2b1a0e]" aria-hidden />
        </div>

        <div
          className="kk-aspal relative left-1/2 flex w-screen -translate-x-1/2 flex-col items-center gap-4 px-4 pb-8 pt-5 sm:flex-row sm:items-end sm:justify-center sm:gap-10 sm:pb-10"
          aria-hidden={membuka}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[radial-gradient(ellipse_45%_100%_at_50%_0%,rgba(255,206,138,0.28),transparent_70%)]"
          />
          {papanInfo}
        </div>
      </div>
    </div>
  )
}
