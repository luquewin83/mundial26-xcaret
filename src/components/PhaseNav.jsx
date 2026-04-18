const PHASES = [
  { id: 'antes', label: 'ANTES', icon: '⏱' },
  { id: 'durante', label: 'DURANTE', icon: '⚽' },
  { id: 'despues', label: 'DESPUÉS', icon: '🏆' },
]

export default function PhaseNav({ current, onChange }) {
  return (
    <nav className="flex bg-neutral-950 border-b border-neutral-800 sticky top-[57px] z-10">
      {PHASES.map((phase) => {
        const active = current === phase.id
        return (
          <button
            key={phase.id}
            onClick={() => onChange(phase.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-semibold tracking-widest transition-all ${
              active
                ? 'text-mx-green-light border-b-2 border-mx-green-light'
                : 'text-neutral-500 hover:text-neutral-300 border-b-2 border-transparent'
            }`}
          >
            <span className="text-base leading-none">{phase.icon}</span>
            {phase.label}
          </button>
        )
      })}
    </nav>
  )
}
