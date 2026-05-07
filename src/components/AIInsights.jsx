import { useApiData } from '../hooks/useApiData';
import { LiveBadge, LoadingRows, ErrorState, LoadingCards } from './DataState';

function ScoreBar({ score }) {
  const color = score >= 85 ? '#16a34a' : score >= 70 ? '#3B7DD8' : '#f59e0b';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold w-6 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

export default function AIInsights() {
  const { data: opportunities, loading, error } = useApiData('insights');
  const topOpps = opportunities ? opportunities.slice(0, 5) : [];

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Opportunity pipeline scored by Claude — updated using live news &amp; trend data
          </p>
        </div>
        {opportunities && <LiveBadge />}
        <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white ml-auto" style={{ backgroundColor: '#3B7DD8' }}>
          AI-Generated
        </span>
      </div>

      {/* Summary strip */}
      {opportunities && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Companies Screened', value: '847', sub: 'This quarter' },
            { label: 'Active Opportunities', value: opportunities.filter((o) => o.score >= 65).length.toString(), sub: 'Score ≥ 65' },
            { label: 'Avg. Opportunity Score', value: Math.round(topOpps.reduce((s, o) => s + o.score, 0) / (topOpps.length || 1)).toString(), sub: 'Top 5 targets' },
            { label: 'Est. Deployable Capital', value: '$6.1B', sub: 'Pipeline value' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-xs text-gray-500">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Opportunity pipeline table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Opportunity Pipeline</h3>
          <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Company', 'Sub-Sector', 'Opportunity Score', 'Est. EV', 'Revenue', 'Entry Multiple'].map((h, i) => (
                  <th key={h} className={`text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 0 ? '' : i === 2 ? 'w-40' : i >= 3 ? 'hidden lg:table-cell text-right' : 'hidden md:table-cell'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <LoadingRows cols={6} rows={7} />
              ) : error ? (
                <tr><td colSpan={6}><ErrorState error={error} label="AI insights" /></td></tr>
              ) : (
                opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-gray-900">{opp.company}</td>
                    <td className="px-5 py-4 text-gray-500 hidden md:table-cell text-xs">{opp.subSector}</td>
                    <td className="px-5 py-4 w-40"><ScoreBar score={opp.score} /></td>
                    <td className="px-5 py-4 text-right text-gray-800 font-medium hidden lg:table-cell">{opp.ev}</td>
                    <td className="px-5 py-4 text-right text-gray-600 hidden lg:table-cell">{opp.revenue}</td>
                    <td className="px-5 py-4 text-right text-gray-600 hidden lg:table-cell text-xs">{opp.entryMultiple}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investment thesis cards */}
      {loading ? (
        <LoadingCards count={3} />
      ) : !error && topOpps.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Top Opportunities — Investment Theses</h3>
          {topOpps.map((opp) => {
            const scoreColor = opp.score >= 85 ? '#16a34a' : opp.score >= 70 ? '#3B7DD8' : '#f59e0b';
            return (
              <div key={opp.id} className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-base font-semibold text-gray-900">{opp.company}</h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{opp.subSector}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 flex-wrap">
                      <span>EV: <strong className="text-gray-700">{opp.ev}</strong></span>
                      <span>Revenue: <strong className="text-gray-700">{opp.revenue}</strong></span>
                      <span>EBITDA: <strong className="text-gray-700">{opp.ebitdaMargin}</strong></span>
                      <span>Entry: <strong className="text-gray-700">{opp.entryMultiple}</strong></span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2"
                      style={{ borderColor: scoreColor, color: scoreColor, backgroundColor: `${scoreColor}18` }}
                    >
                      {opp.score}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Score</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{opp.thesis}</p>
                <div className="flex flex-wrap gap-2">
                  {(opp.keyDrivers || []).map((driver) => (
                    <span
                      key={driver}
                      className="text-xs px-2.5 py-1 rounded-full border font-medium"
                      style={{ borderColor: '#3B7DD8', color: '#3B7DD8', backgroundColor: 'rgba(59,125,216,0.06)' }}
                    >
                      {driver}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
