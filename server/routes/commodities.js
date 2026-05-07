const express = require('express');
const axios = require('axios');
const cache = require('../cache');

const router = express.Router();
const TTL = 2 * 60 * 60 * 1000; // 2 hours — ~8 calls/refresh, stays well within FMP free tier

// FMP commodity symbols mapped to display names and units
const COMMODITY_MAP = [
  { symbol: 'CORN',  name: 'Corn',           unit: '$/bushel' },
  { symbol: 'WHEAT', name: 'Wheat (SRW)',     unit: '$/bushel' },
  { symbol: 'SUGAR', name: 'Raw Sugar (#11)', unit: 'cents/lb' },
  { symbol: 'COFFEE',name: 'Coffee (Arabica)',unit: 'cents/lb' },
  { symbol: 'COCOA', name: 'Cocoa',           unit: '$/MT' },
  { symbol: 'SOYBEAN_OIL', name: 'Soybean Oil', unit: 'cents/lb' },
  { symbol: 'LEAN_HOGS',   name: 'Lean Hogs',   unit: 'cents/lb' },
  { symbol: 'MILK',        name: 'Milk (Class III)', unit: '$/cwt' },
];

function fmtPct(val) {
  if (val == null || isNaN(val)) return 'N/A';
  const sign = val >= 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}

async function fetchHistoricalPrice(symbol, daysAgo, apiKey) {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const from = new Date(d.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = d.toISOString().slice(0, 10);
  const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}`;
  const res = await axios.get(url, {
    params: { from, to, apikey: apiKey },
    timeout: 8000,
  });
  const hist = res.data?.historical;
  return hist && hist.length ? hist[0].close : null;
}

router.get('/', async (req, res) => {
  const cached = cache.get('commodities');
  if (cached) return res.json(cached);

  if (!process.env.FMP_API_KEY) {
    return res.status(503).json({ error: 'FMP_API_KEY not configured' });
  }

  try {
    const apiKey = process.env.FMP_API_KEY;

    // Fetch current quotes for all commodities in one call
    const quotesRes = await axios.get('https://financialmodelingprep.com/api/v3/quotes/commodity', {
      params: { apikey: apiKey },
      timeout: 10000,
    });
    const quotes = quotesRes.data || [];
    const quoteMap = Object.fromEntries(quotes.map((q) => [q.symbol, q]));

    const results = await Promise.allSettled(
      COMMODITY_MAP.map(async ({ symbol, name, unit }) => {
        const quote = quoteMap[symbol];
        if (!quote) return null;

        const currentPrice = quote.price;
        const lastUpdated = new Date().toISOString().slice(0, 10);

        // Fetch historical prices for 30d and 1yr change computation
        const [price30d, price1yr] = await Promise.allSettled([
          fetchHistoricalPrice(symbol, 30, apiKey),
          fetchHistoricalPrice(symbol, 365, apiKey),
        ]);

        const p30 = price30d.status === 'fulfilled' ? price30d.value : null;
        const p1y = price1yr.status === 'fulfilled' ? price1yr.value : null;

        const change30dVal = p30 ? ((currentPrice - p30) / p30) * 100 : null;
        const changeYoYVal = p1y ? ((currentPrice - p1y) / p1y) * 100 : null;

        return {
          name,
          unit,
          price: currentPrice,
          change30d: fmtPct(change30dVal),
          changeYoY: fmtPct(changeYoYVal),
          trend30d: change30dVal == null ? 'flat' : change30dVal >= 0 ? 'up' : 'down',
          trendYoY: changeYoYVal == null ? 'flat' : changeYoYVal >= 0 ? 'up' : 'down',
          lastUpdated,
        };
      })
    );

    const commodities = results
      .map((r) => (r.status === 'fulfilled' ? r.value : null))
      .filter(Boolean);

    if (!commodities.length) {
      return res.status(503).json({ error: 'No commodity data returned from FMP' });
    }

    cache.set('commodities', commodities, TTL);
    res.json(commodities);
  } catch (err) {
    console.error('[commodities]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
