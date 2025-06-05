"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, RefreshCw, CheckCircle, XCircle, Table } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function DatabaseDebug() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [tables, setTables] = useState<string[]>([])

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        setError(`Database connection error: ${error.message}`)
      } else {
        setResults({ message: "Database connection successful", data })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Database connection failed")
    } finally {
      setLoading(false)
    }
  }

  const listTables = async () => {
    setLoading(true)
    setError(null)
    setTables([])

    try {
      // This is a special query to list tables in PostgreSQL
      const { data, error } = await supabase.rpc("list_tables")

      if (error) {
        // If RPC fails, try a direct query
        const { data: tablesData, error: tablesError } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public")

        if (tablesError) {
          setError(`Failed to list tables: ${tablesError.message}`)
        } else if (tablesData) {
          setTables(tablesData.map((t: any) => t.table_name))
        }
      } else if (data) {
        setTables(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to list tables")
    } finally {
      setLoading(false)
    }
  }

  const testVideoInsert = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("No authenticated user found")
        setLoading(false)
        return
      }

      // Try a minimal test insert
      const testData = {
        title: "Test Video " + new Date().toISOString(),
        description: "Test description",
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        poster_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=450&fit=crop",
        creator_id: user.id,
        duration: 300,
        tags: ["test"],
        is_preview: false,
        quality_score: 50,
      }

      console.log("Testing video insert with data:", testData)

      const { data, error } = await supabase.from("videos").insert(testData).select()

      if (error) {
        setError(`Video insert failed: ${error.message}`)
        console.error("Video insert error:", error)
      } else {
        setResults({ message: "Test video inserted successfully", data })

        // Clean up the test video
        if (data && data[0]?.id) {
          await supabase.from("videos").delete().eq("id", data[0].id)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video insert test failed")
    } finally {
      setLoading(false)
    }
  }

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null

  return (
    <Card className="bg-neutral-900 border-neutral-700 mb-4">
      <CardHeader>
        <CardTitle className="text-neutral-100 text-sm flex items-center gap-2">
          <Database className="h-4 w-4" />
          Database Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testConnection} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
            Test Connection
          </Button>
          <Button onClick={listTables} disabled={loading} size="sm" variant="outline">
            <Table className="h-3 w-3 mr-1" />
            List Tables
          </Button>
          <Button onClick={testVideoInsert} disabled={loading} size="sm" variant="secondary">
            Test Video Insert
          </Button>
        </div>

        {error && (
          <div className="text-red-400 text-xs bg-red-900/20 p-3 rounded border border-red-800">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-3 w-3" />
              <span className="font-medium">Error</span>
            </div>
            {error}
          </div>
        )}

        {results && (
          <div className="text-green-400 text-xs bg-green-900/20 p-3 rounded border border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-3 w-3" />
              <span className="font-medium">{results.message}</span>
            </div>
            {results.data && (
              <pre className="mt-2 text-neutral-300 overflow-auto max-h-40">
                {JSON.stringify(results.data, null, 2)}
              </pre>
            )}
          </div>
        )}

        {tables.length > 0 && (
          <div className="text-blue-400 text-xs bg-blue-900/20 p-3 rounded border border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Table className="h-3 w-3" />
              <span className="font-medium">Database Tables</span>
            </div>
            <ul className="mt-2 space-y-1 text-neutral-300">
              {tables.map((table) => (
                <li key={table}>• {table}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
