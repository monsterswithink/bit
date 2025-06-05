"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export function EnvDebug() {
  // Only show in development
  if (process.env.NODE_ENV !== "development") return null

  const envVars = [
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      required: true,
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      required: true,
    },
    {
      name: "GOOGLE_CLIENT_ID",
      value: process.env.GOOGLE_CLIENT_ID,
      required: true,
    },
    {
      name: "GOOGLE_CLIENT_SECRET",
      value: process.env.GOOGLE_CLIENT_SECRET,
      required: true,
    },
  ]

  const getStatus = (envVar: any) => {
    if (!envVar.value) {
      return envVar.required ? "error" : "warning"
    }
    return "success"
  }

  const getIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      default:
        return null
    }
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "success":
        return "default"
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card className="bg-neutral-900 border-neutral-700 mb-4">
      <CardHeader>
        <CardTitle className="text-neutral-100 text-sm flex items-center gap-2">Environment Variables</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {envVars.map((envVar) => {
            const status = getStatus(envVar)
            return (
              <div key={envVar.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getIcon(status)}
                  <span className="text-sm text-neutral-200">{envVar.name}</span>
                  {envVar.required && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                <Badge variant={getBadgeVariant(status)} className="text-xs">
                  {envVar.value ? "Set" : "Missing"}
                </Badge>
              </div>
            )
          })}
        </div>

        {envVars.some((env) => !env.value && env.required) && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
            <p className="text-red-400 text-sm">
              ⚠️ Missing required environment variables. Check your .env.local file or Vercel environment settings.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
