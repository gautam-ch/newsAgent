import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, "..", "config.json");

/**
 * LangGraph Node: LoadConfig
 * Reads config.json from disk and loads it into graph state.
 */
export async function loadConfig(state) {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    const config = JSON.parse(raw);
    return { config };
  } catch (error) {
    console.error("Failed to load config.json:", error.message);
    return {
      config: { country: "India", topics: [], competitors: [], sources: [] },
      errors: [...(state.errors || []), `Config load failed: ${error.message}`],
    };
  }
}
