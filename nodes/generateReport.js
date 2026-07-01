/**
 * LangGraph Node: GenerateReport
 * Groups analyzed articles by priority (High > Medium > Low).
 */
export async function generateReport(state) {
  const articles = state.analyzedArticles || [];

  const report = {
    high: [],
    medium: [],
    low: [],
  };

  for (const article of articles) {
    const p = (article.priority || "Low").toLowerCase();
    if (p === "high") {
      report.high.push(article);
    } else if (p === "medium") {
      report.medium.push(article);
    } else {
      report.low.push(article);
    }
  }

  console.log(
    `Report: ${report.high.length} high, ${report.medium.length} medium, ${report.low.length} low`
  );

  return { report };
}
