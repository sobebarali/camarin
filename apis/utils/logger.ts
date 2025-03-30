import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { config } from "../config/config.ts";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define log directory
const logDir = "logs";

// Transport for development console logs
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(
      ({ level, message, timestamp, ...metadata }) => {
        let metaString = "";
        if (Object.keys(metadata).length > 0 && metadata.stack !== undefined) {
          metaString = "\n" + JSON.stringify(metadata, null, 2);
        }
        return `${timestamp} [${level}]: ${message}${metaString}`;
      }
    )
  ),
});

// Create transports array
const transports: winston.transport[] = [consoleTransport];

// Add file transports in production
if (config.environment === "production") {
  // Transport for error logs (with rotation)
  const errorLogTransport = new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  });

  // Transport for all logs (with rotation)
  const combinedLogTransport = new DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true, 
    maxSize: '20m',
    maxFiles: '14d',
  });

  transports.push(errorLogTransport, combinedLogTransport);
}

// Create the logger
const logger = winston.createLogger({
  level: config.environment === "development" ? "debug" : "info",
  format: logFormat,
  defaultMeta: { service: 'api-service' },
  transports,
  exitOnError: false,
});

// Create a stream object for morgan
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export { logger, stream }; 