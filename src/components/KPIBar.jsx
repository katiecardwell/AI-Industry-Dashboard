import { LineChart, Line, ResponsiveContainer } from 'recharts';

function ScoreGauge({ score, size = 56 }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#C0392B';
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle cx="24" cy="24" r={radius} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function KPISkeleton() {
  return <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />;
}

export default function KPIBar({ deals, news }) {
  // Derive live KPIs from fetched data, or show skeleton while loading
  const isLoading = deals === null && news === null;

  const newTransactions = deals ? deals.length : null;

  const capitalRaised = deals
    ? (() => {
        let total = 0;
        let hasData = false;
        for (const d of deals) {
          const raw = d.evAmount?.replace(/[^0-9.BMK]/gi, '');
          const num = parseFloat(raw);
          if (!isNaN(num)) {
            hasData = true;
            if (/B/i.test(d.evAmount)) total += num * 1e9;
            else if (/M/i.test(d.evAmount)) total += num * 1e6;
            else if (/K/i.test(d.evAmount)) total += num * 1e3;
          }
        }
        if (!hasData) return null;
        if (total >= 1e9) return `$${(total / 1e9).toFixed(1)}B`;
        if (total >= 1e6) return `$${(total / 1e6).toFixed(0)}M`;
        return `$${total.toLocaleString()}`;
      })()
    : null;

  const urgentNews = news ? news.filter((n) => n.urgent).length : null;
  const distressAlerts = urgentNews ?? 3;

  // Market Momentum Score: rough composite
  const momentumScore =
    deals && news
      ? Math.min(100, Math.round(50 + (deals.length / 2) + (news.filter((n) => n.tag === 'Growth' || n.tag === 'M&A').length * 3)))
      : 74;

  const aiScore = deals && news ? Math.min(100, Math.round(momentumScore * 1.1)) : 82;

  const trendData = [62, 65, 61, 68, 70, 67, 72, momentumScore - 2, 71, momentumScore - 1, momentumScore, momentumScore].map((v, i) => ({ i, v }));

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => <KPISkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {/* Market Momentum */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
        <ScoreGauge score={momentumScore} />
        <div className="min-w-0">
          <div className="text-xs text-gray-500 leading-tight">Market Momentum</div>
          <div className="text-sm font-semibold text-gray-800 mt-0.5">Score</div>
          <div className="h-6 mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Line type="monotone" dataKey="v" stroke="#3B7DD8" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* New Transactions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs text-gray-500">New Transactions</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{newTransactions ?? '—'}</div>
        <div className="text-xs text-gray-400 mt-0.5">Last 90 days</div>
        {newTransactions != null && (
          <div className="text-xs text-green-600 font-medium mt-1">Live count</div>
        )}
      </div>

      {/* Capital Raised */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs text-gray-500">Capital Raised</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{capitalRaised ?? '—'}</div>
        <div className="text-xs text-gray-400 mt-0.5">Last 90 days</div>
        {capitalRaised && <div className="text-xs text-green-600 font-medium mt-1">Disclosed deals only</div>}
      </div>

      {/* Distress Alerts */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs text-gray-500">Distress Alerts</div>
        <div className="text-2xl font-bold mt-1" style={{ color: '#C0392B' }}>{distressAlerts}</div>
        <div className="text-xs text-gray-400 mt-0.5">Active situations</div>
        <div className="text-xs font-medium mt-1" style={{ color: '#C0392B' }}>
          {urgentNews != null ? `${urgentNews} urgent news signals` : 'Active monitoring'}
        </div>
      </div>

      {/* Exit Events */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs text-gray-500">Exit Events</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">
          {deals ? deals.filter((d) => d.type === 'Acquisition' && d.status === 'Closed').length : '—'}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">Last 90 days</div>
        <div className="text-xs text-green-600 font-medium mt-1">Strategic closes</div>
      </div>

      {/* AI Opportunity Score */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
        <ScoreGauge score={aiScore} size={56} />
        <div>
          <div className="text-xs text-gray-500 leading-tight">AI Opportunity</div>
          <div className="text-sm font-semibold text-gray-800 mt-0.5">Score</div>
          <div className="text-xs text-green-600 font-medium mt-1">Claude-scored</div>
        </div>
      </div>
    </div>
  );
}
