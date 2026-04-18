import useStore from './store/useStore'
import Header from './components/Header'
import PhaseNav from './components/PhaseNav'
import RegisterScreen from './components/RegisterScreen'
import MatchSelector from './components/MatchSelector'
import AntesPage from './pages/AntesPage'
import DurantePage from './pages/DurantePage'
import DespuesPage from './pages/DespuesPage'

export default function App() {
  const { guest, selectedMatch, currentPhase, setCurrentPhase, clearMatch } = useStore()

  if (!guest) return <RegisterScreen />

  return (
    <div className="min-h-screen bg-neutral-950 font-body">
      <div className="max-w-mobile mx-auto relative">
        <Header />

        {!selectedMatch ? (
          <MatchSelector />
        ) : (
          <>
            <PhaseNav current={currentPhase} onChange={setCurrentPhase} />

            <div className="pb-6">
              {currentPhase === 'antes' && <AntesPage />}
              {currentPhase === 'durante' && <DurantePage />}
              {currentPhase === 'despues' && <DespuesPage />}
            </div>

            <div className="px-4 pb-6 text-center">
              <button
                onClick={clearMatch}
                className="text-neutral-600 hover:text-neutral-400 text-xs underline underline-offset-2 transition-colors"
              >
                ← Cambiar partido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
