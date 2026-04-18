import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import { useTimer } from '../hooks/useTimer'

function CountdownUnit({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-display text-4xl text-white w-16 bg-neutral-800 rounded-xl py-2 tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <p className="text-[10px] text-neutral-500 mt-1 tracking-widest">{label}</p>
    </div>
  )
}

const RESULT_OPTIONS = (match) => [
  {
    value: 'home',
    label: `${match.home_flag} ${match.home_team}`,
    accent: 'border-blue-500 text-blue-300 bg-blue-500/10',
  },
  {
    value: 'draw',
    label: '🤝 Empate',
    accent: 'border-yellow-500 text-yellow-300 bg-yellow-500/10',
  },
  {
    value: 'away',
    label: `${match.away_flag} ${match.away_team}`,
    accent: 'border-mx-red text-red-300 bg-mx-red/10',
  },
]

export default function AntesPage() {
  const { guest, selectedMatch } = useStore()
  const timeLeft = useTimer(selectedMatch?.kick_off)
  const [prediction, setPrediction] = useState(null)
  const [loadingPred, setLoadingPred] = useState(true)
  const [form, setForm] = useState({ result: '', home: '', away: '', homeHT: '', awayHT: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!guest?.id || !selectedMatch?.id) return
    supabase
      .from('predictions')
      .select('*')
      .eq('guest_id', guest.id)
      .eq('match_id', selectedMatch.id)
      .maybeSingle()
      .then(({ data }) => {
        setPrediction(data)
        setLoadingPred(false)
      })
  }, [guest?.id, selectedMatch?.id])

  if (!selectedMatch) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.result || saving) return
    setSaving(true)

    const toInt = (v) => (v !== '' && !isNaN(parseInt(v)) ? parseInt(v) : null)

    const { data, error } = await supabase
      .from('predictions')
      .insert({
        guest_id: guest.id,
        match_id: selectedMatch.id,
        predicted_result: form.result,
        predicted_home: toInt(form.home),
        predicted_away: toInt(form.away),
        predicted_home_ht: toInt(form.homeHT),
        predicted_away_ht: toInt(form.awayHT),
      })
      .select()
      .single()

    if (!error) setPrediction(data)
    setSaving(false)
  }

  const resultLabel = (val) => {
    if (!prediction) return ''
    if (val === 'home') return selectedMatch.home_team
    if (val === 'away') return selectedMatch.away_team
    return 'Empate'
  }

  const pointsPreview = () => {
    let pts = 0
    if (prediction?.predicted_result) pts += 100
    if (prediction?.predicted_home !== null && prediction?.predicted_away !== null) pts += 200
    if (prediction?.predicted_home_ht !== null && prediction?.predicted_away_ht !== null) pts += 50
    return pts
  }

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Countdown */}
      {timeLeft && !timeLeft.isFinished && (
        <div className="bg-neutral-900 rounded-2xl p-5 text-center">
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-4">
            El partido comienza en
          </p>
          <div className="flex justify-center gap-3">
            {timeLeft.days > 0 && <CountdownUnit value={timeLeft.days} label="DÍAS" />}
            <CountdownUnit value={timeLeft.hours} label="HRS" />
            <CountdownUnit value={timeLeft.minutes} label="MIN" />
            <CountdownUnit value={timeLeft.seconds} label="SEG" />
          </div>
        </div>
      )}

      {/* Match card */}
      <div className="bg-neutral-900 rounded-2xl p-5">
        <p className="text-[10px] text-neutral-400 uppercase tracking-widest text-center mb-4">
          Grupo {selectedMatch.group_name} ·{' '}
          {new Date(selectedMatch.kick_off).toLocaleDateString('es-MX', {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Cancun',
          })}
        </p>
        <div className="flex items-center justify-around">
          <div className="text-center">
            <span className="text-5xl">{selectedMatch.home_flag}</span>
            <p className="text-white font-semibold text-sm mt-2">{selectedMatch.home_team}</p>
          </div>
          <span className="font-display text-3xl text-neutral-600">VS</span>
          <div className="text-center">
            <span className="text-5xl">{selectedMatch.away_flag}</span>
            <p className="text-white font-semibold text-sm mt-2">{selectedMatch.away_team}</p>
          </div>
        </div>
      </div>

      {/* Prediction saved */}
      {!loadingPred && prediction ? (
        <div className="bg-neutral-900 rounded-2xl p-5 border border-mx-green">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-mx-green rounded-full flex items-center justify-center text-white text-xs font-bold">
              ✓
            </div>
            <p className="text-mx-green-light font-semibold">Predicción guardada</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Ganador</span>
              <span className="text-white font-semibold">{resultLabel(prediction.predicted_result)}</span>
            </div>
            {prediction.predicted_home !== null && prediction.predicted_away !== null && (
              <div className="flex justify-between">
                <span className="text-neutral-400">Marcador final</span>
                <span className="text-white font-semibold">
                  {prediction.predicted_home} – {prediction.predicted_away}
                </span>
              </div>
            )}
            {prediction.predicted_home_ht !== null && prediction.predicted_away_ht !== null && (
              <div className="flex justify-between">
                <span className="text-neutral-400">Marcador descanso</span>
                <span className="text-white font-semibold">
                  {prediction.predicted_home_ht} – {prediction.predicted_away_ht}
                </span>
              </div>
            )}
          </div>
          <div className="mt-4 bg-neutral-800 rounded-xl p-3 text-center">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
              Puntos máximos posibles
            </p>
            <p className="font-display text-3xl text-mx-green-light mt-0.5">
              {pointsPreview()} pts
            </p>
          </div>
        </div>
      ) : !loadingPred ? (
        /* Prediction form */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Winner */}
          <div className="bg-neutral-900 rounded-2xl p-5">
            <p className="text-sm font-semibold text-white mb-3">¿Quién gana? *</p>
            <div className="space-y-2">
              {RESULT_OPTIONS(selectedMatch).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, result: opt.value }))}
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    form.result === opt.value
                      ? opt.accent
                      : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Final score */}
          <div className="bg-neutral-900 rounded-2xl p-5">
            <p className="text-sm font-semibold text-white">Marcador final</p>
            <p className="text-xs text-neutral-500 mb-3">
              Opcional · <span className="text-mx-green-light">+200 pts</span> si aciertas
            </p>
            <ScoreInput
              homeTeam={selectedMatch.home_team}
              awayTeam={selectedMatch.away_team}
              homeFlag={selectedMatch.home_flag}
              awayFlag={selectedMatch.away_flag}
              homeVal={form.home}
              awayVal={form.away}
              onHome={(v) => setForm((f) => ({ ...f, home: v }))}
              onAway={(v) => setForm((f) => ({ ...f, away: v }))}
            />
          </div>

          {/* Halftime score */}
          <div className="bg-neutral-900 rounded-2xl p-5">
            <p className="text-sm font-semibold text-white">Marcador al descanso</p>
            <p className="text-xs text-neutral-500 mb-3">
              Opcional · <span className="text-mx-green-light">+50 pts</span> si aciertas
            </p>
            <ScoreInput
              homeTeam={selectedMatch.home_team}
              awayTeam={selectedMatch.away_team}
              homeFlag={selectedMatch.home_flag}
              awayFlag={selectedMatch.away_flag}
              homeVal={form.homeHT}
              awayVal={form.awayHT}
              onHome={(v) => setForm((f) => ({ ...f, homeHT: v }))}
              onAway={(v) => setForm((f) => ({ ...f, awayHT: v }))}
            />
          </div>

          {/* Points info */}
          <div className="bg-neutral-900/50 rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1.5">
              Puntos posibles
            </p>
            <ScoreRow label="Acertar ganador" pts="100" active={!!form.result} />
            <ScoreRow
              label="Marcador final exacto"
              pts="+200"
              active={form.home !== '' && form.away !== ''}
            />
            <ScoreRow
              label="Marcador descanso exacto"
              pts="+50"
              active={form.homeHT !== '' && form.awayHT !== ''}
            />
          </div>

          <button
            type="submit"
            disabled={saving || !form.result}
            className="w-full bg-mx-green hover:bg-mx-green-light active:scale-95 disabled:opacity-40 disabled:scale-100 text-white font-display text-2xl tracking-wider py-4 rounded-xl transition-all"
          >
            {saving ? 'GUARDANDO...' : 'GUARDAR PREDICCIÓN'}
          </button>
        </form>
      ) : null}
    </div>
  )
}

