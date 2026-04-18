import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'

const STATUS_BADGE = {
  live: (
    <span className="flex items-center gap-1 bg-mx-red/20 text-mx-red text-[10px] font-bold px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 bg-mx-red rounded-full animate-pulse" />
      EN VIVO
    </span>
  ),
  finished: (
    <span className="bg-neutral-800 text-neutral-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
      FINALIZADO
    </span>
  ),
  upcoming: (
    <span className="bg-neutral-800 text-neutral-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
      PRÓXIMO
    </span>
  ),
}

function formatKickOff(ts) {
  return new Date(ts).toLocaleString('es-MX', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Cancun',
  })
}

export default function MatchSelector() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const { selectedMatch, setSelectedMatch, setCurrentPhase } = useStore()

  useEffect(() => {
    supabase
      .from('matches')
      .select('*')
      .in('status', ['live', 'upcoming', 'finished'])
      .order('kick_off', { ascending: true })
      .limit(30)
      .then(({ data }) => {
        setMatches(data ?? [])
        setLoading(false)
      })
  }, [])

  const handleSelect = (match) => {
    setSelectedMatch(match)
    if (match.status === 'live') setCurrentPhase('durante')
    else if (match.status === 'finished') setCurrentPhase('despues')
    else setCurrentPhase('antes')
  }

  return (
    <div className="px-4 py-5">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">
        Selecciona un partido
      </p>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-neutral-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">⚽</p>
          <p className="text-neutral-400 text-sm">No hay partidos disponibles</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Live first */}
          {matches.filter((m) => m.status === 'live').length > 0 && (
            <p className="text-[10px] text-mx-red font-bold uppercase tracking-widest mt-1">
              En Vivo
            </p>
          )}
          {matches
            .sort((a, b) => {
              const order = { live: 0, upcoming: 1, finished: 2 }
              return order[a.status] - order[b.status]
            })
            .map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelect(m)}
                className={`w-full text-left rounded-xl px-4 py-3 transition-all border ${
                  selectedMatch?.id === m.id
                    ? 'bg-mx-green/10 border-mx-green-light'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                    Grupo {m.group_name}
                  </span>
                  {STATUS_BADGE[m.status]}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{m.home_flag}</span>
                  <span className="text-white text-sm font-semibold flex-1 truncate">
                    {m.home_team}
                  </span>
                  {m.status !== 'upcoming' ? (
                    <span className="font-display text-xl text-white px-1">
                      {m.home_score ?? 0}
                      <span className="text-neutral-500 mx-0.5">–</span>
                      {m.away_score ?? 0}
                    </span>
                  ) : (
                    <span className="text-neutral-500 text-xs">{formatKickOff(m.kick_off)}</span>
                  )}
                  <span className="text-white text-sm font-semibold flex-1 text-right truncate">
                    {m.away_team}
                  </span>
                  <span className="text-xl">{m.away_flag}</span>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
