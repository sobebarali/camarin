import dotenv from "dotenv";
import process from "node:process";
import fs from "fs";
import path from "path";

// Check if .env file exists, create it with defaults if it doesn't
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(
    envPath,
    `NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=debug`
  );
  console.log('.env file created with default values');
}

// Load environment variables from .env file
dotenv.config();

type Environment = "development" | "production" | "test";
type LogLevel = "error" | "warn" | "info" | "http" | "debug";

interface Config {
  environment: Environment;
  port: number;
  apiPrefix: string;
  logLevel: LogLevel;
  corsOptions: {
    origin: string | string[];
    methods: string[];
    credentials: boolean;
    maxAge: number;
  };
  security: {
    rateLimitWindowMs: number;
    rateLimitMax: number;
    jwtSecret?: string;
    jwtExpiresIn?: string;
  };
  // Add other configurations as needed (database, auth, etc.)
}

const environment = (process.env.NODE_ENV as Environment) || "development";

export const config: Config = {
  environment,
  port: parseInt(process.env.PORT || "8000", 10),
  apiPrefix: "/api",
  logLevel: (process.env.LOG_LEVEL as LogLevel) || "info",
  corsOptions: {
    origin: environment === "production" 
      ? process.env.FRONTEND_URL?.split(",") || [""]
      : "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    maxAge: 86400, // 24 hours
  },
  security: {
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: environment === "production" ? 100 : 1000,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  }
};

// Validate critical configuration
if (environment === "production") {
  // In production, we should have these set
  const requiredEnvVars = ["PORT", "FRONTEND_URL"];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  }
} 