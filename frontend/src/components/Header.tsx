interface HeaderProps {
  onMenuToggle?: () => void
  title?: string
  subtitle?: string
}

export function Header({ onMenuToggle, title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-v1-dark">{title || 'App'}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {onMenuToggle && (
        <button onClick={onMenuToggle} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </header>
  )
}