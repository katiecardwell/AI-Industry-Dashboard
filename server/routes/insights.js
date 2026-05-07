const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const cache = require('../cache');
const cacheStore = require('../cache');

const router = express.Router();
const TTL = 12 * 60 * 60 * 1000; // 12 hours — Claude calls are expensive

const SYSTEM_PROMPT = `You are a senior PE analyst specializing in food & beverage investments. Given current market context (news, commodity trends, consumer signals), generate an updated investment opportunity pipeline for the following companies.

For each company, return a JSON object with:
- "company": company name
- "subSector": short sub-sector label
- "score": opportunity score 0-100 (higher = stronger investment case right now, based on current market context provided)
- "thesis": 3-4 sentence investment thesis. Reference specific current signals where relevant (news events, commodity tailwinds/headwinds, consumer trends). Make it concrete and actionable.
- "keyDrivers": array of 3-5 short driver phrases (e.g. "Category tailwind", "Distressed valuation")
- "ev": estimated enterprise value (e.g. "~$800M")
- "revenue": estimated revenue (e.g. "$200M")
- "ebitdaMargin": EBITDA margin (e.g. "22%") or "NM" if pre-profit
- "entryMultiple": entry multiple (e.g. "~4x EV/Revenue")

Adjust scores based on the current news and market context provided. If a company is mentioned in recent news positively, raise its score. If there are headwinds (commodity exposure, regulatory issues, consumer category contraction), reflect that.

Return ONLY a valid JSON array ordered by score descending. No markdown.`;

const SEED_COMPANIES = [
  { company: 'Maple Leaf Foods (Consumer Div.)', subSector: 'Packaged Protein', baseEv: '~$2.4B', revenue: '$1.8B', ebitdaMargin: '11%', entryMultiple: '8x EV/EBITDA' },
  { company: 'Chomps', subSector: 'Better-for-You Snacks', baseEv: '~$800M', revenue: '$200M', ebitdaMargin: '22%', entryMultiple: '~4x EV/Revenue' },
  { company: "Kevin's Natural Foods", subSector: 'Frozen / Refrigerated Meals', baseEv: '$350M', revenue: '$95M', ebitdaMargin: '14%', entryMultiple: '3.7x EV/Revenue' },
  { company: 'Poppi', subSector: 'Functional Beverages', baseEv: '$1.95B', revenue: '$115M', ebitdaMargin: 'NM', entryMultiple: '17x EV/Revenue' },
  { company: "Tessemae's", subSector: 'Condiments / Dressings', baseEv: '$130M', revenue: '$65M', ebitdaMargin: '9%', entryMultiple: '2x EV/Revenue' },
  { company: 'Lil Bucks', subSector: 'Specialty / Superfood Snacks', baseEv: '$35M', revenue: '$8M', ebitdaMargin: 'NM', entryMultiple: '4.4x EV/Revenue' },
  { company: 'Soylent', subSector: 'Functional Nutrition', baseEv: '$90M', revenue: '$110M', ebitdaMargin: '4%', entryMultiple: '0.8x EV/Revenue' },
];

router.get('/', async (req, res) => {
  const cached = cache.get('insights');
  if (cached) return res.json(cached);

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Pull current context from other cached data sources
    const newsCache = cacheStore.get('news');
    const commoditiesCache = cacheStore.get('commodities');
    const trendsCache = cacheStore.get('trends');

    let context = '';

    if (newsCache && newsCache.length) {
      context += '\n\nRECENT NEWS HEADLINES:\n';
      context += newsCache.slice(0, 6).map((n) => `- [${n.tag}] ${n.headline}`).join('\n');
    }

    if (commoditiesCache && commoditiesCache.length) {
      context += '\n\nCURRENT COMMODITY MOVES (30d change):\n';
      context += commoditiesCache
        .filter((c) => c.change30d !== 'N/A')
        .map((c) => `- ${c.name}: ${c.change30d} (30d), ${c.changeYoY} (YoY)`)
        .join('\n');
    }

    if (trendsCache && trendsCache.searchTrends && trendsCache.searchTrends.length) {
      context += '\n\nCONSUMER SEARCH TRENDS (YoY change):\n';
      context += trendsCache.searchTrends
        .slice(0, 8)
        .map((t) => `- ${t.category}: ${t.change1yr} YoY (index ${t.index})`)
        .join('\n');
    }

    if (!context) {
      context = '\n\nNo real-time context available — use general F&B market knowledge as of today.';
    }

    const companyList = SEED_COMPANIES.map(
      (c, i) =>
        `${i + 1}. ${c.company} (${c.subSector}) — Est. EV ${c.baseEv}, Revenue ${c.revenue}, EBITDA Margin ${c.ebitdaMargin}, Entry multiple ${c.entryMultiple}`
    ).join('\n');

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [
        {
          role: 'user',
          content: `Today's date: ${new Date().toISOString().slice(0, 10)}${context}\n\nGENERATE OPPORTUNITY SCORES AND THESES FOR:\n${companyList}`,
        },
      ],
    });

    const insights = JSON.parse(msg.content[0].text).map((item, i) => ({
      id: i + 1,
      ...item,
    }));

    cache.set('insights', insights, TTL);
    res.json(insights);
  } catch (err) {
    console.error('[insights]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
