"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThumbsUp, ThumbsDown, EyeOff, VolumeX } from "lucide-react"
import type { VideoRecommendation } from "@/lib/recommendation-engine"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

interface VideoCardProps {
  video: VideoRecommendation
  onVideoSelect: (video: VideoRecommendation) => void
  showInteractions?: boolean
}

export function VideoCard({ video, onVideoSelect, showInteractions = true }: VideoCardProps) {
  const { user } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const [interactions, setInteractions] = useState({
    liked: false,
    disliked: false,
    hidden: false,
    muted: false,
  })

  const handleInteraction = async (type: "like" | "dislike" | "show_more_like_this" | "hide" | "mute_channel") => {
    if (!user) return

    try {
      // Record interaction
      await supabase.from("user_interactions").insert({
        user_id: user.id,
        video_id: video.id,
        interaction_type: type,
      })

      // Update video stats
      if (type === "like") {
        await supabase
          .from("videos")
          .update({ likes: video.likes + 1 })
          .eq("id", video.id)
        setInteractions((prev) => ({ ...prev, liked: true, disliked: false }))
      } else if (type === "dislike") {
        await supabase
          .from("videos")
          .update({ dislikes: video.dislikes + 1 })
          .eq("id", video.id)
        setInteractions((prev) => ({ ...prev, disliked: true, liked: false }))
      } else if (type === "hide") {
        setInteractions((prev) => ({ ...prev, hidden: true }))
      } else if (type === "mute_channel") {
        // Update user preferences
        const { data: preferences } = await supabase
          .from("user_preferences")
          .select("muted_channels")
          .eq("user_id", user.id)
          .single()

        const mutedChannels = preferences?.muted_channels || []
        if (!mutedChannels.includes(video.creator_id)) {
          mutedChannels.push(video.creator_id)

          await supabase.from("user_preferences").upsert({
            user_id: user.id,
            muted_channels: mutedChannels,
          })
        }
        setInteractions((prev) => ({ ...prev, muted: true }))
      } else if (type === "show_more_like_this") {
        // Update user preferences with video tags
        const { data: preferences } = await supabase
          .from("user_preferences")
          .select("preferred_tags")
          .eq("user_id", user.id)
          .single()

        const preferredTags = preferences?.preferred_tags || []
        const newTags = video.tags.filter((tag) => !preferredTags.includes(tag))

        if (newTags.length > 0) {
          await supabase.from("user_preferences").upsert({
            user_id: user.id,
            preferred_tags: [...preferredTags, ...newTags],
          })
        }
      }
    } catch (error) {
      console.error("Error recording interaction:", error)
    }
  }

  if (interactions.hidden) {
    return null
  }

  return (
    <TooltipProvider>
      <div
        className="group relative bg-gray-900 rounded-lg overflow-hidden transition-transform hover:scale-105"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Video Thumbnail */}
        <div className="relative aspect-video cursor-pointer" onClick={() => onVideoSelect(video)}>
          <Image src={video.poster_url || "/placeholder.svg"} alt={video.title} fill className="object-cover" />
          {video.is_preview && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Preview</div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h3
            className="text-white font-semibold line-clamp-2 mb-2 cursor-pointer"
            onClick={() => onVideoSelect(video)}
          >
            {video.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>{video.views.toLocaleString()} views</span>
            <span>Quality: {Math.round(video.quality_score)}</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {video.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Interaction Buttons */}
        {showInteractions && isHovered && user && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-black/80 hover:bg-black/90"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleInteraction("show_more_like_this")
                  }}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show more like this</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-black/80 hover:bg-black/90"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleInteraction("hide")
                  }}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hide this video</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-black/80 hover:bg-black/90"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleInteraction("mute_channel")
                  }}
                >
                  <VolumeX className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mute channel</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Like/Dislike Bar */}
        {showInteractions && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-4">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleInteraction("like")
                }}
                className={`flex items-center space-x-1 ${interactions.liked ? "text-green-400" : "hover:text-green-400"}`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{video.likes}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleInteraction("dislike")
                }}
                className={`flex items-center space-x-1 ${interactions.disliked ? "text-red-400" : "hover:text-red-400"}`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span>{video.dislikes}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
