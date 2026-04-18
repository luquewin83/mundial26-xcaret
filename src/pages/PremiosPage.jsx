import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'

// ── Prize catalog (example – no DB) ─────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',       label: 'Todos',      icon: '✨' },
  { id: 'drinks',    label: 'Bebidas',    icon: '🍹' },
  { id: 'aqua',      label: 'Acuáticas', icon: '🤿' },
  { id: 'spa',       label: 'Spa',        icon: '💆' },
  { id: 'food',      label: 'Restaurantes', icon: '🍽️' },
  { id: 'hotel',     label: 'Hotel',      icon: '🏨' },
]

const PRIZES = [
  // ── Bebidas & Snacks ───────────────────────────────────────────────────────
  {
    id: 1, cat: 'drinks', icon: '🍹', pts: 150,
    title: 'Coctel de bienvenida',
    desc: 'Cualquier coctel de la barra principal del lobby.',
    badge: 'Más popular',
  },
  {
    id: 2, cat: 'drinks', icon: '🍷', pts: 250,
    title: '2×1 en bebidas premium',
    desc: 'Válido en cualquier bar del resort durante tu estancia.',
  },
  {
    id: 3, cat: 'drinks', icon: '🧃', pts: 200,
    title: 'Smoothie detox en el Spa',
    desc: 'Jugo verde o smoothie de frutas tropicales antes de tu tratamiento.',
  },
  {
    id: 4, cat: 'drinks', icon: '🍾', pts: 400,
    title: 'Botella de vino en habitación',
    desc: 'Selección de vino tinto o blanco entregada en tu cuarto.',
  },
  {
    id: 5, cat: 'drinks', icon: '🧀', pts: 350,
    title: 'Tabla de quesos y embutidos',
    desc: 'Selección de quesos mexicanos y embutidos artesanales.',
  },
  {
    id: 6, cat: 'drinks', icon: '🥂', pts: 600,
    title: 'Cata de tequilas premium',
    desc: 'Degustación guiada de 5 tequilas 100% agave con maridaje.',
    badge: 'Exclusivo',
  },

  // ── Actividades Acuáticas ──────────────────────────────────────────────────
  {
    id: 7, cat: 'aqua', icon: '🤿', pts: 500,
    title: 'Snorkel en arrecife',
    desc: 'Equipo incluido + guía acuático. 45 minutos en el arrecife de coral.',
    badge: 'Más popular',
  },
  {
    id: 8, cat: 'aqua', icon: '🛶', pts: 450,
    title: 'Kayak 1 hora',
    desc: 'Kayak individual o doble en la laguna interior del resort.',
  },
  {
    id: 9, cat: 'aqua', icon: '🏄', pts: 450,
    title: 'Paddleboard 1 hora',
    desc: 'Stand-up paddleboard en aguas tranquilas de la laguna.',
  },
  {
    id: 10, cat: 'aqua', icon: '🐠', pts: 1800,
    title: 'Buceo certificado',
    desc: 'Inmersión en el arrecife con instructor certificado PADI. Equipo incluido.',
    badge: 'Aventura',
  },
  {
    id: 11, cat: 'aqua', icon: '🐬', pts: 2500,
    title: 'Nado con delfines 30 min',
    desc: 'Experiencia única en el Delfinario Xcaret con interacción directa.',
    badge: 'Exclusivo',
  },
  {
    id: 12, cat: 'aqua', icon: '🏊', pts: 700,
    title: 'Tour en cenote privado',
    desc: 'Acceso especial a cenote de acceso restringido. Grupos máx. 8 personas.',
  },

  // ── Spa & Bienestar ────────────────────────────────────────────────────────
  {
    id: 13, cat: 'spa', icon: '💆', pts: 800,
    title: 'Masaje express 30 min',
    desc: 'Masaje de espalda y hombros con aceites esenciales mexicanos.',
  },
  {
    id: 14, cat: 'spa', icon: '🌿', pts: 1200,
    title: 'Facial rejuvenecedor',
    desc: 'Tratamiento facial con extractos de aloe vera y maíz azul.',
  },
  {
    id: 15, cat: 'spa', icon: '🛁', pts: 1500,
    title: 'Masaje relajante 60 min',
    desc: 'Masaje de cuerpo completo con técnica sueca y aromaterapia.',
    badge: 'Más popular',
  },
  {
    id: 16, cat: 'spa', icon: '🍫', pts: 1800,
    title: 'Ritual de chocolate',
    desc: 'Envoltura corporal con cacao maya + masaje de 45 min. Experiencia prehispánica.',
    badge: 'Especial',
  },
  {
    id: 17, cat: 'spa', icon: '👫', pts: 2800,
    title: 'Masaje en pareja 60 min',
    desc: 'Sala privada con vista al jardín, velas y jacuzzi incluido.',
    badge: 'Romántico',
  },
  {
    id: 18, cat: 'spa', icon: '🌺', pts: 2200,
    title: 'Ritual de temazcal',
    desc: 'Ceremonia tradicional maya de purificación con guía espiritual certificado.',
    badge: 'Cultural',
  },

  // ── Restaurantes ──────────────────────────────────────────────────────────
  {
    id: 19, cat: 'food', icon: '🥐', pts: 600,
    title: 'Desayuno buffet para 2',
    desc: 'Acceso al buffet principal con estaciones calientes y jugos naturales.',
  },
  {
    id: 20, cat: 'food', icon: '🫕', pts: 900,
    title: 'Almuerzo en La Isla',
    desc: 'Menú del día para 2 personas en el restaurante frente a la laguna.',
  },
  {
    id: 21, cat: 'food', icon: '🌮', pts: 1200,
    title: 'Brunch dominical ilimitado',
    desc: 'Brunch de domingo con estaciones en vivo, mariscos y postres artesanales.',
    badge: 'Especial',
  },
  {
    id: 22, cat: 'food', icon: '🍝', pts: 1600,
    title: 'Clase de cocina mexicana',
    desc: 'Aprende a preparar 3 platillos típicos con el chef ejecutivo del resort.',
    badge: 'Experiencia',
  },
  {
    id: 23, cat: 'food', icon: '🥩', pts: 2000,
    title: 'Cena romántica para 2',
    desc: 'Mesa privada en la playa con menú de 4 tiempos y maridaje incluido.',
    badge: 'Romántico',
  },
  {
    id: 24, cat: 'food', icon: '🦞', pts: 2500,
    title: 'Cena en restaurante de especialidades',
    desc: 'Menú degustación de 6 tiempos en El Manglar, nuestro restaurante premium.',
    badge: 'Premium',
  },

  // ── Hotel & Experiencias ───────────────────────────────────────────────────
  {
    id: 25, cat: 'hotel', icon: '⏰', pts: 700,
    title: 'Late check-out hasta 15:00 h',
    desc: 'Extiende tu estadía sin costo adicional hasta las 3 de la tarde.',
  },
  {
    id: 26, cat: 'hotel', icon: '📸', pts: 2200,
    title: 'Fotosesión en cenote',
    desc: 'Sesión fotográfica profesional de 45 min en cenote interior. 30 fotos editadas.',
    badge: 'Exclusivo',
  },
  {
    id: 27, cat: 'hotel', icon: '🎭', pts: 1000,
    title: 'Show Xcaret México · 2 entradas',
    desc: 'Acceso al espectáculo nocturno de cultura y tradición mexicana.',
  },
  {
    id: 28, cat: 'hotel', icon: '🚁', pts: 4000,
    title: 'Tour privado en Xcaret',
    desc: 'Recorrido VIP por las atracciones del parque con guía exclusivo y sin filas.',
    badge: 'VIP',
  },
  {
    id: 29, cat: 'hotel', icon: '⬆️', pts: 3000,
    title: 'Upgrade de habitación',
    desc: 'Mejora a Suite Junior o Superior con vista al mar. Sujeto a disponibilidad.',
    badge: 'VIP',
  },
  {
    id: 30, cat: 'hotel', icon: '🌅', pts: 3500,
    title: 'Acceso VIP Xcaret Park',
    desc: 'Entrada al parque para 2 con acceso preferencial a todas las atracciones.',
    badge: 'VIP',
  },
  {
    id: 31, cat: 'hotel', icon: '🏨', pts: 5000,
    title: 'Noche extra en el resort',
    desc: 'Una noche adicional en habitación Deluxe con desayuno incluido.',
    badge: '🏆 Top premio',
  },
  {
    id: 32, cat: 'hotel', icon: '🐆', pts: 1500,
    title: 'Visita guiada al zoo nocturno',
    desc: 'Tour nocturno exclusivo por el área de fauna mexicana. Grupos de 6 máx.',
    badge: 'Aventura',
  },
]

