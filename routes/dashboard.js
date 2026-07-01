import { Router } from "express";
import { runAgent } from "../graph/graph.js";

const router = Router();

/**
 * Render the HTML dashboard with agent results.
 */
function renderDashboard(state) {
  const { config, report, errors } = state;

  const escapeHtml = (str) =>
    String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const renderArticleCard = (article) => `
    <div class="card">
      <h3>${escapeHtml(article.title)}</h3>
      <p class="meta">
        <span>${escapeHtml(article.source)}</span>
        <span>${article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Unknown date"}</span>
        <span>Topic: ${escapeHtml(article.topic)}</span>
      </p>
      <p><strong>Summary:</strong> ${escapeHtml(article.summary)}</p>
      <p><strong>Reason:</strong> ${escapeHtml(article.reason)}</p>
      <a href="${escapeHtml(article.url)}" target="_blank" rel="noopener">Read More</a>
    </div>
  `;

  const renderSection = (title, articles) => {
    if (articles.length === 0) {
      return `
        <section>
          <h2>${title}</h2>
          <p class="empty">No articles in this category.</p>
        </section>
      `;
    }
    return `
      <section>
        <h2>${title}</h2>
        ${articles.map(renderArticleCard).join("")}
      </section>
    `;
  };

  const errorHtml =
    errors && errors.length > 0
      ? `<div class="errors"><h3>Errors</h3><ul>${errors.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul></div>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="newsAgent - AI News Monitoring Dashboard powered by LangGraph and Google Gemini">
  <title>newsAgent - AI News Monitor</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <header>
    <h1>newsAgent</h1>
    <p>AI News Monitoring Agent</p>
    <a href="/refresh" class="refresh-btn">Refresh</a>
  </header>

  <div class="config-summary">
    <div class="config-item">
      <strong>Country:</strong> ${escapeHtml(config.country)}
    </div>
    <div class="config-item">
      <strong>Topics:</strong> ${(config.topics || []).map(escapeHtml).join(", ")}
    </div>
    <div class="config-item">
      <strong>Competitors:</strong> ${(config.competitors || []).map(escapeHtml).join(", ")}
    </div>
    <div class="config-item">
      <strong>Sources:</strong> ${(config.sources || []).map(escapeHtml).join(", ")}
    </div>
  </div>

  <div class="settings-panel">
    <h2>Settings</h2>
    <div class="settings-grid">
      <div class="settings-section">
        <h3>Topics</h3>
        <div class="settings-list">
          ${(config.topics || [])
            .map(
              (t) => `<span class="tag">${escapeHtml(t)} <button onclick="removeItem('topics', '${escapeHtml(t)}')" title="Remove">&times;</button></span>`
            )
            .join("")}
        </div>
        <form onsubmit="addItem(event, 'topics')">
          <input type="text" id="new-topic" placeholder="Add topic" required>
          <button type="submit">Add</button>
        </form>
      </div>
      <div class="settings-section">
        <h3>Competitors</h3>
        <div class="settings-list">
          ${(config.competitors || [])
            .map(
              (c) => `<span class="tag">${escapeHtml(c)} <button onclick="removeItem('competitors', '${escapeHtml(c)}')" title="Remove">&times;</button></span>`
            )
            .join("")}
        </div>
        <form onsubmit="addItem(event, 'competitors')">
          <input type="text" id="new-competitor" placeholder="Add competitor" required>
          <button type="submit">Add</button>
        </form>
      </div>
      <div class="settings-section">
        <h3>Sources</h3>
        <div class="settings-list">
          ${(config.sources || [])
            .map(
              (s) => `<span class="tag">${escapeHtml(s)} <button onclick="removeItem('sources', '${escapeHtml(s)}')" title="Remove">&times;</button></span>`
            )
            .join("")}
        </div>
        <form onsubmit="addItem(event, 'sources')">
          <input type="text" id="new-source" placeholder="Add source" required>
          <button type="submit">Add</button>
        </form>
      </div>
    </div>
  </div>

  <hr>

  ${errorHtml}

  ${renderSection("High Priority", report.high || [])}
  ${renderSection("Medium Priority", report.medium || [])}
  ${renderSection("Low Priority", report.low || [])}

  <footer>
    <p>Powered by LangGraph.js and Google Gemini</p>
  </footer>

  <script>
    async function addItem(event, type) {
      event.preventDefault();
      const input = document.getElementById('new-' + type.replace('competitors', 'competitor').replace('topics', 'topic').replace('sources', 'source'));
      const name = input.value.trim();
      if (!name) return;

      const res = await fetch('/' + type, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add');
      }
    }

    async function removeItem(type, name) {
      const res = await fetch('/' + type + '/' + encodeURIComponent(name), {
        method: 'DELETE'
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to remove');
      }
    }
  </script>
</body>
</html>`;
}

// GET / — Run agent and render dashboard
router.get("/", async (req, res) => {
  try {
    const state = await runAgent();
    const html = renderDashboard(state);
    res.send(html);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).send(`
      <h1>newsAgent Error</h1>
      <p>Failed to run the agent pipeline.</p>
      <pre>${error.message}</pre>
      <a href="/">Try again</a>
    `);
  }
});

// GET /refresh — Re-run agent and render fresh results
router.get("/refresh", async (req, res) => {
  try {
    const state = await runAgent();
    const html = renderDashboard(state);
    res.send(html);
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).send(`
      <h1>newsAgent Error</h1>
      <p>Failed to refresh.</p>
      <pre>${error.message}</pre>
      <a href="/">Go back</a>
    `);
  }
});

export default router;
