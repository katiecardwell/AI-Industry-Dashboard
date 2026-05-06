import { useState, useMemo } from 'react';
import { transactions } from '../mockData';

const TYPE_OPTIONS = ['All Types', 'Acquisition', 'Buyout', 'Growth Equity', 'Minority Stake', 'Distressed Sale', 'Carve-out', 'Series D'];
const DATE_OPTIONS = ['All Time', 'Last 30 days', 'Last 60 days', 'Last 90 days'];
const SECTOR_OPTIONS = ['All Sectors', 'Beverages', 'Snacks', 'Dairy', 'Protein', 'Frozen Food', 'Supplements', 'Plant-Based', 'Meal Kits', 'Condiments'];

const STATUS_COLORS = {
  Closed: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Rumored: 'bg-gray-100 text-gray-600',
};

const TYPE_COLORS = {
  Acquisition: 'bg-blue-100 text-blue-700',
  Buyout: 'bg-indigo-100 text-indigo-700',
  'Growth Equity': 'bg-green-100 text-green-700',
  'Minority Stake': 'bg-teal-100 text-teal-700',
  'Distressed Sale': 'bg-red-100 text-red-700',
  'Carve-out': 'bg-orange-100 text-orange-700',
  'Series D': 'bg-purple-100 text-purple-700',
};

export default function Transactions() {
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [sectorFilter, setSectorFilter] = useState('All Sectors');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const now = new Date('2025-11-15');
    return transactions.filter((tx) => {
      if (typeFilter !== 'All Types' && tx.type !== typeFilter) return false;
      if (sectorFilter !== 'All Sectors' && tx.sector !== sectorFilter) return false;
      if (search && !tx.target.toLowerCase().includes(search.toLowerCase()) &&
          !tx.buyer.toLowerCase().includes(search.toLowerCase())) return false;
      if (dateFilter !== 'All Time') {
        const days = dateFilter === 'Last 30 days' ? 30 : dateFilter === 'Last 60 days' ? 60 : 90;
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - days);
        if (new Date(tx.date) < cutoff) return false;
      }
      return true;
    });
  }, [typeFilter, dateFilter, sectorFilter, search]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          M&A deals, capital raises, and exits in Food & Beverage
        </p>
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

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-blue-400"
        >
          {TYPE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-blue-400"
        >
          {SECTOR_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-blue-400"
        >
          {DATE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>

        <div className="text-sm text-gray-500 ml-auto whitespace-nowrap">
          {filtered.length} results
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Target Company</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Buyer / Investor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Sector</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">EV / Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{tx.target}</td>
                  <td className="px-5 py-3.5 text-gray-600 hidden lg:table-cell">{tx.buyer}</td>
                  <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">
                    <span className="text-xs">{tx.sector}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${TYPE_COLORS[tx.type] || 'bg-gray-100 text-gray-600'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-gray-900">{tx.evAmount}</td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[tx.status] || 'bg-gray-100 text-gray-600'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">
            No transactions match your filters.
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">Showing {filtered.length} of {transactions.length} transactions</span>
          <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>
            Export CSV →
          </button>
        </div>
      </div>
    </div>
  );
}