const BADGE_COLORS = {
  'Más popular': 'bg-blue-500/20 text-blue-300',
  'Exclusivo':   'bg-violet-500/20 text-violet-300',
  'Aventura':    'bg-orange-500/20 text-orange-300',
  'Romántico':   'bg-pink-500/20 text-pink-300',
  'Especial':    'bg-yellow-500/20 text-yellow-300',
  'Cultural':    'bg-amber-500/20 text-amber-300',
  'Premium':     'bg-mx-red/20 text-red-300',
  'VIP':         'bg-yellow-400/20 text-yellow-300',
  'Experiencia': 'bg-teal-500/20 text-teal-300',
  '🏆 Top premio': 'bg-yellow-400/25 text-yellow-300',
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PremiosPage() {
  const { guest } = useStore()
  const [totalPts, setTotalPts] = useState(null)
  const [activecat, setActiveCat] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!guest?.id) return
    supabase
      .from('predictions')
      .select('points_earned')
      .eq('guest_id', guest.id)
      .not('points_earned', 'is', null)
      .then(({ data }) => {
        const sum = (data ?? []).reduce((acc, r) => acc + (r.points_earned ?? 0), 0)
        setTotalPts(sum)
      })
  }, [guest?.id])

  const pts = totalPts ?? 0

  const filtered =
    activecat === 'all' ? PRIZES : PRIZES.filter((p) => p.cat === activecat)

  const unlocked = filtered.filter((p) => p.pts <= pts).length
  const nextPrize = [...PRIZES]
    .filter((p) => p.pts > pts)
    .sort((a, b) => a.pts - b.pts)[0]

  return (
    <div className="pb-24">
      {/* Points header */}
      <div className="bg-neutral-900 mx-4 mt-5 rounded-2xl p-5">
        <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">
          Tus puntos acumulados
        </p>
        <div className="flex items-end justify-between">
          <div>
            {totalPts === null ? (
              <div className="h-12 w-32 bg-neutral-800 rounded-lg animate-pulse" />
            ) : (
              <p className="font-display text-5xl text-mx-green-light leading-none">{pts.toLocaleString()}</p>
            )}
            <p className="text-neutral-400 text-xs mt-1">{guest?.name} · Hab. {guest?.room_number}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold text-sm">{unlocked} premios</p>
            <p className="text-neutral-400 text-xs">desbloqueados</p>
          </div>
        </div>

        {/* Progress to next prize */}
        {nextPrize && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-neutral-400">Próximo: {nextPrize.icon} {nextPrize.title}</span>
              <span className="text-neutral-400">{nextPrize.pts - pts} pts</span>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-mx-green-light rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (pts / nextPrize.pts) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Redemption note */}
      <div className="mx-4 mt-3 flex items-start gap-2 bg-mx-green/10 border border-mx-green/25 rounded-xl px-4 py-3">
        <span className="text-lg shrink-0">📍</span>
        <p className="text-xs text-mx-green-light leading-relaxed">
          <span className="font-bold">Canjea en Recepción 24 h.</span> Muestra esta pantalla al
          agente y él procesará tu premio. Válido hasta el último día de tu estancia.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto px-4 mt-5 pb-1 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              activecat === c.id
                ? 'bg-mx-green text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            <span>{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Prizes grid */}
      <div className="px-4 mt-4 space-y-2">
        {filtered.map((prize) => {
          const canRedeem = prize.pts <= pts
          return (
            <button
              key={prize.id}
              onClick={() => setSelected(prize)}
              className={`w-full text-left rounded-2xl p-4 transition-all border ${
                canRedeem
                  ? 'bg-neutral-900 border-neutral-700 hover:border-neutral-500'
                  : 'bg-neutral-900/50 border-neutral-800/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    canRedeem ? 'bg-neutral-800' : 'bg-neutral-800/50 grayscale opacity-50'
                  }`}
                >
                  {prize.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm leading-snug ${canRedeem ? 'text-white' : 'text-neutral-500'}`}>
                      {prize.title}
                    </p>
                    {prize.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${BADGE_COLORS[prize.badge] ?? 'bg-neutral-700 text-neutral-300'}`}>
                        {prize.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 leading-relaxed ${canRedeem ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {prize.desc}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {canRedeem ? (
                      <span className="text-mx-green-light font-bold text-sm">
                        {prize.pts.toLocaleString()} pts
                      </span>
                    ) : (
                      <>
                        <span className="text-neutral-500 font-bold text-sm">
                          {prize.pts.toLocaleString()} pts
                        </span>
                        <span className="text-[10px] text-neutral-600">
                          (faltan {(prize.pts - pts).toLocaleString()})
                        </span>
                      </>
                    )}
                    {canRedeem && (
                      <span className="ml-auto text-xs text-mx-green font-semibold bg-mx-green/10 px-2 py-0.5 rounded-full">
                        ✓ Disponible
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Modal */}
      {selected && (
        <RedeemModal prize={selected} guestPts={pts} onClose={() => setSelected(null)} guest={guest} />
      )}
    </div>
  )
}

// ── Redeem modal ─────────────────────────────────────────────────────────────

function RedeemModal({ prize, guestPts, guest, onClose }) {
  const canRedeem = prize.pts <= guestPts

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-mobile bg-neutral-900 rounded-t-3xl p-6 pb-10 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto" />

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center text-4xl shrink-0">
            {prize.icon}
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">{prize.title}</p>
            <p className="text-mx-green-light font-bold">{prize.pts.toLocaleString()} puntos</p>
          </div>
        </div>

        <p className="text-neutral-300 text-sm leading-relaxed">{prize.desc}</p>

        {canRedeem ? (
          <div className="bg-mx-green/10 border border-mx-green/30 rounded-2xl p-4 space-y-3">
            <p className="text-mx-green-light font-bold text-sm">✓ Tienes puntos suficientes</p>
            <div className="text-xs text-neutral-400 space-y-1">
              <p>👤 <span className="text-white">{guest?.name}</span></p>
              <p>🏨 Habitación <span className="text-white">{guest?.room_number}</span></p>
              <p>🏅 Puntos: <span className="text-mx-green-light font-bold">{guestPts.toLocaleString()} / {prize.pts.toLocaleString()} requeridos</span></p>
            </div>
            <div className="bg-neutral-800 rounded-xl p-3 text-center">
              <p className="text-xs text-neutral-400 mb-0.5">Instrucciones</p>
              <p className="text-white text-sm font-semibold">
                📍 Presenta esta pantalla en Recepción para canjear tu premio
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-800 rounded-2xl p-4 text-center">
            <p className="text-neutral-400 text-sm mb-1">
              Te faltan <span className="text-white font-bold">{(prize.pts - guestPts).toLocaleString()} pts</span> para este premio
            </p>
            <p className="text-neutral-500 text-xs">
              Sigue prediciendo partidos para acumular más puntos
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold py-3.5 rounded-xl transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
