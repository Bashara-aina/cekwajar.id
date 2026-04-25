// Structured logger for API routes

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  route?: string;
  error?: string;
  duration?: number;
  [key: string]: unknown;
}

export function logger(
  level: LogLevel,
  message: string,
  meta?: { route?: string; error?: string; duration?: number }
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(entry));
  } else {
    const metaStr = meta ? JSON.stringify(meta) : '';
    console.log(`[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message} ${metaStr}`);
  }
}
