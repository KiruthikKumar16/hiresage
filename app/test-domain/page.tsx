export default function TestDomain() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Domain Test</h1>
        <p className="text-gray-600">Current domain: {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</p>
        <p className="text-gray-600 mt-2">Full URL: {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
      </div>
    </div>
  )
} 