import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import { useRanking } from '../hooks/useRanking'

const PRIZES = [
  { icon: '🥇', prize: 'Cena para 2 en Xcaret Restaurant + Certificado VIP' },
  { icon: '🥈', prize: 'Snorkel Tour + Bebidas sin límite por un día' },
  { icon: '🥉', prize: 'Masaje en Spa Xcaret · 60 minutos' },
]

export default function DespuesPage() {
  const { guest, selectedMatch } = useStore()
  const ranking = useRanking(selectedMatch?.id)
  const [myPrediction, setMyPrediction] = useState(null)
  const [savedRating, setSavedRating] = useState(null)
  const [hoverRating, setHoverRating] = useState(0)
  const [nextMatch, setNextMatch] = useState(null)
  const [savingRating, setSavingRating] = useState(false)

  useEffect(() => {
    if (!guest?.id || !selectedMatch?.id) return

    supabase
      .from('predictions')
      .select('*')
      .eq('guest_id', guest.id)
      .eq('match_id', selectedMatch.id)
      .maybeSingle()
      .then(({ data }) => setMyPrediction(data))

    supabase
      .from('ratings')
      .select('*')
      .eq('guest_id', guest.id)
      .eq('match_id', selectedMatch.id)
      .maybeSingle()
      .then(({ data }) => setSavedRating(data))

    supabase
      .from('matches')
      .select('*')
      .eq('status', 'upcoming')
      .gt('kick_off', selectedMatch.kick_off)
      .order('kick_off', { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setNextMatch(data))
  }, [guest?.id, selectedMatch?.id])

  const handleRating = async (score) => {
    if (savedRating || savingRating || !guest?.id || !selectedMatch?.id) return
    setSavingRating(true)
    const { data } = await supabase
      .from('ratings')
      .insert({ guest_id: guest.id, match_id: selectedMatch.id, score })
      .select()
      .single()
    if (data) setSavedRating(data)
    setSavingRating(false)
  }

  if (!selectedMatch) return null

  const myRank = ranking.findIndex((r) => r.guest_id === guest?.id)
  const myEntry = ranking[myRank]
  const top3 = ranking.slice(0, 3)

  const resultText = () => {
    if (!myPrediction) return null
    const actual =
      selectedMatch.home_score > selectedMatch.away_score
        ? 'home'
        : selectedMatch.home_score < selectedMatch.away_score
          ? 'away'
          : 'draw'
    const correct = myPrediction.predicted_result === actual
    return correct ? '✓ Acertaste el resultado' : '✗ No acertaste el resultado'
  }

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Final result */}
      <div className="bg-neutral-900 rounded-2xl p-5 text-center">
        <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-3">
          Resultado Final · Grupo {selectedMatch.group_name}
        </p>
        <div className="flex items-center">
          <div className="flex-1 text-center">
            <span className="text-5xl">{selectedMatch.home_flag}</span>
            <p className="text-white text-sm font-semibold mt-2">{selectedMatch.home_team}</p>
          </div>
          <div className="font-display text-5xl text-white px-2 tabular-nums">
            {selectedMatch.home_score ?? 0}
            <span className="text-neutral-600 mx-1">–</span>
            {selectedMatch.away_score ?? 0}
          </div>
          <div className="flex-1 text-center">
            <span className="text-5xl">{selectedMatch.away_flag}</span>
            <p className="text-white text-sm font-semibold mt-2">{selectedMatch.away_team}</p>
          </div>
        </div>
      </div>

      {/* My result */}
      {myEntry && (
        <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-700">
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-3">
            Tu resultado
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">{myEntry.name}</p>
              <p className="text-neutral-400 text-xs mt-0.5">
                Posición #{myRank + 1} de {ranking.length}
              </p>
              {resultText() && (
                <p
                  className={`text-xs mt-1 ${resultText()?.startsWith('✓') ? 'text-mx-green-light' : 'text-neutral-500'}`}
                >
                  {resultText()}
                </p>
              )}
            </div>
            <div className="font-display text-4xl text-mx-green-light">{myEntry.total}</div>
          </div>
        </div>
      )}

      {/* Podium */}
      {top3.length > 0 && (
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
            Podio y Premios
          </p>
          <div className="space-y-2">
            {top3.map((entry, i) => (
              <div
                key={entry.guest_id}
                className={`bg-neutral-900 rounded-2xl p-4 flex items-center gap-3 ${
                  entry.guest_id === guest?.id ? 'border border-mx-green/50' : ''
                }`}
              >
                <span className="text-3xl shrink-0">{PRIZES[i].icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {entry.name}
                    {entry.guest_id === guest?.id && (
                      <span className="text-mx-green-light text-xs ml-1">(tú)</span>
                    )}
                  </p>
                  <p className="text-neutral-400 text-xs mt-0.5 leading-snug">{PRIZES[i].prize}</p>
                </div>
                <span className="font-display text-2xl text-mx-green-light shrink-0">
                  {entry.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div className="bg-neutral-900 rounded-2xl p-5">
        <p className="text-sm font-semibold text-white mb-0.5">
          ¿Cómo fue tu experiencia?
        </p>
        <p className="text-xs text-neutral-400 mb-4">Califica el partido en Xcaret</p>

        {savedRating ? (
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`text-2xl ${s <= savedRating.score ? 'text-yellow-400' : 'text-neutral-700'}`}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-mx-green-light text-sm font-semibold">
              ¡Gracias por tu valoración!
            </p>
          </div>
        ) : (
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => handleRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={savingRating}
                className={`text-4xl transition-all active:scale-90 disabled:opacity-50 ${
                  s <= (hoverRating || 0) ? 'text-yellow-400' : 'text-neutral-700'
                } hover:scale-110`}
              >
                ★
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Next match */}
      {nextMatch && (
        <div className="bg-neutral-900 rounded-2xl p-4">
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-3">
            Próximo partido
          </p>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{nextMatch.home_flag}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">
                {nextMatch.home_team} vs {nextMatch.away_team}
              </p>
              <p className="text-neutral-400 text-xs mt-0.5">
                Grupo {nextMatch.group_name} ·{' '}
                {new Date(nextMatch.kick_off).toLocaleDateString('es-MX', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'America/Cancun',
                })}
              </p>
            </div>
            <span className="text-2xl">{nextMatch.away_flag}</span>
          </div>
        </div>
      )}
    </div>
  )
}
