import { useState, useMemo } from 'react';
import { useApiData } from '../hooks/useApiData';
import { LiveBadge, LoadingRows, ErrorState } from './DataState';

const TYPE_OPTIONS = ['All Types', 'Acquisition', 'Buyout', 'Growth Equity', 'Minority Stake', 'Distressed Sale', 'Carve-out', 'Series D', 'Series C', 'Series B', 'Recap'];
const DATE_OPTIONS = ['All Time', 'Last 30 days', 'Last 60 days', 'Last 90 days'];
const SECTOR_OPTIONS = ['All Sectors', 'Beverages', 'Snacks', 'Dairy', 'Protein', 'Frozen Food', 'Supplements', 'Plant-Based', 'Meal Kits', 'Condiments', 'Baked Goods', 'Other'];

const STATUS_COLORS = {
  Closed:  'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Rumored: 'bg-gray-100 text-gray-600',
};
const TYPE_COLORS = {
  Acquisition:    'bg-blue-100 text-blue-700',
  Buyout:         'bg-indigo-100 text-indigo-700',
  'Growth Equity':'bg-green-100 text-green-700',
  'Minority Stake':'bg-teal-100 text-teal-700',
  'Distressed Sale':'bg-red-100 text-red-700',
  'Carve-out':    'bg-orange-100 text-orange-700',
  'Series D':     'bg-purple-100 text-purple-700',
  'Series C':     'bg-purple-100 text-purple-700',
  'Series B':     'bg-violet-100 text-violet-700',
};

export default function Transactions() {
  const { data: transactions, loading, error } = useApiData('deals');
  const [typeFilter, setTypeFilter]     = useState('All Types');
  const [dateFilter, setDateFilter]     = useState('All Time');
  const [sectorFilter, setSectorFilter] = useState('All Sectors');
  const [search, setSearch]             = useState('');

  const filtered = useMemo(() => {
    if (!transactions) return [];
    const now = new Date();
    return transactions.filter((tx) => {
      if (typeFilter !== 'All Types' && tx.type !== typeFilter) return false;
      if (sectorFilter !== 'All Sectors' && tx.sector !== sectorFilter) return false;
      if (search && !tx.target?.toLowerCase().includes(search.toLowerCase()) &&
                    !tx.buyer?.toLowerCase().includes(search.toLowerCase())) return false;
      if (dateFilter !== 'All Time') {
        const days = dateFilter === 'Last 30 days' ? 30 : dateFilter === 'Last 60 days' ? 60 : 90;
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        if (new Date(tx.date) < cutoff) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, dateFilter, sectorFilter, search]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
          <p className="text-sm text-gray-500 mt-0.5">Live M&A deals extracted from news &amp; SEC filings via Claude</p>
        </div>
        {transactions && <LiveBadge />}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <input
            type="text"
            placeholder="Search company or buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded px-3 py-2 pl-8 focus:outline-none focus:border-blue-400"
          />
          <span className="absolute left-2.5 top-2.5 text-gray-400 text-sm">⌕</span>
        </div>
        {[
          { value: typeFilter, setter: setTypeFilter, options: TYPE_OPTIONS },
          { value: sectorFilter, setter: setSectorFilter, options: SECTOR_OPTIONS },
          { value: dateFilter, setter: setDateFilter, options: DATE_OPTIONS },
        ].map(({ value, setter, options }) => (
          <select
            key={options[0]}
            value={value}
            onChange={(e) => setter(e.target.value)}
            className="text-sm border border-gray-200 rounded px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-blue-400"
          >
            {options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ))}
        <div className="text-sm text-gray-500 ml-auto whitespace-nowrap">
          {loading ? '…' : `${filtered.length} results`}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Date', 'Target Company', 'Buyer / Investor', 'Sector', 'Type', 'EV / Amount', 'Status'].map((h, i) => (
                  <th
                    key={h}
                    className={`text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap
                      ${i === 2 ? 'hidden lg:table-cell' : ''}
                      ${i === 3 ? 'hidden md:table-cell' : ''}
                      ${i === 5 ? 'text-right' : ''}
                      ${i === 6 ? 'hidden md:table-cell' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <LoadingRows cols={7} rows={10} />
              ) : error ? (
                <tr><td colSpan={7}><ErrorState error={error} label="transactions" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                    {transactions?.length === 0 ? 'No deals found in the last 90 days.' : 'No transactions match your filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                      {tx.date ? new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-900">{tx.target}</td>
                    <td className="px-5 py-3.5 text-gray-600 hidden lg:table-cell">{tx.buyer}</td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell text-xs">{tx.sector}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${TYPE_COLORS[tx.type] || 'bg-gray-100 text-gray-600'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-gray-900">{tx.evAmount}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[tx.status] || 'bg-gray-100 text-gray-600'}`}>
                        {tx.status || '—'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {!loading && transactions ? `Showing ${filtered.length} of ${transactions.length} transactions` : ''}
          </span>
          <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>
            Export CSV →
          </button>
        </div>
      </div>
    </div>
  );
}
