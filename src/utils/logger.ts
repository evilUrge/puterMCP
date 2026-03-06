// CRITICAL: All logging MUST go to stderr.
// stdout is RESERVED for MCP JSON-RPC protocol messages.

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0, info: 1, warn: 2, error: 3,
};

class Logger {
  private level: LogLevel;

  constructor(level?: LogLevel) {
    this.level = (process.env.PUTER_MCP_LOG_LEVEL as LogLevel) || level || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.level];
  }

  private log(level: LogLevel, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return;
    const prefix = `[puterMCP:${level.toUpperCase()}]`;
    console.error(prefix, ...args);
  }

  debug(...args: unknown[]): void { this.log('debug', ...args); }
  info(...args: unknown[]): void { this.log('info', ...args); }
  warn(...args: unknown[]): void { this.log('warn', ...args); }
  error(...args: unknown[]): void { this.log('error', ...args); }
}

export const logger = new Logger();
