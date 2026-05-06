import { watchlists } from '../mockData';

const CARD_COLORS = {
  platformTargets: { accent: '#3B7DD8', bg: 'rgba(59,125,216,0.06)', border: 'rgba(59,125,216,0.2)' },
  addonTargets: { accent: '#16a34a', bg: 'rgba(22,163,74,0.06)', border: 'rgba(22,163,74,0.2)' },
  distressWatch: { accent: '#C0392B', bg: 'rgba(192,57,43,0.06)', border: 'rgba(192,57,43,0.2)' },
  newThisWeek: { accent: '#7c3aed', bg: 'rgba(124,58,237,0.06)', border: 'rgba(124,58,237,0.2)' },
};

const ICONS = {
  platformTargets: '🏗',
  addonTargets: '➕',
  distressWatch: '⚠',
  newThisWeek: '✦',
};

function WatchlistCard({ id, data }) {
  const colors = CARD_COLORS[id];
  const icon = ICONS[id];

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col">
      {/* Header */}
      <div
        className="px-5 py-4 rounded-t-lg border-b"
        style={{ backgroundColor: colors.bg, borderColor: colors.border }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{icon}</span>
            <h3 className="text-sm font-semibold text-gray-800">{data.label}</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: colors.accent }}>{data.count}</div>
            <div className="text-xs text-gray-400">companies</div>
          </div>
        </div>
        {data.newThisWeek > 0 && data.label !== 'New This Week' && (
          <div className="mt-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
              style={{ backgroundColor: colors.accent }}
            >
              +{data.newThisWeek} new this week
            </span>
          </div>
        )}
      </div>

      {/* Company list */}
      <div className="flex-1 divide-y divide-gray-50">
        {data.companies.map((company, i) => (
          <div key={i} className="px-5 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">{company.name}</div>
              <div className="text-xs text-gray-400">{company.sector}</div>
            </div>
            <div className="text-xs text-gray-400 flex-shrink-0 ml-3">
              {new Date(company.addedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100">
        <button className="text-xs font-medium hover:underline" style={{ color: colors.accent }}>
          View all {data.count} →
        </button>
      </div>
    </div>
  );
}

export default function Watchlists() {
  const totalCompanies = Object.values(watchlists).reduce((sum, w) => sum + w.count, 0);
  const totalNew = Object.values(watchlists)
    .filter((_, k) => Object.keys(watchlists)[k] !== 'newThisWeek')
    .reduce((sum, w) => sum + w.newThisWeek, 0);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Watchlists</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Track platform targets, add-ons, distress situations, and new additions
          </p>
        </div>
        <div className="flex gap-3">
          <div className="text-center px-4 py-2 bg-white rounded-lg border border-gray-200">
            <div className="text-xl font-bold text-gray-900">{totalCompanies - watchlists.newThisWeek.count}</div>
            <div className="text-xs text-gray-500">Total Tracked</div>
          </div>
          <div className="text-center px-4 py-2 bg-white rounded-lg border border-gray-200">
            <div className="text-xl font-bold" style={{ color: '#7c3aed' }}>{watchlists.newThisWeek.count}</div>
            <div className="text-xs text-gray-500">New This Week</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {Object.entries(watchlists).map(([id, data]) => (
          <WatchlistCard key={id} id={id} data={data} />
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Recent Watchlist Activity</h3>
          <button className="text-xs font-medium hover:underline" style={{ color: '#3B7DD8' }}>
            View all →
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { action: 'Added to Platform Targets', company: "Farmer's Business Network (Food Div.)", user: 'J. Davis', time: '2h ago', type: 'add' },
            { action: 'Added to Platform Targets', company: 'Utz Brands', user: 'M. Chen', time: '1d ago', type: 'add' },
            { action: 'Added to Add-on Targets', company: 'Chomps', user: 'J. Davis', time: '3d ago', type: 'add' },
            { action: 'Updated distress rating', company: 'B&G Foods', user: 'System', time: '4d ago', type: 'alert' },
            { action: 'Added to Distress Watch', company: "Farmer's Fridge", user: 'K. Park', time: '4d ago', type: 'alert' },
          ].map((event, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{
                  backgroundColor: event.type === 'add' ? 'rgba(59,125,216,0.1)' : 'rgba(192,57,43,0.1)',
                  color: event.type === 'add' ? '#3B7DD8' : '#C0392B',
                }}
              >
                {event.type === 'add' ? '+' : '!'}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-500">{event.action}: </span>
                <span className="text-xs font-semibold text-gray-800">{event.company}</span>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-gray-500">{event.user}</div>
                <div className="text-xs text-gray-400">{event.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
