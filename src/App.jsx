import { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Overview from './components/Overview';
import Transactions from './components/Transactions';
import ConsumerTrends from './components/ConsumerTrends';
import CommodityPrices from './components/CommodityPrices';
import AIInsights from './components/AIInsights';
import Watchlists from './components/Watchlists';
import './index.css';

const SECTIONS = {
  'overview': Overview,
  'transactions': Transactions,
  'consumer-trends': ConsumerTrends,
  'commodity-prices': CommodityPrices,
  'ai-insights': AIInsights,
  'watchlists': Watchlists,
};

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const ActiveComponent = SECTIONS[activeSection] || Overview;

  const contentLeft = sidebarCollapsed ? '64px' : '240px';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <TopNav
        activeSection={activeSection}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <main
        className="min-h-screen pt-14 transition-all duration-200"
        style={{ marginLeft: contentLeft }}
      >
        <div className="p-6 max-w-screen-2xl mx-auto">
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}
