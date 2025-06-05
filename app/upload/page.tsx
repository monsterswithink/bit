"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, ArrowLeft, Video, ImageIcon } from "lucide-react"
import { TagInput } from "@/components/tag-input"
import { UploadProgress } from "@/components/upload-progress"
import { EnvDebug } from "@/components/env-debug"
import { ProfileDebug } from "@/components/profile-debug"
import { DatabaseDebug } from "@/components/database-debug"
import { AuthDebug } from "@/components/auth-debug"
import Link from "next/link"
import { directDatabaseInsert, directDatabaseQuery } from "@/lib/direct-db"

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })
  const [tags, setTags] = useState<string[]>([])
  const [files, setFiles] = useState<{
    video: File | null
    poster: File | null
  }>({
    video: null,
    poster: null,
  })
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  if (!user) {
    router.push("/")
    return null
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = async (type: "video" | "poster", file: File | null) => {
    setFiles((prev) => ({ ...prev, [type]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files.video || !files.poster) {
      alert("Please select both video and poster files")
      return
    }

    setIsUploading(true)
    setShowProgress(true)
  }

  const handleUploadComplete = () => {
    setIsUploading(false)
    setShowProgress(false)
    router.push("/")
  }

  const handleUploadError = (error: string) => {
    setIsUploading(false)
    setShowProgress(false)
    alert(`Upload failed: ${error}`)
  }

  // Debug function to test direct database access
  const testDirectInsert = async () => {
    if (!user) return

    setDebugInfo("Testing direct database access...")

    // First test a query
    const { data: queryData, error: queryError } = await directDatabaseQuery("profiles", `id=eq.${user.id}`)

    if (queryError) {
      setDebugInfo(`Query error: ${JSON.stringify(queryError)}`)
      return
    }

    setDebugInfo(`Query successful: ${JSON.stringify(queryData)}`)

    // Then test an insert
    const testData = {
      title: "Test Direct Insert " + new Date().toISOString(),
      description: "Test description",
      video_url: "https://example.com/test.mp4",
      poster_url: "https://example.com/test.jpg",
      creator_id: user.id,
      duration: 60,
    }

    const { data, error } = await directDatabaseInsert("videos", testData)

    if (error) {
      setDebugInfo(`Insert error: ${JSON.stringify(error)}`)
    } else {
      setDebugInfo(`Insert successful: ${JSON.stringify(data)}`)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 pt-20 pb-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-400 hover:text-neutral-200 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-neutral-100">Upload Your Bit</h1>
          <p className="text-neutral-400 mt-2">Share your content with the world</p>
        </div>

        {/* Debug Panels */}
        {process.env.NODE_ENV === "development" && (
          <>
            <EnvDebug />
            <AuthDebug />
            <ProfileDebug />
            <DatabaseDebug />
          </>
        )}

        {/* Debug Panel */}
        {process.env.NODE_ENV === "development" && (
          <Card className="bg-neutral-900 border-neutral-700 mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-neutral-100 text-sm">Debug Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testDirectInsert} size="sm" variant="outline" className="mb-2">
                Test Direct DB Access
              </Button>
              {debugInfo && (
                <pre className="text-xs bg-neutral-800 p-2 rounded overflow-auto max-h-40 text-neutral-300">
                  {debugInfo}
                </pre>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="bg-neutral-900 border-neutral-700 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-neutral-100 text-xl">Video Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Video Upload */}
                <div>
                  <Label htmlFor="video" className="text-neutral-200 text-sm font-medium">
                    Video File
                  </Label>
                  <div className="mt-2">
                    <div className="relative">
                      <Input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange("video", e.target.files?.[0] || null)}
                        className="bg-neutral-800 border-neutral-600 text-neutral-100 file:bg-neutral-700 file:text-neutral-200 file:border-0 file:rounded-lg file:px-4 file:py-2 file:mr-4 hover:file:bg-neutral-600 transition-colors"
                        required
                        disabled={isUploading}
                      />
                      <Video className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Poster Upload */}
                <div>
                  <Label htmlFor="poster" className="text-neutral-200 text-sm font-medium">
                    Poster Image
                  </Label>
                  <div className="mt-2">
                    <div className="relative">
                      <Input
                        id="poster"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange("poster", e.target.files?.[0] || null)}
                        className="bg-neutral-800 border-neutral-600 text-neutral-100 file:bg-neutral-700 file:text-neutral-200 file:border-0 file:rounded-lg file:px-4 file:py-2 file:mr-4 hover:file:bg-neutral-600 transition-colors"
                        required
                        disabled={isUploading}
                      />
                      <ImageIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-neutral-200 text-sm font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="mt-2 bg-neutral-800 border-neutral-600 text-neutral-100 placeholder-neutral-400 focus:border-neutral-500 focus:ring-neutral-500"
                  placeholder="Enter a title for your video"
                  required
                  disabled={isUploading}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-neutral-200 text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="mt-2 bg-neutral-800 border-neutral-600 text-neutral-100 placeholder-neutral-400 focus:border-neutral-500 focus:ring-neutral-500 min-h-[120px]"
                  placeholder="Describe your video content"
                  rows={5}
                  required
                  disabled={isUploading}
                />
              </div>

              {/* Tags */}
              <div>
                <Label className="text-neutral-200 text-sm font-medium">Tags</Label>
                <div className="mt-2">
                  <TagInput
                    tags={tags}
                    onTagsChange={setTags}
                    placeholder="Add tags to help people discover your content..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isUploading || !files.video || !files.poster}
                  className="w-full bg-neutral-700 hover:bg-neutral-600 text-neutral-100 font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {isUploading ? (
                    <div className="flex items-center">
                      <Upload className="w-5 h-5 mr-2 animate-spin" />
                      Processing Upload...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Video
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Upload Progress Modal */}
      <UploadProgress
        isVisible={showProgress}
        onComplete={handleUploadComplete}
        onError={handleUploadError}
        files={files}
        formData={formData}
        tags={tags}
      />
    </div>
  )
}
