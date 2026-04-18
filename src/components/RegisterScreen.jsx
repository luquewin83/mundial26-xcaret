import { useState } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'

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
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-mobile">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1 mb-6">
            <div className="w-4 h-16 bg-mx-green rounded" />
            <div className="w-4 h-16 bg-white/90 rounded" />
            <div className="w-4 h-16 bg-mx-red rounded" />
          </div>
          <h1 className="font-display text-6xl text-white tracking-widest leading-none">
            MUNDIAL
          </h1>
          <h2 className="font-display text-4xl text-mx-green-light tracking-widest leading-none mt-1">
            2026
          </h2>
          <p className="text-neutral-400 text-sm mt-3">
            🇲🇽 Resort Xcaret · Experiencia Gamificada
          </p>
        </div>

        <div className="bg-neutral-900 rounded-2xl p-5 mb-4 space-y-1">
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <span className="text-mx-green-light font-bold">100</span>
            <span className="text-neutral-500">pts</span>
            <span>Acertar ganador</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <span className="text-mx-green-light font-bold">+200</span>
            <span className="text-neutral-500">pts</span>
            <span>Marcador exacto</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <span className="text-mx-green-light font-bold">+50</span>
            <span className="text-neutral-500">pts</span>
            <span>Marcador al descanso</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
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
            className="w-full bg-mx-green hover:bg-mx-green-light active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 text-white font-display text-2xl tracking-wider py-4 rounded-xl transition-all mt-2"
          >
            {loading ? 'REGISTRANDO...' : 'ENTRAR AL JUEGO'}
          </button>
        </form>
      </div>
    </div>
  )
}
