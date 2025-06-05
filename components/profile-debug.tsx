"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, RefreshCw, CheckCircle, XCircle } from "lucide-react"

export function ProfileDebug() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastCheck, setLastCheck] = useState<string>("")

  const checkProfile = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      console.log("Checking profile for user:", user.id)

      const { data, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

      console.log("Profile check result:", { data, profileError })

      if (profileError) {
        setError(`Profile check error: ${profileError.message} (Code: ${profileError.code})`)
        setProfile(null)
      } else if (data) {
        setProfile(data)
        setError(null)
      } else {
        setProfile(null)
        setError("No profile found")
      }

      setLastCheck(new Date().toLocaleTimeString())
    } catch (err) {
      console.error("Profile check exception:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      console.log("Creating profile for user:", user.id)

      const { data, error: createError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || "Anonymous User",
            avatar_url: user.user_metadata?.avatar_url || null,
          },
          {
            onConflict: "id",
          },
        )
        .select()

      console.log("Profile creation result:", { data, createError })

      if (createError) {
        setError(`Profile creation error: ${createError.message} (Code: ${createError.code})`)
      } else {
        await checkProfile()
      }
    } catch (err) {
      console.error("Profile creation exception:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const testDatabaseConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        setError(`Database connection error: ${error.message}`)
      } else {
        setError(null)
        console.log("Database connection successful")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Database connection failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      checkProfile()
    }
  }, [user])

  if (!user) return null

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null

  return (
    <Card className="bg-neutral-900 border-neutral-700 mb-4">
      <CardHeader>
        <CardTitle className="text-neutral-100 text-sm flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile Debug {lastCheck && <span className="text-xs text-neutral-400">({lastCheck})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={checkProfile} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
            Check Profile
          </Button>
          <Button onClick={createProfile} disabled={loading} size="sm">
            Create/Update Profile
          </Button>
          <Button onClick={testDatabaseConnection} disabled={loading} size="sm" variant="secondary">
            Test DB Connection
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

        {profile && (
          <div className="text-green-400 text-xs bg-green-900/20 p-3 rounded border border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-3 w-3" />
              <span className="font-medium">Profile Found</span>
            </div>
            <div className="space-y-1 text-neutral-300">
              <div>ID: {profile.id}</div>
              <div>Email: {profile.email}</div>
              <div>Name: {profile.full_name}</div>
              <div>Created: {new Date(profile.created_at).toLocaleString()}</div>
            </div>
          </div>
        )}

        {!profile && !error && !loading && (
          <div className="text-yellow-400 text-xs bg-yellow-900/20 p-3 rounded border border-yellow-800">
            ⚠️ No profile found - try creating one
          </div>
        )}

        <div className="text-xs text-neutral-500 space-y-1">
          <div>User ID: {user.id}</div>
          <div>Email: {user.email}</div>
        </div>
      </CardContent>
    </Card>
  )
}
