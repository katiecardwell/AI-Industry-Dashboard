import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from cachetools import TTLCache
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

app = FastAPI(title="F&B Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Cache: news for 15 min, commodities for 60 min
_news_cache: TTLCache = TTLCache(maxsize=10, ttl=900)
_commodity_cache: TTLCache = TTLCache(maxsize=20, ttl=3600)

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_KEY", "")

# ---------------------------------------------------------------------------
# Mock fallbacks (used when API keys are missing or quota is exhausted)
# ---------------------------------------------------------------------------

MOCK_NEWS = [
    {
        "title": "FDA Proposes Major Overhaul of 'Healthy' Food Labeling Standards",
        "source": "Food Safety News",
        "publishedAt": "2025-05-06T09:00:00Z",
        "url": "#",
        "summary": "New guidelines would require foods labeled 'healthy' to meet updated sodium and sugar limits, impacting 80+ major brands.",
        "tags": ["Regulatory", "Labeling"],
    },
    {
        "title": "PepsiCo Misses Q1 Earnings; Lays Out Cost-Cutting Roadmap",
        "source": "Bloomberg",
        "publishedAt": "2025-05-05T13:30:00Z",
        "url": "#",
        "summary": "PepsiCo reported Q1 revenue of $17.8B vs $18.2B consensus. Management flagged softness in North America beverages and outlined $1B in savings.",
        "tags": ["Earnings", "Beverages"],
    },
    {
        "title": "Cocoa Prices Hit Record High — Chocolate Makers Brace for Margin Squeeze",
        "source": "Reuters",
        "publishedAt": "2025-05-04T11:00:00Z",
        "url": "#",
        "summary": "Cocoa futures topped $12,000/MT for the first time as West African supply disruptions persist. Analysts expect 200–400bps margin compression for confectionery.",
        "tags": ["Commodities", "Alert"],
    },
    {
        "title": "Chobani Files Confidentially for IPO at ~$10B Valuation",
        "source": "WSJ",
        "publishedAt": "2025-05-03T08:00:00Z",
        "url": "#",
        "summary": "Greek yogurt giant Chobani has filed confidentially with the SEC, targeting a mid-2025 public offering. Lactalis retains a minority stake.",
        "tags": ["IPO", "Dairy"],
    },
    {
        "title": "GLP-1 Drug Boom Reshapes Snack Category — High-Protein Winners Emerging",
        "source": "CNBC",
        "publishedAt": "2025-05-02T10:15:00Z",
        "url": "#",
        "summary": "Nielsen data shows high-protein snack sales up 34% YoY as GLP-1 users seek satiety-dense options. Chomps, Quest, and RXBAR lead share gains.",
        "tags": ["Consumer Trends", "Snacks"],
    },
]

MOCK_COMMODITIES = {
    "CORN": {"name": "Corn", "unit": "per bushel", "price": 4.52, "change30d": -2.1, "changeYoY": -8.3},
    "MILK": {"name": "Milk (Class III)", "unit": "per cwt", "price": 18.75, "change30d": 3.2, "changeYoY": 11.4},
    "SUGAR": {"name": "Sugar #11", "unit": "per lb", "price": 0.2134, "change30d": 1.8, "changeYoY": -5.2},
    "SOYBEAN_OIL": {"name": "Soybean Oil", "unit": "per lb", "price": 0.4612, "change30d": 4.5, "changeYoY": 6.1},
    "WHEAT": {"name": "Wheat", "unit": "per bushel", "price": 5.38, "change30d": -1.4, "changeYoY": -12.7},
    "COCOA": {"name": "Cocoa", "unit": "per MT", "price": 11842.0, "change30d": 18.3, "changeYoY": 127.4},
    "COFFEE": {"name": "Coffee (Arabica)", "unit": "per lb", "price": 2.43, "change30d": 5.1, "changeYoY": 64.2},
    "PALM_OIL": {"name": "Palm Oil", "unit": "per MT", "price": 912.0, "change30d": 2.7, "changeYoY": 9.8},
}

# ---------------------------------------------------------------------------
# Alpha Vantage commodity symbol map
# ---------------------------------------------------------------------------

AV_COMMODITY_MAP = {
    "CORN": "CORN",
    "WHEAT": "WHEAT",
    "SUGAR": "SUGAR",
    "COFFEE": "COFFEE",
    "COCOA": "COCOA",
    "SOYBEAN_OIL": "SOYBEAN_OIL",
}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/news")
async def get_news():
    """Return F&B industry news. Uses NewsAPI if key is set, else mock data."""
    if not NEWS_API_KEY:
        return {"source": "mock", "articles": MOCK_NEWS}

    cache_key = "fnb_news"
    if cache_key in _news_cache:
        return _news_cache[cache_key]

    queries = "food AND (acquisition OR merger OR IPO OR recall OR earnings OR commodity)"
    url = (
        f"https://newsapi.org/v2/everything"
        f"?q={queries}&language=en&sortBy=publishedAt&pageSize=10"
        f"&apiKey={NEWS_API_KEY}"
    )

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            return {"source": "mock", "articles": MOCK_NEWS}

    data = resp.json()
    articles = []
    for a in data.get("articles", [])[:8]:
        articles.append({
            "title": a.get("title", ""),
            "source": a.get("source", {}).get("name", ""),
            "publishedAt": a.get("publishedAt", ""),
            "url": a.get("url", "#"),
            "summary": a.get("description") or a.get("content", "")[:200],
            "tags": _infer_tags(a.get("title", "") + " " + (a.get("description") or "")),
        })

    result = {"source": "live", "articles": articles}
    _news_cache[cache_key] = result
    return result


@app.get("/api/commodities")
async def get_commodities():
    """Return commodity prices. Uses Alpha Vantage if key is set, else mock data."""
    if not ALPHA_VANTAGE_KEY:
        return {"source": "mock", "commodities": MOCK_COMMODITIES}

    cache_key = "commodities"
    if cache_key in _commodity_cache:
        return _commodity_cache[cache_key]

    results = dict(MOCK_COMMODITIES)  # start with mock as base
    async with httpx.AsyncClient(timeout=15) as client:
        for key, symbol in AV_COMMODITY_MAP.items():
            try:
                url = (
                    f"https://www.alphavantage.co/query"
                    f"?function=HISTORICAL_OPTIONS&symbol={symbol}"  # commodity endpoint
                    f"&apikey={ALPHA_VANTAGE_KEY}"
                )
                # Alpha Vantage commodity endpoint
                url = (
                    f"https://www.alphavantage.co/query"
                    f"?function={symbol}&interval=monthly&apikey={ALPHA_VANTAGE_KEY}"
                )
                resp = await client.get(url)
                if resp.status_code != 200:
                    continue
                data = resp.json()
                monthly = data.get("data", [])
                if len(monthly) < 13:
                    continue
                latest = float(monthly[0]["value"])
                month_ago = float(monthly[1]["value"])
                year_ago = float(monthly[12]["value"])
                results[key] = {
                    **results.get(key, {}),
                    "price": round(latest, 4),
                    "change30d": round((latest - month_ago) / month_ago * 100, 1),
                    "changeYoY": round((latest - year_ago) / year_ago * 100, 1),
                }
            except Exception:
                pass  # keep mock value for this commodity

    result = {"source": "live", "commodities": results}
    _commodity_cache[cache_key] = result
    return result


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "news_api_configured": bool(NEWS_API_KEY),
        "alpha_vantage_configured": bool(ALPHA_VANTAGE_KEY),
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _infer_tags(text: str) -> list[str]:
    text_lower = text.lower()
    tags = []
    if any(w in text_lower for w in ["acquisition", "merger", "deal", "buyout", "acquire"]):
        tags.append("M&A")
    if any(w in text_lower for w in ["ipo", "public offering", "listing"]):
        tags.append("IPO")
    if any(w in text_lower for w in ["earnings", "revenue", "profit", "ebitda"]):
        tags.append("Earnings")
    if any(w in text_lower for w in ["commodity", "cocoa", "wheat", "corn", "sugar", "coffee"]):
        tags.append("Commodities")
    if any(w in text_lower for w in ["fda", "usda", "regulation", "recall", "label"]):
        tags.append("Regulatory")
    if any(w in text_lower for w in ["consumer", "trend", "demand", "habit"]):
        tags.append("Consumer Trends")
    if any(w in text_lower for w in ["beverage", "drink", "soda", "water"]):
        tags.append("Beverages")
    if any(w in text_lower for w in ["snack", "protein", "bar", "chip"]):
        tags.append("Snacks")
    return tags[:2] or ["Industry"]
