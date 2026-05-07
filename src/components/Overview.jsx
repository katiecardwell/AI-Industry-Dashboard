import KPIBar from './KPIBar';
import { transactions as mockTransactions, news as mockNews, distressItems, exitItems as mockExitItems } from '../mockData';
import { useLiveData } from '../useLiveData';

function SectionHeader({ title, subtitle, link = 'View all →' }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>
        {link}
      </button>
    </div>
  );
}

function TagBadge({ tag }) {
  const colors = {
    Regulatory: 'bg-purple-100 text-purple-700',
    Earnings: 'bg-blue-100 text-blue-700',
    Commodity: 'bg-orange-100 text-orange-700',
    'Consumer Trends': 'bg-teal-100 text-teal-700',
    Distress: 'bg-red-100 text-red-700',
    Growth: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${colors[tag] || 'bg-gray-100 text-gray-600'}`}>
      {tag}
    </span>
  );
}

export default function Overview() {
  const { data: dealsData } = useLiveData('/api/deals', { deals: mockTransactions }, 60 * 60 * 1000);
  const transactions = (dealsData?.deals ?? mockTransactions).map((d, i) => ({ ...d, id: d.id ?? i }));
  const recentTx = transactions.slice(0, 5);

  const { data: distressData } = useLiveData('/api/distress', { distress: distressItems, exits: mockExitItems }, 30 * 60 * 1000);
  const liveDistress = distressData?.distress ?? distressItems;
  const liveExits    = distressData?.exits    ?? mockExitItems;

  const { data: newsData, source: newsSource } = useLiveData('/api/news', { articles: mockNews });
  const liveArticles = newsData?.articles ?? mockNews;

  // Normalise: live API returns a flat object per article; mock uses id/headline/etc.
  const recentNews = liveArticles.slice(0, 4).map((a, i) => ({
    id: a.id ?? i,
    headline: a.headline ?? a.title,
    summary: a.summary ?? a.description ?? '',
    source: a.source,
    date: a.date ?? a.publishedAt,
    tag: a.tag ?? (a.tags?.[0] || 'Industry'),
    url: a.url ?? '#',
    urgent: a.urgent ?? false,
  }));

  return (
    <div>
      <KPIBar />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Transactions — spans 2 cols */}
        <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="px-5 pt-5 pb-3">
            <SectionHeader title="Recent Transactions" subtitle="Last 90 days — M&A, capital raises, exits" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Target</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Buyer / Investor</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">EV / Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">{tx.target}</td>
                    <td className="px-5 py-3 text-gray-600 hidden md:table-cell">{tx.buyer}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${
                        tx.type === 'Acquisition' ? 'bg-blue-100 text-blue-700' :
                        tx.type === 'Buyout' ? 'bg-indigo-100 text-indigo-700' :
                        tx.type === 'Distressed Sale' ? 'bg-red-100 text-red-700' :
                        tx.type === 'Growth Equity' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800">{tx.evAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>
              View all 38 transactions →
            </button>
          </div>
        </div>

        {/* Distress & Exit Monitor */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 pt-5 pb-3">
            <SectionHeader title="Distress & Exit Monitor" />
          </div>

          {/* Distress items */}
          <div className="px-5 mb-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Distress Watch</div>
            <div className="space-y-2">
              {liveDistress.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2.5 p-2.5 rounded"
                  style={{ backgroundColor: item.severity === 'high' ? 'rgba(192,57,43,0.05)' : 'rgba(245,158,11,0.05)' }}
                >
                  <span
                    className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: item.severity === 'high' ? '#C0392B' : '#f59e0b',
                      marginTop: '5px'
                    }}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800">{item.company}</div>
                    <div
                      className="text-xs font-medium"
                      style={{ color: item.severity === 'high' ? '#C0392B' : '#d97706' }}
                    >
                      {item.signal}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exit items */}
          <div className="px-5 pb-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Recent Exits</div>
            <div className="space-y-1.5">
              {liveExits.slice(0, 3).map((item) => (
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
          <SectionHeader
            title="Top News"
            subtitle={newsSource === 'live' ? 'Live via NewsAPI · refreshes every 15 min' : 'AI-summarized — mock data (add NEWS_API_KEY to go live)'}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {recentNews.map((item, i) => (
            <div
              key={item.id}
              className={`p-5 ${i >= 2 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="flex items-start gap-3">
                {item.urgent && (
                  <span
                    className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#C0392B', marginTop: '7px' }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <TagBadge tag={item.tag} />
                    <span className="text-xs text-gray-400">{item.source}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800 mb-1 leading-snug">
                    {item.headline}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.summary}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-gray-100">
          <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>
            View all news →
          </button>
        </div>
      </div>
    </div>
  );
}
