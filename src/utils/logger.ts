import { createLogger, format, transports } from 'winston';

// Determine the environment
const isProduction = process.env.NODE_ENV === 'production';

// Define log format for console (readable format)
const consoleFormat = format.combine(
  format.colorize(), // Adds colors to log levels (info, error, etc.)
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
);

// Define log format for files (JSON for better structure)
const fileFormat = format.combine(
  format.timestamp(),
  format.json()
);

// Create the logger instance
const logger = createLogger({
  level: 'info', // Default log level
  transports: [
    new transports.Console({
      format: isProduction ? fileFormat : consoleFormat,
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error', format: fileFormat }),
    new transports.File({ filename: 'logs/combined.log', format: fileFormat }),
  ],
});

// Log unhandled exceptions or rejections
logger.exceptions.handle(new transports.File({ filename: __dirname+'logs/exceptions.log' }));
logger.rejections.handle(new transports.File({ filename: __dirname+'logs/rejections.log' }));

export default logger;
