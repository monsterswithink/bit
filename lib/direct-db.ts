// This is a utility for direct database access when normal methods fail
// Only use this in development or when troubleshooting

import { env } from "./env"

// Direct database access using fetch API
export async function directDatabaseInsert(table: string, data: any) {
  try {
    console.log(`Attempting direct insert to ${table}:`, data)

    const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}`
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Direct insert failed (${response.status}):`, errorText)
      return { error: { message: `API error: ${response.status} - ${errorText}` } }
    }

    const result = await response.json()
    console.log("Direct insert successful:", result)
    return { data: result }
  } catch (error) {
    console.error("Direct insert exception:", error)
    return { error }
  }
}

export async function directDatabaseQuery(table: string, query = "") {
  try {
    const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?${query}`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Direct query failed (${response.status}):`, errorText)
      return { error: { message: `API error: ${response.status} - ${errorText}` } }
    }

    const result = await response.json()
    return { data: result }
  } catch (error) {
    console.error("Direct query exception:", error)
    return { error }
  }
}
