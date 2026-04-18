import { useState } from 'react'
import useStore from './store/useStore'
import Header from './components/Header'
import PhaseNav from './components/PhaseNav'
import RegisterScreen from './components/RegisterScreen'
import MatchSelector from './components/MatchSelector'
import AntesPage from './pages/AntesPage'
import DurantePage from './pages/DurantePage'
import DespuesPage from './pages/DespuesPage'
import PremiosPage from './pages/PremiosPage'

const BOTTOM_TABS = [
  { id: 'partidos', label: 'Partidos', icon: '⚽' },
  { id: 'premios',  label: 'Premios',  icon: '🎁' },
]

export default function App() {
  const { guest, selectedMatch, currentPhase, setCurrentPhase, clearMatch } = useStore()
  const [globalTab, setGlobalTab] = useState('partidos')

  if (!guest) return <RegisterScreen />

  return (
    <div className="min-h-screen bg-neutral-950 font-body">
      <div className="max-w-mobile mx-auto relative">
        <Header />

        {/* ── Main content ── */}
        {globalTab === 'premios' ? (
          <PremiosPage />
        ) : !selectedMatch ? (
          <MatchSelector />
        ) : (
          <>
            <PhaseNav current={currentPhase} onChange={setCurrentPhase} />

            <div className="pb-6">
              {currentPhase === 'antes'   && <AntesPage />}
              {currentPhase === 'durante' && <DurantePage />}
              {currentPhase === 'despues' && <DespuesPage />}
            </div>

            <div className="px-4 pb-24 text-center">
              <button
                onClick={clearMatch}
                className="text-neutral-600 hover:text-neutral-400 text-xs underline underline-offset-2 transition-colors"
              >
                ← Cambiar partido
              </button>
            </div>
          </>
        )}

        {/* ── Bottom navigation ── */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 flex z-30">
          {BOTTOM_TABS.map((tab) => {
            const active = globalTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setGlobalTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-semibold tracking-wide transition-colors ${
                  active ? 'text-mx-green-light' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <span className={`text-xl leading-none transition-transform ${active ? 'scale-110' : ''}`}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
