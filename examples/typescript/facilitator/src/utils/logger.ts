/**
 * Logger utility for structured logging
 * Provides consistent log formatting with timestamp, level, and context
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export class Logger {
  private context: string;
  private enabled: boolean;

  constructor(context: string) {
    this.context = context;
    this.enabled = process.env.NODE_ENV !== 'test';
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level}] [${this.context}] ${message}`;

    if (data) {
      // For error objects, extract stack trace
      if (data instanceof Error) {
        return `${base}\n  Error: ${data.message}\n  Stack: ${data.stack}`;
      }
      // For objects, stringify with proper formatting
      if (typeof data === 'object') {
        return `${base}\n  Data: ${JSON.stringify(data, null, 2)}`;
      }
      return `${base} | ${data}`;
    }

    return base;
  }

  debug(message: string, data?: any): void {
    if (this.enabled && process.env.LOG_LEVEL !== 'production') {
      console.log(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.enabled) {
      console.log(this.formatMessage(LogLevel.INFO, message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.enabled) {
      console.warn(this.formatMessage(LogLevel.WARN, message, data));
    }
  }

  error(message: string, error?: any): void {
    if (this.enabled) {
      console.error(this.formatMessage(LogLevel.ERROR, message, error));
    }
  }

  // Log with execution time tracking
  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(`${label} completed`, { durationMs: duration });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`${label} failed`, { durationMs: duration, error });
      throw error;
    }
  }

  // Create child logger with additional context
  child(subContext: string): Logger {
    return new Logger(`${this.context}:${subContext}`);
  }
}

// Factory function to create logger instances
export function createLogger(context: string): Logger {
  return new Logger(context);
}