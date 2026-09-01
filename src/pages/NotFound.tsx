export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-v1-cream">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-v1-dark mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <a href="/" className="px-6 py-3 bg-v1-teal text-white rounded-lg hover:bg-opacity-90">
          Go Home
        </a>
      </div>
    </div>
  )
}