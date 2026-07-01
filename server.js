import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dashboardRouter from "./routes/dashboard.js";
import settingsRouter from "./routes/settings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies (for settings endpoints)
app.use(express.json());

// Serve static files from public/
app.use(express.static(path.join(__dirname, "public")));

// Mount routes
app.use("/", settingsRouter); // Settings endpoints (/topics, /competitors, /sources)
app.use("/", dashboardRouter); // Dashboard (/ and /refresh)

app.listen(PORT, () => {
  console.log(`newsAgent running at http://localhost:${PORT}`);
});
