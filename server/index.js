require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.use('/api/news', require('./routes/news'));
app.use('/api/commodities', require('./routes/commodities'));
app.use('/api/trends', require('./routes/trends'));
app.use('/api/deals', require('./routes/deals'));
app.use('/api/insights', require('./routes/insights'));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.listen(PORT, () => {
  const keys = {
    NEWS_API_KEY: process.env.NEWS_API_KEY,
    FMP_API_KEY: process.env.FMP_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  };
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log('API keys:');
  Object.entries(keys).forEach(([k, v]) =>
    console.log(`  ${k}: ${v ? 'configured' : 'MISSING (will use mock data)'}`)
  );
  console.log('');
});
