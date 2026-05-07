import { useApiData } from '../hooks/useApiData';
import { LiveBadge, LoadingRows, ErrorState } from './DataState';

function TrendArrow({ momentum }) {
  if (momentum === 'up') return <span className="text-green-500 font-bold">↑</span>;
  if (momentum === 'down') return <span className="text-red-500 font-bold">↓</span>;
  return <span className="text-gray-400">→</span>;
}

function PlatformPips({ platform = '' }) {
  const icons = { Reddit: '🔴', YouTube: '▶', TikTok: '♪', Instagram: '📷', Twitter: '𝕏' };
  const parts = platform.split(/\s*\/\s*/);
  return (
    <span className="text-xs text-gray-500">
      {parts.map((p) => {
        const key = Object.keys(icons).find((k) => p.includes(k));
        return key ? `${icons[key]} ${p}` : p;
      }).join(' / ')}
    </span>
  );
}

export default function ConsumerTrends() {
  const { data: trends, loading, error } = useApiData('trends');

  const searchTrends = trends?.searchTrends || [];
  const socialBuzz = trends?.socialBuzz || [];
  const sources = trends?.sources || {};

  const accelerating = searchTrends.filter((t) => t.momentum === 'up').length;
  const decelerating = searchTrends.filter((t) => t.momentum === 'down').length;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Consumer Trends</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Search interest &amp; social momentum — Google Trends, Reddit
            {sources.youtube ? ', YouTube' : ''}
          </p>
        </div>
        {trends && <LiveBadge />}
      </div>

      {error ? (
        <ErrorState error={error} label="consumer trends" />
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Google Search Interest */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Google Search Interest</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Index 0–100 · % change vs 1yr ago (US)</p>
                </div>
                <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>View all →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-t border-b border-gray-100">
                      {['Category', 'Trend', 'Index', '1yr Change'].map((h) => (
                        <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <LoadingRows cols={4} rows={8} />
                    ) : searchTrends.length === 0 ? (
                      <tr><td colSpan={4}><ErrorState error="No trend data" label="search trends" /></td></tr>
                    ) : (
                      searchTrends.map((t) => (
                        <tr key={t.category} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 text-gray-800 font-medium">{t.category}</td>
                          <td className="px-5 py-3"><TrendArrow momentum={t.momentum} /></td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-20">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${t.index}%`, backgroundColor: t.momentum === 'up' ? '#3B7DD8' : t.momentum === 'down' ? '#C0392B' : '#9ca3af' }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-700">{t.index}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className="text-xs font-semibold"
                              style={{ color: t.momentum === 'up' ? '#16a34a' : t.momentum === 'down' ? '#C0392B' : '#6b7280' }}
                            >
                              {t.change1yr}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Social Media Buzz */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Social Media Buzz</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    7-day engagement — Reddit{sources.youtube ? ' + YouTube' : ''}
                  </p>
                </div>
                <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>View all →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-t border-b border-gray-100">
                      {['Topic', 'Platform', 'Volume (7d)', 'Change', 'Top Content'].map((h) => (
                        <th key={h} className={`text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === 'Top Content' ? 'hidden xl:table-cell' : ''}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <LoadingRows cols={5} rows={8} />
                    ) : socialBuzz.length === 0 ? (
                      <tr><td colSpan={5}><ErrorState error="No buzz data" label="social buzz" /></td></tr>
                    ) : (
                      socialBuzz.map((s) => (
                        <tr key={s.topic} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-semibold text-gray-800">{s.topic}</td>
                          <td className="px-5 py-3"><PlatformPips platform={s.platform} /></td>
                          <td className="px-5 py-3 text-gray-700 font-medium">{s.volume7d}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-semibold ${s.momentum === 'up' ? 'text-green-600' : s.momentum === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                              {s.change}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-500 hidden xl:table-cell max-w-48 truncate">{s.topContent}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Signal summary */}
          {!loading && searchTrends.length > 0 && (
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Signal Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{accelerating}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Accelerating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-400">{searchTrends.length - accelerating - decelerating}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Stable</div>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#C0392B' }}>{decelerating}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Decelerating</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400 text-center">
                Based on Google Trends data — US, last 12 months
                {!sources.youtube && (
                  <span className="ml-2 text-amber-500">· Add GOOGLE_API_KEY to .env to enable YouTube signals</span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
