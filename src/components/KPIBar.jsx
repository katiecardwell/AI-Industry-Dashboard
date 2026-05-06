import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { kpiData } from '../mockData';

function ScoreGauge({ score, size = 56 }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#C0392B';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

const trendData = kpiData.momentumTrend.map((v, i) => ({ i, v }));

export default function KPIBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {/* Market Momentum */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
        <ScoreGauge score={kpiData.marketMomentumScore} />
        <div className="min-w-0">
          <div className="text-xs text-gray-500 leading-tight">Market Momentum</div>
          <div className="text-sm font-semibold text-gray-800 mt-0.5">Score</div>
          <div className="h-6 mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#3B7DD8"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* New Transactions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs text-gray-500">New Transactions</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{kpiData.newTransactions90d}</div>
        <div className="text-xs text-gray-400 mt-0.5">Last 90 days</div>
        <div className="text-xs text-green-600 font-medium mt-1">↑ 12% vs prior period</div>
      </div>

      {/* Capital Raised */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs text-gray-500">Capital Raised</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{kpiData.capitalRaised90d}</div>
        <div className="text-xs text-gray-400 mt-0.5">Last 90 days</div>
        <div className="text-xs text-green-600 font-medium mt-1">↑ 8% vs prior period</div>
      </div>

      {/* Distress Alerts */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs text-gray-500">Distress Alerts</div>
        <div className="text-2xl font-bold mt-1" style={{ color: '#C0392B' }}>
          {kpiData.distressAlerts}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">Active situations</div>
        <div className="text-xs font-medium mt-1" style={{ color: '#C0392B' }}>
          ↑ 1 new this week
        </div>
      </div>

      {/* Exit Events */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs text-gray-500">Exit Events</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{kpiData.exitEvents}</div>
        <div className="text-xs text-gray-400 mt-0.5">Last 90 days</div>
        <div className="text-xs text-green-600 font-medium mt-1">2 strategic exits ≥ 8x MOIC</div>
      </div>

      {/* AI Opportunity Score */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
        <ScoreGauge score={kpiData.aiOpportunityScore} size={56} />
        <div>
          <div className="text-xs text-gray-500 leading-tight">AI Opportunity</div>
          <div className="text-sm font-semibold text-gray-800 mt-0.5">Score</div>
          <div className="text-xs text-green-600 font-medium mt-1">5 active targets</div>
        </div>
      </div>
    </div>
  );
}
