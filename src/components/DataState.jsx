export function LiveBadge({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      Live
    </span>
  );
}

export function LoadingRows({ cols = 4, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-5 py-3.5">
              <div className="h-3.5 bg-gray-100 rounded animate-pulse" style={{ width: `${55 + ((i * 3 + j * 7) % 35)}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function LoadingCards({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  );
}

export function ErrorState({ error, label = 'data' }) {
  const isKeyMissing = error?.includes('not configured');
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
      <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 text-lg">
        {isKeyMissing ? '🔑' : '!'}
      </div>
      <p className="text-sm font-medium text-gray-700">
        {isKeyMissing ? 'API key not configured' : `Could not load ${label}`}
      </p>
      <p className="text-xs text-gray-400 max-w-xs">
        {isKeyMissing
          ? 'Add the required key to your .env file and restart the server.'
          : error || 'An unexpected error occurred. Check server logs.'}
      </p>
    </div>
  );
}

export function LoadingKPI() {
  return (
    <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
  );
}
