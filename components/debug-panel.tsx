"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { logger } from "@/lib/debug-logger"
import { Bug, Download, Trash2, Eye, EyeOff } from "lucide-react"

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLogs(logger.getLogs())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const downloadLogs = () => {
    const dataStr = logger.exportLogs()
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `bit-logs-${new Date().toISOString()}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const clearLogs = () => {
    logger.clearLogs()
    setLogs([])
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-500"
      case "warn":
        return "bg-yellow-500"
      case "info":
        return "bg-blue-500"
      case "debug":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700"
        size="sm"
      >
        <Bug className="h-4 w-4" />
      </Button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 w-96 max-h-96">
          <Card className="bg-gray-900 border-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-400 text-sm flex items-center justify-between">
                Debug Panel
                <div className="flex gap-2">
                  <Button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    {autoRefresh ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                  <Button onClick={downloadLogs} variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button onClick={clearLogs} variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto text-xs">
              {logs.length === 0 ? (
                <p className="text-gray-400">No logs yet...</p>
              ) : (
                <div className="space-y-2">
                  {logs.slice(-20).map((log, index) => (
                    <div key={index} className="border-l-2 border-gray-600 pl-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${getLevelColor(log.level)} text-white text-xs`}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-gray-400 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-white text-xs">{log.message}</p>
                      {log.data && (
                        <details className="mt-1">
                          <summary className="text-gray-400 cursor-pointer text-xs">Data</summary>
                          <pre className="text-gray-300 text-xs mt-1 bg-gray-800 p-1 rounded overflow-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
