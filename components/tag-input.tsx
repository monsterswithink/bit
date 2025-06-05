"use client"

import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export function TagInput({ tags, onTagsChange, placeholder = "Add tags...", className }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
        setInputValue("")
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)

    // Auto-add tag when comma is typed
    if (value.includes(",")) {
      const newTags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
      newTags.forEach((tag) => addTag(tag))
      setInputValue("")
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-neutral-700 text-neutral-200 hover:bg-neutral-600 px-3 py-1 text-sm flex items-center gap-2"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-neutral-500 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="bg-neutral-800 border-neutral-600 text-neutral-100 placeholder-neutral-400 focus:border-neutral-500 focus:ring-neutral-500"
      />
      <p className="text-xs text-neutral-400 mt-1">
        Press Enter or comma to add tags. Backspace to remove the last tag.
      </p>
    </div>
  )
}
