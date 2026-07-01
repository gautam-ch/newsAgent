import { fetchNews } from "../services/newsService.js";

/**
 * LangGraph Node: FetchNews
 * Uses the config topics to fetch articles from NewsAPI.
 */
export async function fetchNewsNode(state) {
  const { config } = state;

  if (!config || !config.topics || config.topics.length === 0) {
    console.warn("No topics configured. Skipping news fetch.");
    return {
      rawArticles: [],
      errors: [...(state.errors || []), "No topics configured"],
    };
  }

  try {
    const articles = await fetchNews(config.topics);
    console.log(`Fetched ${articles.length} articles from NewsAPI`);
    return { rawArticles: articles };
  } catch (error) {
    console.error("FetchNews node failed:", error.message);
    return {
      rawArticles: [],
      errors: [...(state.errors || []), `Fetch failed: ${error.message}`],
    };
  }
}
