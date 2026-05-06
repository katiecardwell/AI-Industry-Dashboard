import { searchTrends, socialBuzz } from '../mockData';

function TrendArrow({ momentum }) {
  return momentum === 'up' ? (
    <span className="text-green-500 font-bold">↑</span>
  ) : (
    <span style={{ color: '#C0392B' }} className="font-bold">↓</span>
  );
}

function SearchIndexBar({ index }) {
  const color = index >= 75 ? '#22c55e' : index >= 50 ? '#3B7DD8' : '#f59e0b';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${index}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-gray-600 w-6 text-right">{index}</span>
    </div>
  );
}

export default function ConsumerTrends() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Consumer Trends</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Search interest, social buzz, and category momentum signals
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Google Search Interest */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Google Search Interest</h3>
              <p className="text-xs text-gray-500 mt-0.5">Relative search index (0–100) vs. 1-year ago</p>
            </div>
            <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Search Index</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">vs 1yr Ago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {searchTrends.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-800 font-medium">{row.category}</td>
                    <td className="px-5 py-3 w-36">
                      <SearchIndexBar index={row.index} />
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-semibold">
                      <span style={{ color: row.momentum === 'up' ? '#16a34a' : '#C0392B' }}>
                        <TrendArrow momentum={row.momentum} /> {row.change1yr}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Social Media Buzz */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Social Media Buzz</h3>
              <p className="text-xs text-gray-500 mt-0.5">7-day volume and trending hashtags / topics</p>
            </div>
            <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Topic / Hashtag</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Platform</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">7d Volume</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {socialBuzz.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-gray-800">{row.topic}</div>
                      <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{row.topContent}</div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 hidden md:table-cell">{row.platform}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800">{row.volume7d}</td>
                    <td className="px-5 py-3 text-right font-semibold">
                      <span style={{ color: row.momentum === 'up' ? '#16a34a' : '#C0392B' }}>
                        <TrendArrow momentum={row.momentum} /> {row.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trend Signal Summary */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Category Signal Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-2">Accelerating ↑</div>
            <ul className="space-y-1">
              {['GLP-1 Friendly Foods (+340%)', 'Prebiotic Soda (+112%)', 'Adaptogen Drinks (+87%)', 'Functional Beverages (+54%)', 'High Protein Snacks (+38%)'].map((item) => (
                <li key={item} className="text-xs text-gray-700 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-green-400 flex-shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-2">Stable / Growing →</div>
            <ul className="space-y-1">
              {['Collagen Peptides (+31%)', 'Clean Label (+33%)', 'Grass-Fed Beef (+19%)', 'Freeze-Dried Meals (+22%)', 'Air-Fried Snacks (+11%)'].map((item) => (
                <li key={item} className="text-xs text-gray-700 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'rgba(192,57,43,0.04)', borderColor: 'rgba(192,57,43,0.15)' }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#C0392B' }}>Decelerating ↓</div>
            <ul className="space-y-1">
              {['Plant-Based Meat (-29%)', 'Keto Snacks (-14%)', 'Oat Milk (-8%)', 'Beyond Meat (-31% social)'].map((item) => (
                <li key={item} className="text-xs text-gray-700 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: '#C0392B' }}></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
