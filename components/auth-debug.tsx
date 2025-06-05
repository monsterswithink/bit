"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, RefreshCw, LogIn, LogOut } from "lucide-react"

export function AuthDebug() {
  const { user, signInWithGoogle, signOut } = useAuth()
  const [showDetails, setShowDetails] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null

  return (
    <Card className="bg-neutral-900 border-neutral-700 mb-4">
      <CardHeader>
        <CardTitle className="text-neutral-100 text-sm flex items-center gap-2">
          <User className="h-4 w-4" />
          Authentication Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => signInWithGoogle()} size="sm" variant="outline">
            <LogIn className="h-3 w-3 mr-1" />
            Sign In with Google
          </Button>

          <Button onClick={() => signOut()} size="sm" variant="outline">
            <LogOut className="h-3 w-3 mr-1" />
            Sign Out
          </Button>

          <Button onClick={() => setShowDetails(!showDetails)} size="sm" variant="secondary">
            <RefreshCw className="h-3 w-3 mr-1" />
            {showDetails ? "Hide Details" : "Show Details"}
          </Button>
        </div>

        <div className="text-xs text-neutral-400">Status: {user ? "Authenticated" : "Not authenticated"}</div>

        {user && showDetails && (
          <div className="bg-neutral-800 p-3 rounded text-xs overflow-auto max-h-60">
            <pre className="text-neutral-300">{JSON.stringify(user, null, 2)}</pre>
          </div>
        )}

        <div className="text-xs text-neutral-500 mt-2">
          <p>Auth Debug Tips:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>Check browser console for auth errors</li>
            <li>Verify redirect URL in Supabase dashboard</li>
            <li>Clear browser cookies if issues persist</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
