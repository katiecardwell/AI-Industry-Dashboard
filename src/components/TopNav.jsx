import { useState } from 'react';

const SECTION_TITLES = {
  'overview': 'Overview',
  'transactions': 'Transactions',
  'consumer-trends': 'Consumer Trends',
  'commodity-prices': 'Commodity Prices',
  'ai-insights': 'AI Insights',
  'watchlists': 'Watchlists',
};

export default function TopNav({ activeSection, sidebarCollapsed, setSidebarCollapsed }) {
  const [alertsOpen, setAlertsOpen] = useState(false);

  const alerts = [
    { text: 'B&G Foods covenant breach warning', type: 'high', time: '2h ago' },
    { text: 'Corn futures +14% — snack margin risk', type: 'high', time: '4h ago' },
    { text: 'FreshRealm sale process update', type: 'medium', time: '6h ago' },
  ];

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center gap-4 px-6 h-14 bg-white border-b border-gray-200"
      style={{ left: sidebarCollapsed ? '64px' : '240px', transition: 'left 0.2s' }}
    >
      {/* Mobile menu toggle */}
      <button
        className="lg:hidden text-gray-500 hover:text-gray-700"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        ☰
      </button>

      {/* Page title */}
      <div className="flex items-center gap-2">
        <h1 className="text-base font-semibold text-gray-800">
          {SECTION_TITLES[activeSection] || 'Dashboard'}
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Industry selector */}
      <select
        className="text-sm border border-gray-200 rounded px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-blue-400"
        defaultValue="food-beverage"
      >
        <option value="food-beverage">Food & Beverage</option>
        <option value="healthcare">Healthcare</option>
        <option value="consumer">Consumer Products</option>
        <option value="tech">Technology</option>
      </select>

      {/* Date */}
      <div className="text-sm text-gray-500 hidden sm:block">
        Nov 15, 2025
      </div>

      {/* Alerts */}
      <div className="relative">
        <button
          onClick={() => setAlertsOpen(!alertsOpen)}
          className="relative p-2 rounded hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span
            className="absolute top-1 right-1 w-4 h-4 text-white text-xs rounded-full flex items-center justify-center font-medium"
            style={{ backgroundColor: '#C0392B', fontSize: '10px' }}
          >
            3
          </span>
        </button>

        {alertsOpen && (
          <div className="absolute right-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-800">Alerts</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: '#C0392B' }}
              >
                3 new
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {alerts.map((alert, i) => (
                <div key={i} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: alert.type === 'high' ? '#C0392B' : '#f59e0b', marginTop: '6px' }}
                    />
                    <div>
                      <p className="text-sm text-gray-700">{alert.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-gray-100">
              <button className="text-xs text-blue-500 hover:text-blue-600">View all alerts →</button>
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <button className="flex items-center gap-2 hover:bg-gray-100 rounded px-2 py-1 transition-colors">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
          style={{ backgroundColor: '#1B2B5E' }}
        >
          JD
        </div>
        <span className="text-sm text-gray-700 hidden sm:block">J. Davis</span>
      </button>
    </header>
  );
}
