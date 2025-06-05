"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Play, ChevronLeft, ChevronRight } from "lucide-react"
import type { VideoRecommendation } from "@/lib/recommendation-engine"

interface HeroSliderProps {
  videos: VideoRecommendation[]
  onVideoSelect: (video: VideoRecommendation) => void
}

export function HeroSlider({ videos, onVideoSelect }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (videos.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [videos.length])

  if (videos.length === 0) {
    return (
      <div className="relative h-[70vh] bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Welcome to Bit</h2>
          <p className="text-xl text-gray-300">Discover amazing content from creators worldwide</p>
        </div>
      </div>
    )
  }

  const currentVideo = videos[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length)
  }

  return (
    <div className="relative h-[70vh] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={currentVideo.poster_url || "/placeholder.svg"}
          alt={currentVideo.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">{currentVideo.title}</h1>
            <p className="text-lg md:text-xl text-gray-200 mb-6 line-clamp-3">{currentVideo.description}</p>
            <div className="flex items-center space-x-4 mb-8">
              <span className="text-sm text-gray-300">{currentVideo.views.toLocaleString()} views</span>
              <span className="text-sm text-gray-300">•</span>
              <span className="text-sm text-gray-300">
                {Math.floor(currentVideo.duration / 60)}:{(currentVideo.duration % 60).toString().padStart(2, "0")}
              </span>
              <span className="text-sm text-gray-300">•</span>
              <span className="text-sm text-gray-300">Quality Score: {Math.round(currentVideo.quality_score)}</span>
            </div>
            <Button
              onClick={() => onVideoSelect(currentVideo)}
              size="lg"
              className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-3 interactive-button"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Watch Now
            </Button>
          </div>
        </div>
      </div>

      {videos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors interactive-button"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors interactive-button"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {videos.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors interactive-button ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
