import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import { useMatch } from '../hooks/useMatch'
import { useRanking } from '../hooks/useRanking'

const MOMENT_TYPES = [
  { type: 'gol', label: '⚽ ¡GOL!', cls: 'bg-mx-green hover:bg-mx-green-light' },
  { type: 'ambiente', label: '🎉 Ambiente', cls: 'bg-blue-700 hover:bg-blue-600' },
  { type: 'grupo', label: '🤝 Mi grupo', cls: 'bg-violet-700 hover:bg-violet-600' },
  { type: 'reaccion', label: '😱 Reacción', cls: 'bg-orange-700 hover:bg-orange-600' },
]

const MEDAL = ['🥇', '🥈', '🥉']

export default function DurantePage() {
  const { guest, selectedMatch: stored } = useStore()
  const { match: live } = useMatch(stored?.id)
  const ranking = useRanking(stored?.id)
  const [offers, setOffers] = useState([])
  const [momentFeedback, setMomentFeedback] = useState('')

  const match = live ?? stored

  useEffect(() => {
    if (!stored?.id) return
    supabase
      .from('flash_offers')
      .select('*')
      .eq('match_id', stored.id)
      .eq('active', true)
      .order('created_at')
      .then(({ data }) => setOffers(data ?? []))
  }, [stored?.id])

  const saveMoment = async (type) => {
    if (!guest?.id || !match?.id) return
    await supabase.from('moments').insert({ guest_id: guest.id, match_id: match.id, type })
    setMomentFeedback(type)
    setTimeout(() => setMomentFeedback(''), 1800)
  }

  if (!match) return null

  const isLive = match.status === 'live'
  const myRankPos = ranking.findIndex((r) => r.guest_id === guest?.id)

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Scoreboard */}
      <div className="bg-neutral-900 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <>
                <span className="w-2 h-2 bg-mx-red rounded-full animate-pulse" />
                <span className="text-xs font-bold text-mx-red tracking-wider">EN VIVO</span>
              </>
            ) : (
              <span className="text-xs text-neutral-500 tracking-wider uppercase">
                {match.status === 'finished' ? 'Finalizado' : 'Próximo'}
              </span>
            )}
          </div>
          {match.minute != null && (
            <span className="font-display text-lg text-white">{match.minute}'</span>
          )}
        </div>

        <div className="flex items-center">
          <div className="flex-1 text-center">
            <span className="text-5xl">{match.home_flag}</span>
            <p className="text-white text-sm font-semibold mt-2">{match.home_team}</p>
          </div>
          <div className="text-center px-2">
            <div className="font-display text-5xl text-white tabular-nums">
              <span>{match.home_score ?? 0}</span>
              <span className="text-neutral-600 mx-1">–</span>
              <span>{match.away_score ?? 0}</span>
            </div>
          </div>
          <div className="flex-1 text-center">
            <span className="text-5xl">{match.away_flag}</span>
            <p className="text-white text-sm font-semibold mt-2">{match.away_team}</p>
          </div>
        </div>
      </div>

      {/* Flash offers */}
      {offers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-mx-red text-sm">🔥</span>
            <p className="text-xs font-bold text-neutral-300 uppercase tracking-widest">
              Ofertas Flash
            </p>
          </div>
          <div className="space-y-2">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-neutral-900 border border-mx-red/25 rounded-2xl p-4 flex gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{offer.title}</p>
                  {offer.description && (
                    <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
                      {offer.description}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-neutral-500 line-through text-xs">
                    {offer.currency} {Number(offer.original_price).toLocaleString()}
                  </p>
                  <p className="text-mx-red font-bold text-lg leading-none">
                    {offer.currency} {Number(offer.sale_price).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Moments */}
      <div>
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
          Captura el momento
        </p>
        {momentFeedback && (
          <div className="bg-mx-green/15 border border-mx-green/40 rounded-xl px-3 py-2 text-center text-mx-green-light text-sm mb-2 transition-all">
            ✓ Momento guardado
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {MOMENT_TYPES.map(({ type, label, cls }) => (
            <button
              key={type}
              onClick={() => saveMoment(type)}
              className={`${cls} active:scale-95 text-white font-semibold py-3.5 rounded-xl transition-all text-sm`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            Ranking en Tiempo Real
          </p>
          {myRankPos >= 0 && (
            <span className="text-xs text-neutral-400">
              Tu posición:{' '}
              <span className="text-mx-green-light font-bold">#{myRankPos + 1}</span>
            </span>
          )}
        </div>
        <div className="bg-neutral-900 rounded-2xl overflow-hidden">
          {ranking.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🎯</p>
              <p className="text-neutral-500 text-sm">
                El ranking aparecerá cuando finalice el partido
              </p>
            </div>
          ) : (
            ranking.slice(0, 10).map((entry, i) => (
              <div
                key={entry.guest_id}
                className={`flex items-center px-4 py-3 ${
                  i < ranking.length - 1 ? 'border-b border-neutral-800' : ''
                } ${entry.guest_id === guest?.id ? 'bg-mx-green/10' : ''}`}
              >
                <span
                  className={`font-display text-xl w-8 shrink-0 ${
                    i === 0
                      ? 'text-yellow-400'
                      : i === 1
                        ? 'text-neutral-300'
                        : i === 2
                          ? 'text-orange-400'
                          : 'text-neutral-600'
                  }`}
                >
                  {i < 3 ? MEDAL[i] : `${i + 1}`}
                </span>
                <div className="flex-1 ml-2 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {entry.name}
                    {entry.guest_id === guest?.id && (
                      <span className="text-mx-green-light text-xs ml-1">(tú)</span>
                    )}
                  </p>
                  <p className="text-neutral-500 text-xs">Hab. {entry.room_number}</p>
                </div>
                <span className="font-display text-xl text-mx-green-light ml-2">
                  {entry.total}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
