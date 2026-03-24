export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Login Disabled</h2>
        <p className="mt-2 text-sm text-gray-500">Authentication is temporarily suspended while we build core features. Please navigate straight to the dashboard!</p>
        <a href="/dashboard/inventory" className="mt-6 inline-block font-bold text-blue-600 hover:text-blue-500 underline">
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}