function ScoreInput({ homeTeam, awayTeam, homeFlag, awayFlag, homeVal, awayVal, onHome, onAway }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 text-center">
        <p className="text-[10px] text-neutral-500 mb-1.5 truncate">
          {homeFlag} {homeTeam}
        </p>
        <input
          type="number"
          min="0"
          max="20"
          value={homeVal}
          onChange={(e) => onHome(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl text-center text-white text-2xl font-bold py-3 focus:outline-none focus:border-mx-green-light transition-colors"
          placeholder="0"
        />
      </div>
      <span className="font-display text-2xl text-neutral-600">–</span>
      <div className="flex-1 text-center">
        <p className="text-[10px] text-neutral-500 mb-1.5 truncate">
          {awayFlag} {awayTeam}
        </p>
        <input
          type="number"
          min="0"
          max="20"
          value={awayVal}
          onChange={(e) => onAway(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl text-center text-white text-2xl font-bold py-3 focus:outline-none focus:border-mx-green-light transition-colors"
          placeholder="0"
        />
      </div>
    </div>
  )
}

function ScoreRow({ label, pts, active }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={active ? 'text-neutral-300' : 'text-neutral-600'}>{label}</span>
      <span className={active ? 'text-mx-green-light font-bold' : 'text-neutral-600'}>
        {pts} pts
      </span>
    </div>
  )
}
