"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { logger } from "@/lib/debug-logger"

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState("Processing authentication...")

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus("Completing authentication...")
        logger.debug("Auth callback started")

        // Lazy load supabase to prevent initialization issues
        const { supabase } = await import("@/lib/supabase")

        // Handle the hash fragment properly
        if (window.location.hash && window.location.hash.includes("access_token")) {
          logger.debug("Hash fragment detected, setting session")

          // The hash contains the token - we need to handle this case
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1), // Remove the # character
          )

          // Let Supabase handle the session
          await supabase.auth.setSession({
            access_token: hashParams.get("access_token") || "",
            refresh_token: hashParams.get("refresh_token") || "",
          })

          logger.info("Session set from hash params")
        }

        // Get the session to verify it worked
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          logger.error("Auth callback error:", error)
          setStatus("Authentication failed. Redirecting...")
        } else {
          logger.info("Authentication successful", { user: data.session?.user?.id })
          setStatus("Authentication successful. Redirecting...")
        }

        // Use replace to prevent back button issues
        setTimeout(() => {
          router.replace("/")
        }, 1500)
      } catch (error) {
        logger.error("Unexpected error in auth callback:", error)
        setStatus("Error occurred. Redirecting...")
        setTimeout(() => {
          router.replace("/")
        }, 1500)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-white text-xl mb-4">{status}</div>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  )
}
