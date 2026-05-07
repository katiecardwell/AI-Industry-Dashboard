import KPIBar from './KPIBar';
import { useApiData } from '../hooks/useApiData';
import { LiveBadge, LoadingRows, LoadingCards, ErrorState } from './DataState';
import { distressItems, exitItems } from '../mockData';

function TagBadge({ tag }) {
  const colors = {
    Regulatory: 'bg-purple-100 text-purple-700',
    Earnings: 'bg-blue-100 text-blue-700',
    Commodity: 'bg-orange-100 text-orange-700',
    'Consumer Trends': 'bg-teal-100 text-teal-700',
    Distress: 'bg-red-100 text-red-700',
    Growth: 'bg-green-100 text-green-700',
    'M&A': 'bg-indigo-100 text-indigo-700',
  };
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${colors[tag] || 'bg-gray-100 text-gray-600'}`}>
      {tag}
    </span>
  );
}

function SectionHeader({ title, subtitle, link = 'View all →', live }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div>
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {live && <LiveBadge />}
      </div>
      <button className="text-xs font-medium hover:underline flex-shrink-0" style={{ color: '#3B7DD8' }}>{link}</button>
    </div>
  );
}

const TX_TYPE_COLORS = {
  Acquisition: 'bg-blue-100 text-blue-700', Buyout: 'bg-indigo-100 text-indigo-700',
  'Distressed Sale': 'bg-red-100 text-red-700', 'Growth Equity': 'bg-green-100 text-green-700',
};

export default function Overview() {
  const { data: news, loading: newsLoading, error: newsError } = useApiData('news');
  const { data: deals, loading: dealsLoading, error: dealsError } = useApiData('deals');

  const recentTx = deals ? deals.slice(0, 5) : [];
  const recentNews = news ? news.slice(0, 4) : [];

  return (
    <div>
      <KPIBar deals={deals} news={news} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="px-5 pt-5 pb-3">
            <SectionHeader
              title="Recent Transactions"
              subtitle="Last 90 days — live from news & SEC filings"
              live={!!deals}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-b border-gray-100 bg-gray-50">
                  {['Date', 'Target', 'Buyer / Investor', 'Type', 'EV / Amount'].map((h, i) => (
                    <th key={h} className={`text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 2 ? 'hidden md:table-cell' : ''} ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dealsLoading ? (
                  <LoadingRows cols={5} rows={5} />
                ) : dealsError ? (
                  <tr><td colSpan={5}><ErrorState error={dealsError} label="transactions" /></td></tr>
                ) : recentTx.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">No recent transactions found.</td></tr>
                ) : (
                  recentTx.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {tx.date ? new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-800">{tx.target}</td>
                      <td className="px-5 py-3 text-gray-600 hidden md:table-cell">{tx.buyer}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${TX_TYPE_COLORS[tx.type] || 'bg-gray-100 text-gray-600'}`}>{tx.type}</span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-800">{tx.evAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>
              View all {deals ? deals.length : ''} transactions →
            </button>
          </div>
        </div>

        {/* Distress & Exit Monitor — static watchlist data */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 pt-5 pb-3">
            <SectionHeader title="Distress & Exit Monitor" />
          </div>
          <div className="px-5 mb-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Distress Watch</div>
            <div className="space-y-2">
              {distressItems.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5 p-2.5 rounded"
                  style={{ backgroundColor: item.severity === 'high' ? 'rgba(192,57,43,0.05)' : 'rgba(245,158,11,0.05)' }}>
                  <span className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.severity === 'high' ? '#C0392B' : '#f59e0b' }} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800">{item.company}</div>
                    <div className="text-xs font-medium" style={{ color: item.severity === 'high' ? '#C0392B' : '#d97706' }}>{item.signal}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 pb-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Recent Exits</div>
            <div className="space-y-1.5">
              {exitItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{item.company}</div>
                    <div className="text-xs text-gray-500">→ {item.buyer}</div>
                  </div>
                  {item.moic !== 'N/A' && (
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">{item.moic}</div>
                      <div className="text-xs text-gray-400">MOIC</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top News */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200">
        <div className="px-5 pt-5 pb-3">
          <SectionHeader title="Top News" subtitle="AI-summarized by Claude — last 21 days" live={!!news} />
        </div>

        {newsLoading ? (
          <div className="px-5 pb-5"><LoadingCards count={4} /></div>
        ) : newsError ? (
          <div className="px-5 pb-5"><ErrorState error={newsError} label="news" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {recentNews.map((item, i) => (
              <div key={item.id} className={`p-5 ${i >= 2 ? 'border-t border-gray-100' : ''}`}>
                <div className="flex items-start gap-3">
                  {item.urgent && (
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: '#C0392B' }} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <TagBadge tag={item.tag} />
                      <span className="text-xs text-gray-400">{item.source}</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-800 mb-1 leading-snug">{item.headline}</div>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-100">
          <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>View all news →</button>
        </div>
      </div>
    </div>
  );
}
