import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";

const app = express();

// CORS configuration for production
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (
    origin &&
    (origin.includes(".vercel.app") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      origin.includes(".replit.dev") ||
      origin.includes(".replit.app"))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging function for production
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const { setupInitialData } = await import("./setup-data");
    await setupInitialData();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("Initial data setup skipped or failed:", error.message);
    } else {
      console.log("Initial data setup skipped or failed:", String(error));
    }
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  app.get("/health", async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const testUser = await storage.getUser("demo-user");
      res.json({
        message: "API server running",
        status: "ok",
        database: testUser ? "connected" : "no demo user",
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      res.status(500).json({
        message: "Database error",
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  });

  if (process.env.NODE_ENV === "production") {
    const staticPath = path.resolve(process.cwd(), "dist/public");
    app.use(express.static(staticPath));

    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        res.status(404).json({ message: "API endpoint not found" });
      } else {
        res.json({ message: "API server running", status: "ok" });
      }
    });
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
