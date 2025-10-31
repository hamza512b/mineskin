export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">You're offline</h1>
        <p className="mb-8 text-gray-400">
          Please check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

