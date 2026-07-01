import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { loadConfig } from "../nodes/loadConfig.js";
import { fetchNewsNode } from "../nodes/fetchNews.js";
import { deduplicate } from "../nodes/deduplicate.js";
import { analyzeArticles } from "../nodes/analyzeArticles.js";
import { generateReport } from "../nodes/generateReport.js";

// Define the shared state schema using Annotation
const AgentState = Annotation.Root({
  config: Annotation({
    reducer: (_, val) => val,
    default: () => ({}),
  }),
  rawArticles: Annotation({
    reducer: (_, val) => val,
    default: () => [],
  }),
  analyzedArticles: Annotation({
    reducer: (_, val) => val,
    default: () => [],
  }),
  report: Annotation({
    reducer: (_, val) => val,
    default: () => ({ high: [], medium: [], low: [] }),
  }),
  errors: Annotation({
    reducer: (prev, val) => [...(prev || []), ...(val || [])],
    default: () => [],
  }),
});

// Build the LangGraph workflow
const workflow = new StateGraph(AgentState)
  .addNode("LoadConfig", loadConfig)
  .addNode("FetchNews", fetchNewsNode)
  .addNode("Deduplicate", deduplicate)
  .addNode("AnalyzeArticles", analyzeArticles)
  .addNode("GenerateReport", generateReport)
  .addEdge(START, "LoadConfig")
  .addEdge("LoadConfig", "FetchNews")
  .addEdge("FetchNews", "Deduplicate")
  .addEdge("Deduplicate", "AnalyzeArticles")
  .addEdge("AnalyzeArticles", "GenerateReport")
  .addEdge("GenerateReport", END);

// Compile the graph once
const app = workflow.compile();

/**
 * Run the full agent pipeline.
 * Returns the final state with config, report, and any errors.
 */
export async function runAgent() {
  console.log("\n=== Running newsAgent pipeline ===\n");
  const startTime = Date.now();

  const result = await app.invoke({});

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== Pipeline complete in ${elapsed}s ===\n`);

  return result;
}
