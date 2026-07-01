import { analyzeArticlesBatch } from "../services/llm.js";

// Only send 5 articles to Gemini to keep the prompt small and fast
const MAX_ARTICLES = 5;

/**
 * LangGraph Node: AnalyzeArticles
 * Sends a batch of articles to Gemini in a single call.
 * Filters out irrelevant articles and enriches relevant ones.
 */
export async function analyzeArticles(state) {
  const articles = state.rawArticles || [];
  const config = state.config;

  if (articles.length === 0) {
    console.warn("No articles to analyze.");
    return { analyzedArticles: [] };
  }

  const batch = articles.slice(0, MAX_ARTICLES);
  console.log(`Analyzing ${batch.length} articles with Gemini (single batch call)...`);

  const results = await analyzeArticlesBatch(batch, config);

  // Merge Gemini analysis back onto the original articles
  const analyzed = [];

  for (let i = 0; i < batch.length; i++) {
    // Match by articleIndex (1-based) or fall back to position
    const analysis = results.find((r) => r.articleIndex === i + 1) || results[i];

    if (!analysis || analysis.relevant === false) {
      continue; // Irrelevant or no analysis — skip
    }

    analyzed.push({
      ...batch[i],
      priority: analysis.priority || "Low",
      topic: analysis.topic || "General",
      summary: analysis.summary || "",
      reason: analysis.reason || "",
    });
  }

  console.log(`${analyzed.length} relevant articles after analysis`);
  return { analyzedArticles: analyzed };
}
