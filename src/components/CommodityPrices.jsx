import { useApiData } from '../hooks/useApiData';
import { LiveBadge, LoadingRows, ErrorState } from './DataState';

export default function CommodityPrices() {
  const { data: commodities, loading, error } = useApiData('commodities');

  const alertItems = commodities
    ? commodities.filter((c) => {
        const val = parseFloat(c.change30d);
        return !isNaN(val) && Math.abs(val) > 5;
      })
    : [];

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Commodity Prices</h2>
          <p className="text-sm text-gray-500 mt-0.5">Key input costs for F&B — live futures data</p>
        </div>
        {commodities && <LiveBadge />}
      </div>

      {alertItems.length > 0 && (
        <div
          className="mb-4 px-4 py-3 rounded-lg border text-sm flex items-start gap-2"
          style={{ backgroundColor: 'rgba(192,57,43,0.05)', borderColor: 'rgba(192,57,43,0.2)' }}
        >
          <span style={{ color: '#C0392B' }} className="font-bold flex-shrink-0">!</span>
          <span className="text-gray-700">
            <strong style={{ color: '#C0392B' }}>Margin alert:</strong>{' '}
            {alertItems.map((c) => `${c.name} ${c.change30d} (30d)`).join(' · ')}
          </span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Commodity', 'Unit', 'Current Price', '30-Day Change', 'YoY Change', 'Last Updated'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <LoadingRows cols={6} rows={8} />
              ) : error ? (
                <tr>
                  <td colSpan={6}>
                    <ErrorState error={error} label="commodity prices" />
                  </td>
                </tr>
              ) : (
                commodities.map((c) => {
                  const c30 = parseFloat(c.change30d);
                  const cYoY = parseFloat(c.changeYoY);
                  const colorClass30 = isNaN(c30) ? 'text-gray-500' : c30 >= 0 ? 'text-red-600' : 'text-green-600';
                  const colorClassYoY = isNaN(cYoY) ? 'text-gray-500' : cYoY >= 0 ? 'text-red-600' : 'text-green-600';
                  return (
                    <tr key={c.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-900">{c.name}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{c.unit}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        {typeof c.price === 'number' ? c.price.toFixed(2) : c.price}
                      </td>
                      <td className={`px-5 py-3.5 font-semibold ${colorClass30}`}>
                        {c.change30d === 'N/A' ? <span className="text-gray-400">N/A</span> : c.change30d}
                      </td>
                      <td className={`px-5 py-3.5 font-semibold ${colorClassYoY}`}>
                        {c.changeYoY === 'N/A' ? <span className="text-gray-400">N/A</span> : c.changeYoY}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{c.lastUpdated}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Red = cost increase (margin headwind) · Green = cost decrease (margin tailwind)
          </span>
          <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>
            View all →
          </button>
        </div>
      </div>

      {commodities && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Snack Manufacturers', items: ['Corn', 'Soybean Oil', 'Raw Sugar (#11)'] },
            { label: 'Beverage Companies', items: ['Coffee (Arabica)', 'Raw Sugar (#11)', 'Cocoa'] },
            { label: 'Protein / Dairy', items: ['Milk (Class III)', 'Lean Hogs', 'Wheat (SRW)'] },
          ].map((panel) => {
            const relevant = commodities.filter((c) => panel.items.includes(c.name));
            const headwinds = relevant.filter((c) => {
              const v = parseFloat(c.change30d);
              return !isNaN(v) && v > 2;
            });
            return (
              <div key={panel.label} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{panel.label}</div>
                <div className="space-y-2">
                  {relevant.map((c) => {
                    const v = parseFloat(c.change30d);
                    const isHead = !isNaN(v) && v > 2;
                    return (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700">{c.name}</span>
                        <span className={`font-semibold ${isHead ? 'text-red-600' : 'text-green-600'}`}>
                          {c.change30d}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div
                  className="mt-3 text-xs px-2 py-1 rounded font-medium"
                  style={{
                    backgroundColor: headwinds.length > 1 ? 'rgba(192,57,43,0.08)' : 'rgba(34,197,94,0.08)',
                    color: headwinds.length > 1 ? '#C0392B' : '#16a34a',
                  }}
                >
                  {headwinds.length > 1 ? `${headwinds.length} headwinds active` : 'Favourable input costs'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
