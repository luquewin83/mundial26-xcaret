import { useState } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'

const HOW_IT_WORKS = [
  {
    step: '1',
    icon: '🎯',
    title: 'Predice resultados',
    desc: 'Antes de cada partido elige quién gana y el marcador exacto.',
  },
  {
    step: '2',
    icon: '🏆',
    title: 'Compite en el ranking',
    desc: 'Sube posiciones en tiempo real y disputa el podio con otros huéspedes.',
  },
  {
    step: '3',
    icon: '🎁',
    title: 'Canjea tus premios',
    desc: 'Al finalizar, presenta tu posición en Recepción y reclama tu premio.',
  },
]

const POINTS = [
  { pts: '+200', label: 'Marcador exacto', sub: 'pts adicionales' },
  { pts: '100', label: 'Acertar ganador', sub: 'pts' },
  { pts: '+50', label: 'Marcador al descanso', sub: 'pts adicionales' },
]

export default function RegisterScreen() {
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const setGuest = useStore((s) => s.setGuest)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !room.trim()) return
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('guests')
      .insert({ name: name.trim(), room_number: room.trim(), resort: 'Xcaret' })
      .select()
      .single()

    if (err) {
      setError('Error al registrar. Verifica tu conexión e intenta de nuevo.')
      setLoading(false)
      return
    }

    setGuest(data)
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-mobile space-y-6">

        {/* Hero */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-1 mb-5">
            <div className="w-4 h-14 bg-mx-green rounded" />
            <div className="w-4 h-14 bg-white/90 rounded" />
            <div className="w-4 h-14 bg-mx-red rounded" />
          </div>
          <h1 className="font-display text-6xl text-white tracking-widest leading-none">MUNDIAL</h1>
          <h2 className="font-display text-4xl text-mx-green-light tracking-widest leading-none mt-1">
            2026
          </h2>
          <p className="text-neutral-400 text-sm mt-3">🇲🇽 Resort Xcaret · Experiencia Gamificada</p>
        </div>

        {/* ¿Cómo funciona? */}
        <div>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">
            ¿Cómo funciona?
          </p>
          <div className="space-y-2">
            {HOW_IT_WORKS.map(({ step, icon, title, desc }) => (
              <div key={step} className="bg-neutral-900 rounded-2xl px-4 py-3.5 flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-mx-green/20 border border-mx-green/30 flex items-center justify-center text-xl shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sistema de puntos */}
        <div>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">
            Sistema de puntos
          </p>
          <div className="bg-neutral-900 rounded-2xl divide-y divide-neutral-800">
            {POINTS.map(({ pts, label, sub }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3">
                <span className="text-neutral-300 text-sm">{label}</span>
                <div className="text-right">
                  <span className="text-mx-green-light font-bold text-base">{pts}</span>
                  <span className="text-neutral-500 text-xs ml-1">{sub}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Redemption note */}
          <div className="mt-2 flex items-start gap-2 bg-mx-green/10 border border-mx-green/25 rounded-xl px-4 py-3">
            <span className="text-lg shrink-0">📍</span>
            <p className="text-xs text-mx-green-light leading-relaxed">
              <span className="font-bold">Los puntos se canjean en Recepción.</span> Al terminar el
              torneo presenta tu posición en el ranking para reclamar tu premio.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            Regístrate para jugar
          </p>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Tu nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Carlos Rodríguez"
              autoComplete="given-name"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3.5 text-white placeholder-neutral-600 focus:outline-none focus:border-mx-green-light transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Número de habitación
            </label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="314"
              autoComplete="off"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3.5 text-white placeholder-neutral-600 focus:outline-none focus:border-mx-green-light transition-colors"
            />
          </div>

          {error && (
            <p className="text-mx-red text-sm text-center bg-mx-red/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim() || !room.trim()}
            className="w-full bg-mx-green hover:bg-mx-green-light active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 text-white font-display text-2xl tracking-wider py-4 rounded-xl transition-all"
          >
            {loading ? 'REGISTRANDO...' : 'ENTRAR AL JUEGO'}
          </button>
        </form>

      </div>
    </div>
  )
}
