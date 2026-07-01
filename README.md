# newsAgent

An AI News Monitoring Agent that autonomously fetches, analyzes, and prioritizes news articles using LangGraph.js for orchestration and Google Gemini for reasoning.

## Architecture

newsAgent behaves like an autonomous AI agent. It runs a structured pipeline to:

1. **Load Configuration** — Read monitored topics, competitors, and sources from `config.json`
2. **Fetch News** — Query NewsAPI for the latest articles matching monitored topics
3. **Normalize & Deduplicate** — Clean data and remove duplicate articles by URL and title
4. **Analyze with Gemini** — For each article, determine relevance, priority, topic match, summary, and monitoring reason
5. **Generate Report** — Group relevant articles by priority (High → Medium → Low)
6. **Render Dashboard** — Display results in a readable HTML page

## LangGraph Workflow

```
START → LoadConfig → FetchNews → Deduplicate → AnalyzeArticles → GenerateReport → END
```

Each node in the graph reads from and writes to a shared state object:

```
{
  config,          // Monitoring configuration
  rawArticles,     // Fetched & normalized articles
  analyzedArticles,// Articles enriched with Gemini analysis
  report,          // Articles grouped by priority
  errors           // Any errors accumulated during the run
}
```

## Folder Structure

```
newsAgent/
├── server.js              # Express entry point
├── package.json
├── .env                   # API keys (not committed)
├── config.json            # Monitoring configuration
├── README.md
├── future-improvements.md
├── graph/
│   └── graph.js           # LangGraph StateGraph definition
├── nodes/
│   ├── loadConfig.js      # Read config.json
│   ├── fetchNews.js       # Fetch from NewsAPI
│   ├── deduplicate.js     # Remove duplicate articles
│   ├── analyzeArticles.js # Gemini-powered analysis
│   └── generateReport.js  # Group by priority
├── services/
│   ├── llm.js             # Gemini LLM wrapper
│   └── newsService.js     # NewsAPI client
├── routes/
│   ├── dashboard.js       # GET / and GET /refresh
│   └── settings.js        # CRUD for topics, competitors, sources
└── public/
    └── styles.css         # Minimal CSS
```

## Setup

### Prerequisites

- Node.js 18+
- NewsAPI key ([newsapi.org](https://newsapi.org))
- Google Gemini API key ([ai.google.dev](https://ai.google.dev))

### Install

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
NEWS_API_KEY=your_newsapi_key
GEMINI_API_KEY=your_gemini_api_key
```

### Run

```bash
npm start
```

Visit [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Run agent and render dashboard |
| GET | `/refresh` | Re-run agent with fresh data |
| POST | `/topics` | Add a monitored topic |
| DELETE | `/topics/:name` | Remove a monitored topic |
| POST | `/competitors` | Add a competitor |
| DELETE | `/competitors/:name` | Remove a competitor |
| POST | `/sources` | Add a news source |
| DELETE | `/sources/:name` | Remove a news source |

### Settings Request Body

```json
{ "name": "trade" }
```

## API Choices

### Why LangGraph.js

LangGraph provides a structured graph-based workflow for AI agents. Each step in the pipeline is a discrete node that reads from and writes to shared state. This makes the agent easy to understand, test, and extend — for example, adding conditional routing or parallel processing later requires minimal changes.

### Why Google Gemini

Gemini 2.0 Flash is fast and cost-effective for per-article analysis. It handles structured JSON output well, making it ideal for the analysis prompt that returns relevance, priority, and reasoning.

### Why NewsAPI

NewsAPI provides a simple REST interface to a wide range of global news sources. The free tier is sufficient for prototyping, and the API returns well-structured data that's easy to normalize.

### Why Configuration-Driven Monitoring

The agent reads all monitoring parameters from `config.json`. Users change what they monitor via REST endpoints or by editing the file directly — no code changes required. This separation of configuration from logic is a core design principle.

## Design Decisions

1. **Linear pipeline** — The graph is a simple chain. No conditional branching in the MVP. This keeps the architecture transparent and easy to debug.
2. **Article limit** — Only the first 10 articles are sent to Gemini per run. This controls API costs and latency.
3. **Server-rendered HTML** — No frontend build step. The dashboard is rendered server-side with template strings.
4. **Error accumulation** — Errors are collected in state rather than thrown. The pipeline completes even if individual steps fail.

## Limitations

- NewsAPI free tier limits: 100 requests/day, articles up to 1 month old
- No persistent storage — results are regenerated on each page load
- No authentication — anyone with access to the server can modify configuration
- No scheduled monitoring — the agent runs only when a user visits the dashboard
- Analysis limited to 10 articles per run to control Gemini API costs
- Single news source (NewsAPI) in the MVP
