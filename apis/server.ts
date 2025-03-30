// @ts-types="npm:@types/express
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import { config } from "./config/config.ts";
import { errorHandler } from "./middleware/error.middleware.ts";
import { notFoundHandler } from "./middleware/not-found.middleware.ts";
import { routes } from "./router/index.ts";
import process from "node:process";

const app: Application = express();
const PORT = config.port || 8000;

// Security and performance middleware
app.use(helmet()); // Security headers
app.use(cors(config.corsOptions)); // CORS with proper configuration
app.use(compression()); // Response compression
app.use(express.json({ limit: '10kb' })); // Parse JSON bodies with size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP parameter pollution

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter); // Apply rate limiting to API routes only

// Set security HTTP headers
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    connectSrc: ["'self'"],
    imgSrc: ["'self'", "data:"],
  },
}));

// Request logging
if (config.environment !== "test") {
  app.use(morgan(config.environment === "development" ? "dev" : "combined"));
}

// Disable X-Powered-By header
app.disable('x-powered-by');

// API routes
app.use("/api", routes);

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "UP" });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown handling
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;