import { useState } from 'react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: '⊞' },
  { id: 'transactions', label: 'Transactions', icon: '↔' },
  { id: 'consumer-trends', label: 'Consumer Trends', icon: '↗' },
  { id: 'commodity-prices', label: 'Commodity Prices', icon: '◈' },
  { id: 'ai-insights', label: 'AI Insights', icon: '◎' },
  { id: 'watchlists', label: 'Watchlists', icon: '★' },
];

export default function Sidebar({ activeSection, setActiveSection, collapsed, setCollapsed }) {
  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        style={{ backgroundColor: '#1B2B5E', width: collapsed ? '64px' : '240px' }}
        className="fixed left-0 top-0 h-full z-30 flex flex-col transition-all duration-200 select-none"
      >
        {/* Logo / Brand */}
        <div
          className="flex items-center gap-3 px-4 py-5 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div
            className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: '#3B7DD8' }}
          >
            PE
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-white font-semibold text-sm leading-tight whitespace-nowrap">
                PE Intel
              </div>
              <div className="text-xs whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Industry Dashboard
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-white/50 hover:text-white transition-colors flex-shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {!collapsed && (
            <div
              className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Navigation
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                  active
                    ? 'text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                style={active ? { backgroundColor: 'rgba(59,125,216,0.25)', borderRight: '3px solid #3B7DD8' } : {}}
              >
                <span className="text-base flex-shrink-0 w-5 text-center leading-none">
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="p-4 border-t text-xs"
          style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}
        >
          {!collapsed && (
            <div className="space-y-1">
              <div>Data as of Nov 15, 2025</div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"></span>
                All systems operational
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
