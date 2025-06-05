"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { HeroSlider } from "@/components/hero-slider"
import { VideoCard } from "@/components/video-card"
import { VideoPlayer } from "@/components/video-player"
import {
  getShowcaseVideos,
  getRecommendedVideos,
  getUpcomingPreviews,
  type VideoRecommendation,
} from "@/lib/recommendation-engine"

// Lazy load supabase to prevent initialization issues
let supabase: any = null

const getSupabase = async () => {
  if (!supabase) {
    const { supabase: sb } = await import("@/lib/supabase")
    supabase = sb
  }
  return supabase
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<"showcase" | "free-for-all">("showcase")
  const [heroVideos, setHeroVideos] = useState<VideoRecommendation[]>([])
  const [showcaseVideos, setShowcaseVideos] = useState<VideoRecommendation[]>([])
  const [freeForAllVideos, setFreeForAllVideos] = useState<VideoRecommendation[]>([])
  const [upcomingPreviews, setUpcomingPreviews] = useState<VideoRecommendation[]>([])
  const [selectedVideo, setSelectedVideo] = useState<VideoRecommendation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading) {
      loadContent()
    }
  }, [user, loading])

  const loadContent = async () => {
    setIsLoading(true)
    try {
      const [showcase, previews] = await Promise.all([getShowcaseVideos(user?.id), getUpcomingPreviews(user?.id)])

      setHeroVideos(showcase.slice(0, 5))
      setShowcaseVideos(showcase)
      setUpcomingPreviews(previews)

      if (user) {
        const recommended = await getRecommendedVideos(user.id, 50)
        setFreeForAllVideos(recommended)
      } else {
        const sb = await getSupabase()
        const { data: allVideos } = await sb
          .from("videos")
          .select(`
            *,
            profiles!videos_creator_id_fkey(id, full_name)
          `)
          .eq("is_preview", false)
          .order("created_at", { ascending: false })
          .limit(50)

        if (allVideos) {
          setFreeForAllVideos(
            allVideos.map((video: any) => ({
              ...video,
              relevance_score: video.quality_score,
            })),
          )
        }
      }
    } catch (error) {
      console.error("Error loading content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVideoSelect = async (video: VideoRecommendation) => {
    setSelectedVideo(video)

    if (user) {
      try {
        const sb = await getSupabase()
        await sb.from("user_interactions").insert({
          user_id: user.id,
          video_id: video.id,
          interaction_type: "view",
        })

        await sb
          .from("videos")
          .update({ views: video.views + 1 })
          .eq("id", video.id)
      } catch (error) {
        console.error("Error recording view:", error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-neutral-100 text-xl">Loading...</div>
      </div>
    )
  }

  const currentVideos = activeTab === "showcase" ? showcaseVideos : freeForAllVideos

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "showcase" && heroVideos.length > 0 && (
        <HeroSlider videos={heroVideos} onVideoSelect={handleVideoSelect} />
      )}

      <div className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === "showcase" && upcomingPreviews.length > 0 && (
            <section className="mb-12">
              <h2 className="text-neutral-100 text-2xl font-bold mb-6">Upcoming</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {upcomingPreviews.map((video) => (
                  <VideoCard key={video.id} video={video} onVideoSelect={handleVideoSelect} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-neutral-100 text-2xl font-bold mb-6">
              {activeTab === "showcase" ? "Featured Content" : "All Videos"}
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="bg-neutral-800 rounded-lg aspect-video animate-pulse" />
                ))}
              </div>
            ) : currentVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentVideos.map((video) => (
                  <VideoCard key={video.id} video={video} onVideoSelect={handleVideoSelect} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-neutral-400 text-lg mb-4">
                  {activeTab === "showcase" ? "No featured content available yet" : "No videos found"}
                </div>
                {user && (
                  <p className="text-neutral-500">Be the first to upload content and help build the community!</p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedVideo && <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
    </div>
  )
}
