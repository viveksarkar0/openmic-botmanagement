interface LogEntry {
  timestamp: string
  level: "info" | "warn" | "error"
  message: string
  data?: any
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private addLog(level: LogEntry["level"], message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    }

    this.logs.unshift(entry)

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Console output
    const logMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.log
    logMethod(`[${entry.timestamp}] ${level.toUpperCase()}: ${message}`, data || "")
  }

  info(message: string, data?: any) {
    this.addLog("info", message, data)
  }

  warn(message: string, data?: any) {
    this.addLog("warn", message, data)
  }

  error(message: string, data?: any) {
    this.addLog("error", message, data)
  }

  getLogs(level?: LogEntry["level"], limit = 100): LogEntry[] {
    let filteredLogs = this.logs

    if (level) {
      filteredLogs = this.logs.filter((log) => log.level === level)
    }

    return filteredLogs.slice(0, limit)
  }
}

export const logger = new Logger()
