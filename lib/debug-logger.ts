interface LogLevel {
  ERROR: "error"
  WARN: "warn"
  INFO: "info"
  DEBUG: "debug"
}

const LOG_LEVELS: LogLevel = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
}

class DebugLogger {
  private isDevelopment = process.env.NODE_ENV === "development"
  private logs: Array<{ level: string; message: string; data?: any; timestamp: string }> = []

  private formatMessage(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const emoji = this.getEmoji(level)

    return {
      formatted: `${emoji} [${timestamp}] ${level.toUpperCase()}: ${message}`,
      raw: { level, message, data, timestamp },
    }
  }

  private getEmoji(level: string): string {
    switch (level) {
      case LOG_LEVELS.ERROR:
        return "🚨"
      case LOG_LEVELS.WARN:
        return "⚠️"
      case LOG_LEVELS.INFO:
        return "ℹ️"
      case LOG_LEVELS.DEBUG:
        return "🐛"
      default:
        return "📝"
    }
  }

  error(message: string, data?: any) {
    const log = this.formatMessage(LOG_LEVELS.ERROR, message, data)
    console.error(log.formatted, data)
    this.logs.push(log.raw)
  }

  warn(message: string, data?: any) {
    const log = this.formatMessage(LOG_LEVELS.WARN, message, data)
    console.warn(log.formatted, data)
    this.logs.push(log.raw)
  }

  info(message: string, data?: any) {
    const log = this.formatMessage(LOG_LEVELS.INFO, message, data)
    console.info(log.formatted, data)
    this.logs.push(log.raw)
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      const log = this.formatMessage(LOG_LEVELS.DEBUG, message, data)
      console.debug(log.formatted, data)
      this.logs.push(log.raw)
    }
  }

  // Monitor specific initialization events
  initStart(component: string) {
    this.debug(`Initializing ${component}`)
  }

  initSuccess(component: string, data?: any) {
    this.info(`✅ ${component} initialized successfully`, data)
  }

  initError(component: string, error: any) {
    this.error(`❌ ${component} initialization failed`, error)
  }

  // Get all logs for debugging
  getLogs() {
    return this.logs
  }

  // Clear logs
  clearLogs() {
    this.logs = []
  }

  // Export logs as JSON
  exportLogs() {
    return JSON.stringify(this.logs, null, 2)
  }
}

export const logger = new DebugLogger()

// Global error handler
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    logger.error("Global Error Handler", {
      message: event.error?.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    })
  })

  window.addEventListener("unhandledrejection", (event) => {
    logger.error("Unhandled Promise Rejection", {
      reason: event.reason,
      promise: event.promise,
    })
  })
}
