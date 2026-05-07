const express = require('express');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');
const cache = require('../cache');

const router = express.Router();
const TTL = 60 * 60 * 1000; // 1 hour

const SYSTEM_PROMPT = `You are a PE analyst assistant. Given news articles and SEC filing summaries about food & beverage M&A activity, extract structured deal records.

For each identifiable transaction, output a JSON object with:
- "date": ISO date string (YYYY-MM-DD) — use announcement date
- "target": target company name (clean, no legal suffixes unless needed for clarity)
- "buyer": acquiring company or lead investor name
- "type": one of ["Acquisition", "Buyout", "Growth Equity", "Minority Stake", "Distressed Sale", "Carve-out", "Series D", "Series C", "Series B", "IPO", "Recap"]
- "evAmount": enterprise value or deal amount as a string (e.g. "$1.2B", "$450M", "Undisclosed") — use "Undisclosed" if not stated
- "sector": one of ["Beverages", "Snacks", "Dairy", "Protein", "Frozen Food", "Supplements", "Plant-Based", "Meal Kits", "Condiments", "Baked Goods", "AgTech", "Other"]
- "status": one of ["Closed", "Pending", "Rumored"]

Only include deals where both a target company and acquirer/investor are clearly identified. Exclude financial advisory, debt financing, and non-M&A events.

Return ONLY a valid JSON array. No markdown, no commentary. If no deals are found, return an empty array [].`;

async function fetchNewsDeals(apiKey) {
  const queries = [
    '(food OR beverage OR snack OR protein OR dairy) AND (acquisition OR acquired OR merger OR "private equity" OR buyout OR "growth equity")',
    '(food OR beverage) AND ("strategic sale" OR "carve-out" OR "growth round" OR "series" OR "invested in" OR "stake")',
  ];

  const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const results = await Promise.allSettled(
    queries.map((q) =>
      axios.get('https://newsapi.org/v2/everything', {
        params: { q, language: 'en', sortBy: 'publishedAt', pageSize: 15, from, apiKey },
        timeout: 10000,
      })
    )
  );

  const articles = [];
  const seen = new Set();
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const a of r.value.data.articles || []) {
      if (!seen.has(a.url) && a.title !== '[Removed]' && a.description) {
        seen.add(a.url);
        articles.push(a);
      }
    }
  }
  return articles;
}

async function fetchEdgarDeals() {
  const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const res = await axios.get('https://efts.sec.gov/LATEST/search-index', {
    params: {
      q: '"merger agreement" OR "acquisition agreement" OR "purchase agreement"',
      forms: '8-K',
      dateRange: 'custom',
      startdt: from,
      hits: { hits: { _source: { period_of_report: 1 } } },
    },
    headers: { 'User-Agent': 'PE-Dashboard research@example.com' },
    timeout: 10000,
  });

  const hits = res.data?.hits?.hits || [];
  return hits.slice(0, 20).map((h) => ({
    entityName: h._source?.entity_name || 'Unknown',
    fileDate: h._source?.file_date || '',
    description: h._source?.period_of_report || '',
    formType: h._source?.form_type || '8-K',
  }));
}

async function extractDealsWithClaude(articles, edgarFilings) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const newsText = articles
    .slice(0, 12)
    .map((a, i) => `${i + 1}. [${a.publishedAt?.slice(0, 10)}] ${a.title}\n   ${a.description}`)
    .join('\n\n');

  const edgarText = edgarFilings.length
    ? '\n\nSEC EDGAR 8-K Filers (companies disclosing material events):\n' +
      edgarFilings.map((f) => `- ${f.entityName} (filed ${f.fileDate})`).join('\n')
    : '';

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [
      {
        role: 'user',
        content: `Extract all food & beverage M&A deals from the following sources:\n\n${newsText}${edgarText}`,
      },
    ],
  });

  return JSON.parse(msg.content[0].text);
}

router.get('/', async (req, res) => {
  const cached = cache.get('deals');
  if (cached) return res.json(cached);

  // Both NewsAPI and Claude needed for best results; NewsAPI alone gives partial results
  if (!process.env.NEWS_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'NEWS_API_KEY not configured' });
  }

  try {
    const [articles, edgarFilings] = await Promise.allSettled([
      process.env.NEWS_API_KEY ? fetchNewsDeals(process.env.NEWS_API_KEY) : Promise.resolve([]),
      fetchEdgarDeals(),
    ]);

    const newsArticles = articles.status === 'fulfilled' ? articles.value : [];
    const filings = edgarFilings.status === 'fulfilled' ? edgarFilings.value : [];

    if (!newsArticles.length && !filings.length) {
      return res.status(503).json({ error: 'No source data available for deal extraction' });
    }

    let deals;
    if (process.env.ANTHROPIC_API_KEY) {
      deals = await extractDealsWithClaude(newsArticles, filings);
    } else {
      // No Claude — return basic news-derived stubs without AI extraction
      deals = newsArticles.slice(0, 8).map((a, i) => ({
        id: i + 1,
        date: a.publishedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        target: a.title.split(' acqui')[0].split(' merge')[0].slice(0, 40),
        buyer: 'See article',
        type: 'Acquisition',
        evAmount: 'Undisclosed',
        sector: 'Other',
        status: 'Pending',
      }));
    }

    const withIds = deals.map((d, i) => ({ id: i + 1, ...d }));
    cache.set('deals', withIds, TTL);
    res.json(withIds);
  } catch (err) {
    console.error('[deals]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
