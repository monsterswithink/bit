// Environment configuration with fallbacks for development
const NEXT_PUBLIC_SUPABASE_URL = "https://bhswiskeqgfxsqtnvrpi.supabase.co"

// Helper function to get environment variable with fallback
function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] || fallback
  if (!value) {
    console.warn(`⚠️ Missing environment variable: ${key}`)
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variable: ${key}`)
    }
    // Return empty string in development to prevent crashes
    return ""
  }
  return value
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  HUGGINGFACE_API_KEY: getEnvVar("HUGGINGFACE_API_KEY"),
  OPENAI_API_KEY: getEnvVar("OPENAI_API_KEY"),
  GOOGLE_CLIENT_ID: getEnvVar("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnvVar("GOOGLE_CLIENT_SECRET"),
}

// Validate critical environment variables only in production
if (process.env.NODE_ENV === "production") {
  const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingVars)
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`)
  }
}

// Log environment status (without sensitive values)
console.log("🔧 Environment status:", {
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_URL: NEXT_PUBLIC_SUPABASE_URL,
  HAS_SUPABASE_KEY: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  HAS_GOOGLE_CLIENT_ID: !!env.GOOGLE_CLIENT_ID,
})
