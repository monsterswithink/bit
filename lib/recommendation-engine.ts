// Lazy load supabase to prevent initialization issues
let supabase: any = null

const getSupabase = async () => {
  if (!supabase) {
    const { supabase: sb } = await import("./supabase")
    supabase = sb
  }
  return supabase
}

export interface VideoRecommendation {
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
  quality_score: number
  relevance_score: number
  created_at: string
}

export async function getRecommendedVideos(
  userId: string,
  limit = 20,
  excludeVideoIds: string[] = [],
): Promise<VideoRecommendation[]> {
  try {
    const sb = await getSupabase()

    const { data: preferences } = await sb
      .from("user_preferences")
      .select("preferred_tags, muted_channels")
      .eq("user_id", userId)
      .single()

    const { data: interactions } = await sb
      .from("user_interactions")
      .select("video_id, interaction_type")
      .eq("user_id", userId)
      .in("interaction_type", ["like", "view", "show_more_like_this"])

    const { data: videos } = await sb
      .from("videos")
      .select(`
        *,
        profiles!videos_creator_id_fkey(id, full_name)
      `)
      .not("id", "in", `(${excludeVideoIds.join(",")})`)
      .order("created_at", { ascending: false })
      .limit(100)

    if (!videos) return []

    const mutedChannels = preferences?.muted_channels || []
    const filteredVideos = videos.filter((video: any) => !mutedChannels.includes(video.creator_id))

    const preferredTags = preferences?.preferred_tags || []
    const likedVideoIds =
      interactions?.filter((i: any) => i.interaction_type === "like").map((i: any) => i.video_id) || []
    const viewedVideoIds =
      interactions?.filter((i: any) => i.interaction_type === "view").map((i: any) => i.video_id) || []

    const scoredVideos = filteredVideos.map((video: any) => {
      let relevanceScore = 0

      const matchingTags = video.tags.filter((tag: string) => preferredTags.includes(tag))
      relevanceScore += matchingTags.length * 10

      if (likedVideoIds.includes(video.id)) {
        relevanceScore += 20
      }
      if (viewedVideoIds.includes(video.id)) {
        relevanceScore += 5
      }

      relevanceScore += video.quality_score * 0.5

      const daysSinceCreated = (Date.now() - new Date(video.created_at).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceCreated < 7) {
        relevanceScore += 10
      }

      return {
        ...video,
        relevance_score: relevanceScore,
      }
    })

    scoredVideos.sort((a: any, b: any) => {
      const scoreA = a.quality_score + a.relevance_score
      const scoreB = b.quality_score + b.relevance_score
      return scoreB - scoreA
    })

    return scoredVideos.slice(0, limit)
  } catch (error) {
    console.error("Error getting recommendations:", error)
    return []
  }
}

export async function getShowcaseVideos(userId?: string): Promise<VideoRecommendation[]> {
  try {
    const sb = await getSupabase()

    const { data: videos } = await sb
      .from("videos")
      .select(`
        *,
        profiles!videos_creator_id_fkey(id, full_name)
      `)
      .gte("quality_score", 70)
      .eq("is_preview", false)
      .order("quality_score", { ascending: false })
      .limit(10)

    if (!videos) return []

    if (userId) {
      return getRecommendedVideos(userId, 10)
    }

    return videos.map((video: any) => ({
      ...video,
      relevance_score: video.quality_score,
    }))
  } catch (error) {
    console.error("Error getting showcase videos:", error)
    return []
  }
}

export async function getUpcomingPreviews(userId?: string): Promise<VideoRecommendation[]> {
  try {
    const sb = await getSupabase()

    const { data: previews } = await sb
      .from("videos")
      .select(`
        *,
        profiles!videos_creator_id_fkey(id, full_name)
      `)
      .eq("is_preview", true)
      .order("created_at", { ascending: false })
      .limit(5)

    if (!previews) return []

    return previews.map((preview: any) => ({
      ...preview,
      relevance_score: preview.quality_score,
    }))
  } catch (error) {
    console.error("Error getting upcoming previews:", error)
    return []
  }
}
