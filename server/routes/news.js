const express = require('express');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');
const cache = require('../cache');

const router = express.Router();
const TTL = 60 * 60 * 1000; // 1 hour — keeps NewsAPI free tier under 100 req/day

const SYSTEM_PROMPT = `You are a senior PE analyst assistant specializing in food & beverage. Given raw news article data, return a JSON array of formatted news items for a PE intelligence dashboard.

For each article output an object with exactly these fields:
- "headline": clean, concise title (fix grammar/capitalization if needed)
- "summary": 2-3 sentences focused on PE/investment implications (what does this mean for deal flow, valuations, portfolio companies, or sector outlook?)
- "tag": exactly one of ["Regulatory", "Earnings", "Commodity", "Consumer Trends", "Distress", "Growth", "M&A"]
- "urgent": boolean — true if this signals immediate risk or opportunity (distress, regulatory action, major deal close, earnings miss)
- "source": publication name only (e.g. "Reuters", "Bloomberg", "FDA")

Return ONLY a valid JSON array with no markdown, no code fences, no commentary.`;

const QUERIES = [
  '(food OR beverage OR snack OR protein) AND (acquisition OR merger OR buyout OR "private equity" OR carve-out)',
  '(food OR beverage OR snack) AND (FDA OR regulation OR labeling OR "going concern" OR distress OR recall)',
  '(corn OR wheat OR cocoa OR sugar OR coffee OR soybean OR "lean hogs") AND (price OR futures OR commodity)',
  '(GLP-1 OR Ozempic OR "functional food" OR prebiotic OR probiotic OR "plant-based") AND (consumer OR trend OR brand OR sales)',
];

const TAG_KEYWORDS = {
  'M&A': ['acquisition', 'merger', 'buyout', 'carve-out', 'stake', 'purchase agreement'],
  Regulatory: ['fda', 'regulation', 'regulatory', 'labeling', 'recall', 'ban'],
  Commodity: ['corn', 'wheat', 'cocoa', 'sugar', 'coffee', 'soybean', 'futures', 'commodity'],
  Earnings: ['earnings', 'revenue', 'quarter', 'q1', 'q2', 'q3', 'q4', 'guidance', 'ebitda'],
  Distress: ['distress', 'bankrupt', 'going concern', 'covenant', 'default', 'restructur'],
  'Consumer Trends': ['glp-1', 'ozempic', 'prebiotic', 'probiotic', 'plant-based', 'protein', 'functional'],
};

function inferTag(title, description) {
  const text = `${title} ${description || ''}`.toLowerCase();
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) return tag;
  }
  return 'Growth';
}

router.get('/', async (req, res) => {
  const cached = cache.get('news');
  if (cached) return res.json(cached);

  if (!process.env.NEWS_API_KEY) {
    return res.status(503).json({ error: 'NEWS_API_KEY not configured' });
  }

  try {
    const from = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const results = await Promise.allSettled(
      QUERIES.map((q) =>
        axios.get('https://newsapi.org/v2/everything', {
          params: { q, language: 'en', sortBy: 'publishedAt', pageSize: 8, from, apiKey: process.env.NEWS_API_KEY },
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

    if (!articles.length) {
      return res.status(503).json({ error: 'No articles fetched from NewsAPI' });
    }

    const top = articles.slice(0, 8);
    let formatted;

    if (process.env.ANTHROPIC_API_KEY) {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const articleList = top
        .map(
          (a, i) =>
            `${i + 1}. Title: ${a.title}\nSource: ${a.source?.name}\nDescription: ${a.description}\nDate: ${a.publishedAt?.slice(0, 10)}`
        )
        .join('\n\n');

      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: `Format these F&B industry news articles for the PE dashboard:\n\n${articleList}` }],
      });

      const parsed = JSON.parse(msg.content[0].text);
      formatted = parsed.map((item, i) => ({
        id: i + 1,
        date: top[i]?.publishedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        ...item,
      }));
    } else {
      // No Claude — format without AI summaries
      const urgentKeywords = ['distress', 'bankrupt', 'going concern', 'recall', 'fda action', 'covenant'];
      formatted = top.slice(0, 6).map((a, i) => {
        const lower = `${a.title} ${a.description || ''}`.toLowerCase();
        return {
          id: i + 1,
          date: a.publishedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          headline: a.title,
          summary: a.description || '',
          source: a.source?.name || 'Unknown',
          tag: inferTag(a.title, a.description),
          urgent: urgentKeywords.some((k) => lower.includes(k)),
        };
      });
    }

    cache.set('news', formatted, TTL);
    res.json(formatted);
  } catch (err) {
    console.error('[news]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
