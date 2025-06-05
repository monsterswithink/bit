import { createClient } from "@supabase/supabase-js"
import { env } from "./env"
import { logger } from "@/lib/debug-logger"

// Ensure environment variables are available
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  logger.error("Missing NEXT_PUBLIC_SUPABASE_URL")
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseAnonKey) {
  logger.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY")
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in production")
  }
  // In development, we'll create a dummy client that shows helpful errors
  logger.warn("Creating dummy Supabase client for development")
}

// Create Supabase client with error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey || "dummy-key-for-development", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
})

// Log client initialization
logger.debug("Supabase client initialized", {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  env: process.env.NODE_ENV,
})

// Add error handler for missing keys
if (!supabaseAnonKey && process.env.NODE_ENV === "development") {
  const originalFrom = supabase.from
  supabase.from = function (table: string) {
    logger.error("Supabase operation attempted without valid ANON_KEY")
    logger.debug("Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment")
    return originalFrom.call(this, table)
  }
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          description: string
          video_url: string
          poster_url: string
          creator_id: string
          tags: string[]
          views: number
          likes: number
          dislikes: number
          duration: number
          is_preview: boolean
          preview_of: string | null
          quality_score: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          video_url: string
          poster_url: string
          creator_id: string
          tags?: string[]
          views?: number
          likes?: number
          dislikes?: number
          duration: number
          is_preview?: boolean
          preview_of?: string | null
          quality_score?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          video_url?: string
          poster_url?: string
          creator_id?: string
          tags?: string[]
          views?: number
          likes?: number
          dislikes?: number
          duration?: number
          is_preview?: boolean
          preview_of?: string | null
          quality_score?: number
          created_at?: string
        }
      }
      user_interactions: {
        Row: {
          id: string
          user_id: string
          video_id: string
          interaction_type: "like" | "dislike" | "view" | "mute_channel" | "show_more_like_this" | "hide"
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          interaction_type: "like" | "dislike" | "view" | "mute_channel" | "show_more_like_this" | "hide"
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          interaction_type?: "like" | "dislike" | "view" | "mute_channel" | "show_more_like_this" | "hide"
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          preferred_tags: string[]
          muted_channels: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preferred_tags?: string[]
          muted_channels?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preferred_tags?: string[]
          muted_channels?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
