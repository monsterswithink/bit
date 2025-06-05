"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, User, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"

interface NavigationProps {
  activeTab: "showcase" | "free-for-all"
  onTabChange: (tab: "showcase" | "free-for-all") => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { user, signInWithGoogle, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery)
    }
  }

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Sign in failed:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 btn-no-select">
            <div className="w-8 h-8 bg-gradient-to-r from-neutral-600 to-neutral-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-neutral-100 font-semibold text-xl">Bit</span>
          </Link>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-neutral-800 rounded-full p-1">
            <button
              onClick={() => onTabChange("showcase")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all interactive-button ${
                activeTab === "showcase"
                  ? "bg-neutral-600 text-neutral-100 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700"
              }`}
            >
              Showcase
            </button>
            <button
              onClick={() => onTabChange("free-for-all")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all interactive-button ${
                activeTab === "free-for-all"
                  ? "bg-neutral-600 text-neutral-100 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700"
              }`}
            >
              Free-for-all
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
              <Input
                type="search"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700 text-neutral-100 placeholder-neutral-400 focus:border-neutral-600 focus:ring-neutral-600 rounded-full"
              />
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {user && (
              <Link href="/upload" className="btn-no-select">
                <Button
                  size="sm"
                  className="bg-neutral-700 hover:bg-neutral-600 text-neutral-100 border-0 rounded-full px-4 py-2 interactive-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </Link>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full interactive-button hover:bg-neutral-800"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                        alt={user.user_metadata?.full_name || "User"}
                      />
                      <AvatarFallback className="bg-neutral-700 text-neutral-200">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-neutral-900 border-neutral-700" align="end" forceMount>
                  <DropdownMenuItem className="font-normal text-neutral-200 focus:bg-neutral-800">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "User"}</p>
                      <p className="text-xs leading-none text-neutral-400">{user.email}</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-neutral-700" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="interactive-button text-neutral-200 focus:bg-neutral-800"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleSignIn}
                size="sm"
                className="bg-neutral-700 hover:bg-neutral-600 text-neutral-100 border-0 rounded-full px-4 py-2 interactive-button"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
