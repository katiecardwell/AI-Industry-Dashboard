import { commodities } from '../mockData';

function ChangeCell({ value, trend }) {
  const isUp = trend === 'up';
  return (
    <span
      className="inline-flex items-center gap-0.5 text-sm font-semibold"
      style={{ color: isUp ? '#16a34a' : '#C0392B' }}
    >
      {isUp ? '▲' : '▼'} {value}
    </span>
  );
}

export default function CommodityPrices() {
  const highRisk = commodities.filter((c) => c.trend30d === 'up' && parseFloat(c.change30d) > 5);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Commodity Prices</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Key input commodities — current price, 30-day, and year-over-year change
        </p>
      </div>

      {/* Alert banner */}
      {highRisk.length > 0 && (
        <div
          className="mb-4 flex items-start gap-3 p-4 rounded-lg border"
          style={{ backgroundColor: 'rgba(192,57,43,0.05)', borderColor: 'rgba(192,57,43,0.2)' }}
        >
          <span className="text-lg flex-shrink-0">⚠</span>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#C0392B' }}>
              Input Cost Alert — {highRisk.length} commodity{highRisk.length > 1 ? 'ies' : 'y'} up &gt;5% in 30 days
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {highRisk.map((c) => c.name).join(', ')} — monitor portfolio company margin exposure
            </div>
          </div>
        </div>
      )}

      {/* Main table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Spot Prices</h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            <span className="text-xs text-gray-500">Updated Nov 15, 2025</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Commodity</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Unit</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Price</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">30d Change</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">YoY Change</th>
                <th className="px-5 py-3 hidden lg:table-cell"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commodities.map((c, i) => {
                const isHighAlert = c.trend30d === 'up' && parseFloat(c.change30d) > 5;
                return (
                  <tr
                    key={i}
                    className={`hover:bg-gray-50 transition-colors ${isHighAlert ? '' : ''}`}
                    style={isHighAlert ? { backgroundColor: 'rgba(192,57,43,0.02)' } : {}}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {isHighAlert && (
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#C0392B' }}></span>
                        )}
                        <span className="font-semibold text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 hidden sm:table-cell text-xs">{c.unit}</td>
                    <td className="px-5 py-4 text-right font-mono font-semibold text-gray-900">
                      {typeof c.price === 'number' && c.price > 1000
                        ? c.price.toLocaleString()
                        : c.price}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ChangeCell value={c.change30d} trend={c.trend30d} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ChangeCell value={c.changeYoY} trend={c.trendYoY} />
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {isHighAlert && (
                        <span
                          className="text-xs px-2 py-0.5 rounded font-medium"
                          style={{ backgroundColor: 'rgba(192,57,43,0.1)', color: '#C0392B' }}
                        >
                          Monitor
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100">
          <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>
            View historical data →
          </button>
        </div>
      </div>

      {/* Margin impact analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Most Exposed Sectors</div>
          <div className="space-y-2.5">
            {[
              { sector: 'Breakfast Cereal', commodity: 'Corn, Wheat', exposure: 'High' },
              { sector: 'Confectionery', commodity: 'Cocoa, Sugar', exposure: 'Very High' },
              { sector: 'Coffee & Cafes', commodity: 'Arabica Coffee', exposure: 'High' },
              { sector: 'Dairy / Yogurt', commodity: 'Milk Class III', exposure: 'Medium' },
            ].map((row) => (
              <div key={row.sector} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">{row.sector}</div>
                  <div className="text-xs text-gray-400">{row.commodity}</div>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: row.exposure === 'Very High' ? 'rgba(192,57,43,0.1)' :
                      row.exposure === 'High' ? 'rgba(245,158,11,0.1)' : 'rgba(59,125,216,0.1)',
                    color: row.exposure === 'Very High' ? '#C0392B' :
                      row.exposure === 'High' ? '#d97706' : '#3B7DD8',
                  }}
                >
                  {row.exposure}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">YoY Winners</div>
          <div className="space-y-2">
            {commodities
              .filter((c) => c.trendYoY === 'down')
              .map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-800">{c.name}</span>
                  <span className="text-sm font-semibold text-green-600">{c.changeYoY}</span>
                </div>
              ))}
          </div>
          <div className="text-xs text-gray-400 mt-3">↓ lower prices = cost tailwind</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">YoY Headwinds</div>
          <div className="space-y-2">
            {commodities
              .filter((c) => c.trendYoY === 'up')
              .sort((a, b) => parseFloat(b.changeYoY) - parseFloat(a.changeYoY))
              .slice(0, 5)
              .map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-800">{c.name}</span>
                  <span className="text-sm font-semibold" style={{ color: '#C0392B' }}>{c.changeYoY}</span>
                </div>
              ))}
          </div>
          <div className="text-xs text-gray-400 mt-3">↑ higher prices = margin pressure</div>
        </div>
      </div>
    </div>
  );
}
