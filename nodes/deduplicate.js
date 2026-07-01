/**
 * LangGraph Node: Deduplicate
 * Removes articles with duplicate URLs or duplicate titles.
 */
export async function deduplicate(state) {
  const articles = state.rawArticles || [];

  // Deduplicate by URL
  const seenUrls = new Set();
  const uniqueByUrl = articles.filter((a) => {
    if (!a.url || seenUrls.has(a.url)) return false;
    seenUrls.add(a.url);
    return true;
  });

  // Deduplicate by normalized title
  const seenTitles = new Set();
  const uniqueArticles = uniqueByUrl.filter((a) => {
    const normalized = a.title.toLowerCase().trim();
    if (seenTitles.has(normalized)) return false;
    seenTitles.add(normalized);
    return true;
  });

  const removed = articles.length - uniqueArticles.length;
  if (removed > 0) {
    console.log(`Deduplicate: removed ${removed} duplicate articles`);
  }

  return { rawArticles: uniqueArticles };
}
