import axios from "axios";

const NEWS_API_BASE = "https://newsapi.org/v2/everything";

/**
 * Fetch news articles from NewsAPI based on monitored topics.
 * Builds an OR query from topics and returns normalized articles.
 */
export async function fetchNews(topics) {
  const query = topics.join(" OR ");

  try {
    const response = await axios.get(NEWS_API_BASE, {
      params: {
        q: query,
        sortBy: "publishedAt",
        language: "en",
        pageSize: 10,
        apiKey: process.env.NEWS_API_KEY,
      },
    });

    if (response.data.status !== "ok") {
      console.error("NewsAPI returned non-ok status:", response.data);
      return [];
    }

    const articles = response.data.articles || [];

    // Normalize each article to a clean shape
    return articles.map((a) => ({
      title: a.title || "Untitled",
      description: a.description || "",
      source: a.source?.name || "Unknown",
      publishedAt: a.publishedAt || "",
      url: a.url || "",
    }));
  } catch (error) {
    if (error.response) {
      console.error(`NewsAPI error (${error.response.status}):`, error.response.data?.message);
    } else {
      console.error("NewsAPI network error:", error.message);
    }
    return [];
  }
}
