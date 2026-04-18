import useStore from '../store/useStore'

export default function Header() {
  const { guest, logout } = useStore()

  return (
    <header className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5">
          <div className="w-1.5 h-8 bg-mx-green rounded-sm" />
          <div className="w-1.5 h-8 bg-white/90 rounded-sm" />
          <div className="w-1.5 h-8 bg-mx-red rounded-sm" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-white leading-none tracking-wider">
            MUNDIAL 2026
          </h1>
          <p className="text-[10px] text-neutral-400 leading-none mt-0.5">Resort Xcaret</p>
        </div>
      </div>

      {guest && (
        <button
          onClick={logout}
          className="text-right group"
          title="Cerrar sesión"
        >
          <p className="text-sm font-semibold text-white group-hover:text-neutral-300 transition-colors">
            {guest.name}
          </p>
          <p className="text-[10px] text-neutral-400">Hab. {guest.room_number}</p>
        </button>
      )}
    </header>
  )
}
