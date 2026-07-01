import OpenAI from "openai";

// Initialize Groq using OpenAI-compatible client
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Fallback analysis logic if the Groq API fails.
 */
function fallbackHeuristicAnalysis(article, config) {
  const title = (article.title || "").toLowerCase();
  const desc = (article.description || "").toLowerCase();
  const content = `${title} ${desc}`;

  let matchedTopic = null;
  for (const topic of config.topics || []) {
    if (content.includes(topic.toLowerCase())) {
      matchedTopic = topic;
      break;
    }
  }

  let matchedCompetitor = null;
  for (const comp of config.competitors || []) {
    if (content.includes(comp.toLowerCase())) {
      matchedCompetitor = comp;
      break;
    }
  }

  const isRelevant = matchedTopic !== null || matchedCompetitor !== null;
  if (!isRelevant) {
    return { relevant: false };
  }

  let priority = "Low";
  if (matchedCompetitor && matchedTopic) {
    priority = "High";
  } else if (matchedCompetitor || matchedTopic === "budget" || matchedTopic === "GDP") {
    priority = "Medium";
  }

  const topicName = matchedTopic || "monitored sectors";
  const competitorName = matchedCompetitor ? ` involving competitor ${matchedCompetitor}` : "";
  const reason = `Monitored due to relevance to India's ${topicName}${competitorName}.`;
  
  const summary = `${article.title}. This update highlights key developments in the ${topicName} sector.`;

  return {
    relevant: true,
    priority,
    topic: matchedTopic || "General",
    summary,
    reason,
  };
}

/**
 * Analyze a batch of articles in a single Groq call.
 * Uses Llama 3.3 70B Versatile for high speed and accurate JSON compliance.
 */
export async function analyzeArticlesBatch(articles, config) {
  const topicsList = config.topics.map((t) => `- ${t}`).join("\n");
  const competitorsList = config.competitors.map((c) => `- ${c}`).join("\n");

  const articleEntries = articles
    .map(
      (a, i) =>
        `Article ${i + 1}:\nTitle: ${a.title}\nDescription: ${a.description || "N/A"}\nSource: ${a.source}`
    )
    .join("\n\n");

  const prompt = `You are an AI news monitoring agent for ${config.country}.

Monitored topics:
${topicsList}

Competitors:
${competitorsList}

Analyze these ${articles.length} articles:

${articleEntries}

For each article return: relevant (bool), priority (High/Medium/Low), topic, summary (2 sentences), reason.

Return ONLY a JSON array, no markdown or text:
[{"articleIndex":1,"relevant":true,"priority":"High","topic":"GDP","summary":"...","reason":"..."}]`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0].message.content;
    const parsed = JSON.parse(text);

    // Handle array or object envelope wrapper formats
    const results = Array.isArray(parsed) ? parsed : parsed.articles || parsed.results || [];
    return results;
  } catch (error) {
    console.warn("Groq batch analysis failed, running fallback heuristics:", error.message);
    return articles.map((article, index) => {
      const analysis = fallbackHeuristicAnalysis(article, config);
      return {
        articleIndex: index + 1,
        ...analysis,
      };
    });
  }
}
