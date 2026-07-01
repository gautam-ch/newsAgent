# Future Improvements

This document outlines planned enhancements for newsAgent, organized into a 4–6 week roadmap.

---

## Week 1–2: Core Infrastructure

### Multiple News APIs
- Add support for Google News, Bing News, and GNews alongside NewsAPI
- Abstract the news fetching layer behind a common interface so adding a new source requires only a new adapter

### Persistent Database
- Replace in-memory state with a database (SQLite for simplicity, PostgreSQL for production)
- Store historical reports, analysis results, and configuration history
- Enable querying past monitoring results

### Scheduled Monitoring with Cron
- Use `node-cron` or a similar scheduler to run the agent pipeline at regular intervals (e.g., every 6 hours)
- Store results in the database so the dashboard shows the latest cached report without re-running the pipeline on every page load

---


### Duplicate Detection Using Embeddings
- Replace title-based deduplication with semantic similarity using text embeddings
- Use Gemini embeddings or a lightweight embedding model to detect semantically similar articles even when titles differ

### Sentiment Analysis
- Add a sentiment dimension to article analysis (positive, negative, neutral)
- Track sentiment trends over time for monitored topics

### Trend Detection
- Identify topics with increasing coverage frequency
- Alert when a topic transitions from low to high volume, indicating a developing story

### Historical Analytics
- Dashboard showing monitoring trends over days and weeks
- Charts for article volume by topic, average priority distribution, and source breakdown

---

## Week 4–5: Security and Multi-Tenancy

### Authentication
- Add basic authentication (JWT or session-based) to protect the dashboard and settings endpoints
- Environment variable for admin credentials in the MVP

### User Accounts
- Support multiple users, each with their own monitoring configuration
- Role-based access: admin (full control) vs viewer (read-only dashboard)

---

### Semantic Search
- Allow users to search past articles using natural language queries
- Use embeddings to match queries against stored articles beyond keyword matching

### Multi-Agent Architecture
- Split the monolithic pipeline into specialized sub-agents:
  - **Fetcher Agent**: handles all news source integrations
  - **Analyst Agent**: handles Gemini reasoning and classification
  - **Reporter Agent**: handles report generation and formatting
- Agents communicate through LangGraph's multi-agent patterns

### Live Dashboard
- Replace full page reloads with WebSocket-based live updates
- Show pipeline progress in real-time as the agent works through each step

### Streaming Updates
- Stream Gemini analysis results to the frontend as they complete
- Display articles as they are analyzed rather than waiting for the full pipeline

### RSS Feed Support
- Generate an RSS feed of high-priority articles
- Allow users to subscribe to monitoring results in their preferred feed reader

---

## Summary Roadmap

| Week | Focus | Key Deliverables |
|------|-------|------------------|
| 1–2 | Core Infrastructure | Multi-source, database, scheduled runs |
| 2–3 | Notifications | Email, Slack, Teams integration |
| 3–4 | Advanced Analysis | Embeddings, sentiment, trends, analytics |
| 4–5 | Security | Auth, user accounts, access control |
| 5–6 | Advanced Agent | Semantic search, multi-agent, streaming |

Each phase builds on the previous one. The MVP architecture (modular nodes, shared state, configuration-driven) is designed to make these extensions straightforward.
