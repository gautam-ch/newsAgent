import { Router } from "express";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, "..", "config.json");

const router = Router();

// Helper: read config from disk
async function readConfig() {
  const raw = await readFile(CONFIG_PATH, "utf-8");
  return JSON.parse(raw);
}

// Helper: write config to disk
async function writeConfig(config) {
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

// --- Topics ---

router.post("/topics", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Topic name is required" });
    }

    const config = await readConfig();
    const trimmed = name.trim();

    if (config.topics.includes(trimmed)) {
      return res.status(409).json({ error: "Topic already exists" });
    }

    config.topics.push(trimmed);
    await writeConfig(config);
    res.json({ message: `Topic "${trimmed}" added`, topics: config.topics });
  } catch (error) {
    console.error("Add topic error:", error.message);
    res.status(500).json({ error: "Failed to add topic" });
  }
});

router.delete("/topics/:name", async (req, res) => {
  try {
    const config = await readConfig();
    const target = req.params.name;
    const index = config.topics.findIndex(
      (t) => t.toLowerCase() === target.toLowerCase()
    );

    if (index === -1) {
      return res.status(404).json({ error: "Topic not found" });
    }

    config.topics.splice(index, 1);
    await writeConfig(config);
    res.json({ message: `Topic "${target}" removed`, topics: config.topics });
  } catch (error) {
    console.error("Remove topic error:", error.message);
    res.status(500).json({ error: "Failed to remove topic" });
  }
});

// --- Competitors ---

router.post("/competitors", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Competitor name is required" });
    }

    const config = await readConfig();
    const trimmed = name.trim();

    if (config.competitors.includes(trimmed)) {
      return res.status(409).json({ error: "Competitor already exists" });
    }

    config.competitors.push(trimmed);
    await writeConfig(config);
    res.json({ message: `Competitor "${trimmed}" added`, competitors: config.competitors });
  } catch (error) {
    console.error("Add competitor error:", error.message);
    res.status(500).json({ error: "Failed to add competitor" });
  }
});

router.delete("/competitors/:name", async (req, res) => {
  try {
    const config = await readConfig();
    const target = req.params.name;
    const index = config.competitors.findIndex(
      (c) => c.toLowerCase() === target.toLowerCase()
    );

    if (index === -1) {
      return res.status(404).json({ error: "Competitor not found" });
    }

    config.competitors.splice(index, 1);
    await writeConfig(config);
    res.json({ message: `Competitor "${target}" removed`, competitors: config.competitors });
  } catch (error) {
    console.error("Remove competitor error:", error.message);
    res.status(500).json({ error: "Failed to remove competitor" });
  }
});

// --- Sources ---

router.post("/sources", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Source name is required" });
    }

    const config = await readConfig();
    const trimmed = name.trim();

    if (config.sources.includes(trimmed)) {
      return res.status(409).json({ error: "Source already exists" });
    }

    config.sources.push(trimmed);
    await writeConfig(config);
    res.json({ message: `Source "${trimmed}" added`, sources: config.sources });
  } catch (error) {
    console.error("Add source error:", error.message);
    res.status(500).json({ error: "Failed to add source" });
  }
});

router.delete("/sources/:name", async (req, res) => {
  try {
    const config = await readConfig();
    const target = req.params.name;
    const index = config.sources.findIndex(
      (s) => s.toLowerCase() === target.toLowerCase()
    );

    if (index === -1) {
      return res.status(404).json({ error: "Source not found" });
    }

    config.sources.splice(index, 1);
    await writeConfig(config);
    res.json({ message: `Source "${target}" removed`, sources: config.sources });
  } catch (error) {
    console.error("Remove source error:", error.message);
    res.status(500).json({ error: "Failed to remove source" });
  }
});

export default router;
