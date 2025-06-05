"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { logger } from "@/lib/debug-logger"

let supabase: any = null

const getSupabase = async () => {
  if (!supabase) {
    logger.debug("Loading Supabase client...")
    const { supabase: sb } = await import("@/lib/supabase")
    supabase = sb
    logger.initSuccess("Supabase Client")
  }
  return supabase
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  logger.initStart("AuthProvider")

  const signInWithGoogle = useCallback(async () => {
    try {
      logger.debug("Starting Google sign-in...")
      const sb = await getSupabase()

      // Get the current URL for proper redirect
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const redirectTo = `${origin}/auth/callback`

      logger.debug(`Setting redirect to: ${redirectTo}`)

      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        logger.error("Google sign-in failed", error)
        throw error
      }
      logger.info("Google sign-in initiated successfully")
    } catch (error) {
      logger.error("Sign in error", error)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      logger.debug("Starting sign out...")
      const sb = await getSupabase()
      const { error } = await sb.auth.signOut()
      if (error) {
        logger.error("Sign out failed", error)
        throw error
      }
      logger.info("Sign out successful")
    } catch (error) {
      logger.error("Sign out error", error)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        logger.debug("Initializing auth...")
        const sb = await getSupabase()

        if (!mounted) {
          logger.warn("Auth initialization cancelled - component unmounted")
          return
        }

        logger.debug("Getting initial session...")
        const {
          data: { session },
        } = await sb.auth.getSession()

        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
          setInitialized(true)
          logger.initSuccess("Auth Session", { hasUser: !!session?.user })
        }

        logger.debug("Setting up auth state listener...")
        const {
          data: { subscription },
        } = sb.auth.onAuthStateChange(async (event: string, session: any) => {
          if (!mounted) return

          logger.info(`Auth state changed: ${event}`, { hasUser: !!session?.user })

          setUser(session?.user ?? null)
          setLoading(false)

          if (session?.user) {
            try {
              logger.debug("Checking if user profile exists...")

              // First check if profile exists
              const { data: existingProfile, error: checkError } = await sb
                .from("profiles")
                .select("id")
                .eq("id", session.user.id)
                .single()

              if (checkError && checkError.code !== "PGRST116") {
                // PGRST116 is "not found" error, which is expected for new users
                logger.error("Error checking profile existence", checkError)
              }

              if (!existingProfile) {
                logger.debug("Creating new user profile...")
                const { error: profileError } = await sb.from("profiles").insert({
                  id: session.user.id,
                  email: session.user.email!,
                  full_name: session.user.user_metadata?.full_name || "Anonymous User",
                  avatar_url: session.user.user_metadata?.avatar_url || null,
                })

                if (profileError) {
                  logger.error("Profile creation failed", profileError)
                  // Don't throw error, just log it - user can still use the app
                } else {
                  logger.info("Profile created successfully")
                }
              } else {
                logger.debug("Profile already exists, updating...")
                // Update existing profile with latest info
                const { error: updateError } = await sb
                  .from("profiles")
                  .update({
                    email: session.user.email!,
                    full_name: session.user.user_metadata?.full_name || "Anonymous User",
                    avatar_url: session.user.user_metadata?.avatar_url || null,
                  })
                  .eq("id", session.user.id)

                if (updateError) {
                  logger.error("Profile update failed", updateError)
                } else {
                  logger.info("Profile updated successfully")
                }
              }

              logger.debug("Initializing user preferences...")
              const { error: prefsError } = await sb.from("user_preferences").upsert(
                {
                  user_id: session.user.id,
                  preferred_tags: [],
                  muted_channels: [],
                },
                {
                  onConflict: "user_id",
                },
              )

              if (prefsError) {
                logger.error("Preferences initialization failed", prefsError)
              } else {
                logger.info("Preferences initialized successfully")
              }
            } catch (error) {
              logger.error("Error in auth state change handler", error)
            }
          }
        })

        return () => {
          mounted = false
          subscription?.unsubscribe()
          logger.debug("Auth subscription cleaned up")
        }
      } catch (error) {
        logger.initError("Auth", error)
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  }

  if (!initialized) {
    logger.debug("Auth not initialized yet, showing loading...")
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Initializing...</div>
      </div>
    )
  }

  logger.initSuccess("AuthProvider", { hasUser: !!user, loading })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    logger.error("useAuth called outside of AuthProvider")
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
