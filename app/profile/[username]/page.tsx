"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Mail,
  Calendar,
  Gamepad2,
  Languages,
  Tags,
  Star,
  Clock,
  MessageCircle,
  MapPin,
  Globe,
  Award,
  Users,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Plus,
  Send,
  CheckCircle,
  XCircle,
  Ban,
  Settings,
  Briefcase
} from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import LoadingSync from "@/components/LoadingSync"


interface UserProfile {
  id: string
  username: string
  email: string
  bio?: string | null
  avatar?: string | null
  isAdmin: boolean
  isActive: boolean
  createdAt: string
  userGames: Array<{
    id: string
    level: string
    platform?: string | null
    game: {
      id: string
      name: string
      genre?: string | null
      platform?: string | null
    }
  }>
  userLanguages: Array<{
    id: string
    language: string
    level: string
  }>
  userTags: Array<{
    id: string
    tag: string
  }>
  userAvailability: Array<{
    id: string
    dayOfWeek: number
    startTime: string
    endTime: string
    price: number
    isActive: boolean
  }>
  fixedServices: Array<{
    id: string
    title: string
    description: string
    price: number
    duration: number
    isActive: boolean
    createdAt: string
  }>
}

interface Review {
  id: string
  rating: number
  comment?: string | null
  createdAt: string
  reviewer: {
    id: string
    username: string
    avatar?: string | null
  }
}

interface ReviewsData {
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [showGameDialog, setShowGameDialog] = useState(false)
  const [selectedGame, setSelectedGame] = useState<any>(null)

  useEffect(() => {
    if (username) {
      fetchUserProfile()
      fetchReviews()
    }
  }, [username])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/user/profile/${username}`, { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'User not found')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setError('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true)
      const response = await fetch(`/api/user/profile/${username}/reviews`, { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setReviewsData(data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const calculateAverageRating = () => {
    return reviewsData?.averageRating || 0
  }



  const formatAvailability = () => {
    if (!profile?.userAvailability || profile.userAvailability.length === 0) {
      return "No availability set"
    }

    const activeAvailability = profile.userAvailability.filter(av => av.isActive)
    if (activeAvailability.length === 0) return "No availability set"

    return `${activeAvailability.length} time slots available`
  }

  const handleSubmitReview = async () => {
    try {
      setSubmittingReview(true)
      setReviewError(null)

      const response = await fetch(`/api/user/profile/${username}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewForm)
      })

      if (response.ok) {
        setShowReviewDialog(false)
        setReviewForm({ rating: 5, comment: "" })
        fetchReviews() // Refresh reviews
      } else {
        const errorData = await response.json()
        setReviewError(errorData.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      setReviewError('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const canReview = session?.user && profile && session.user.id !== profile.id

  if (loading) {
    return <LoadingSync subtext="Loading Operative Data" />
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Profile not found</h3>
            <p className="text-gray-400 text-center max-w-md mb-4">
              {error || 'The user profile you are looking for does not exist.'}
            </p>
            <Button asChild className="gaming-button">
              <Link href="/gamers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Gamers
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-10 py-8">
        {/* Header */}
        <div className="mb-12">
          <Button asChild variant="ghost" className="mb-8 p-0 h-auto hover:bg-transparent text-gray-500 hover:text-white transition-colors">
            <Link href="/gamers" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
              <ArrowLeft className="h-3 w-3" />
              Return to Operations
            </Link>
          </Button>

          {/* Inactive Account Warning */}
          {!profile.isActive && (
            <div className="mb-8 p-6 bg-red-500/5 border border-red-500/10 rounded-3xl backdrop-blur-md">
              <div className="flex items-start gap-4">
                <Ban className="h-5 w-5 text-red-500/50 mt-1" />
                <div>
                  <h3 className="text-red-400 font-black text-xs uppercase tracking-widest mb-1">Dormant Account</h3>
                  <p className="text-red-300/60 text-[11px] font-medium leading-relaxed max-w-2xl">
                    This operative is currently off the grid. Communication and session requests may remain unanswered until status is reactivated.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-green-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.05] relative z-10">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border border-white/[0.05]">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={`${profile.username}`}
                        className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <User className="h-10 w-10 text-gray-600" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none uppercase">{profile.username}</h1>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${profile.isActive
                    ? 'bg-green-500/5 text-green-500/70 border border-green-500/10'
                    : 'bg-red-500/5 text-red-500/70 border border-red-500/10'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${profile.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    {profile.isActive ? 'Active Status' : 'Signal Lost'}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 text-gray-600" />
                    <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">{calculateAverageRating()} Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-gray-600" />
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{formatAvailability()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-gray-600" />
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Global Sector</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <Button asChild className="h-11 flex-1 md:flex-none px-8 bg-green-600/80 hover:bg-green-500 text-black font-black text-[11px] uppercase tracking-widest rounded-xl transition-all">
                <Link href={`/profile/${profile.username}/book`}>
                  Initiate Booking
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 px-6 bg-white/[0.03] border-white/[0.05] text-gray-300 hover:text-white hover:bg-white/[0.08] font-black text-[11px] uppercase tracking-widest rounded-xl transition-all">
                <Link href={`/profile/${profile.username}/message`}>
                  Direct Comm
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="inline-flex w-auto bg-black/40 border border-white/[0.02] p-1 rounded-2xl mb-8">
                <TabsTrigger value="overview" className="h-10 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 data-[state=active]:bg-white/[0.05] data-[state=active]:text-white transition-all">Overview</TabsTrigger>
                <TabsTrigger value="games" className="h-10 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 data-[state=active]:bg-white/[0.05] data-[state=active]:text-white transition-all">Intelligence</TabsTrigger>
                <TabsTrigger value="reviews" className="h-10 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 data-[state=active]:bg-white/[0.05] data-[state=active]:text-white transition-all">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <div className="bg-[#070707]/90 border border-white/[0.05] rounded-[32px] p-8 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-[1px] flex-1 bg-white/[0.05]"></div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Operative Profile</h3>
                    <div className="h-[1px] flex-1 bg-white/[0.05]"></div>
                  </div>

                  <div className="space-y-12">
                    {/* Bio */}
                    <div>
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Background Intel</h3>
                      <p className="text-xs font-bold text-gray-400 leading-relaxed max-w-3xl">
                        {profile.bio || "No background information available on this operative."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {/* Member Since */}
                      <div>
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Activation Date</h3>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-700" />
                          <p className="text-xs font-black text-gray-300 uppercase tracking-widest">
                            {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {/* Languages / Skills */}
                      <div>
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Core Competencies</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.userLanguages.length > 0 ? profile.userLanguages.map(lang => (
                            <Badge key={lang.id} variant="outline" className="bg-white/[0.02] border-white/[0.05] text-[9px] font-black uppercase text-gray-400 px-3 py-1">
                              {lang.language} - {lang.level}
                            </Badge>
                          )) : <span className="text-xs italic text-gray-600 font-bold">Awaiting assessment...</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="games" className="mt-0">
                <div className="bg-[#070707]/90 border border-white/[0.05] rounded-[32px] p-8 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-[1px] flex-1 bg-white/[0.05]"></div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Intelligence Brief</h3>
                    <div className="h-[1px] flex-1 bg-white/[0.05]"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.userGames.length > 0 ? (
                      (() => {
                        const gameGroups = profile.userGames.reduce((groups, userGame) => {
                          const gameName = userGame.game.name
                          if (!groups[gameName]) {
                            groups[gameName] = []
                          }
                          groups[gameName].push(userGame)
                          return groups
                        }, {} as Record<string, typeof profile.userGames>)

                        return Object.entries(gameGroups).map(([gameName, userGames]) => {
                          const firstGame = userGames[0]
                          const platforms = userGames.map(ug => ug.platform).filter(Boolean)
                          const levels = userGames.map(ug => ug.level)
                          const uniqueLevels = [...new Set(levels)]

                          return (
                            <div key={firstGame.id} className="group relative bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 hover:bg-white/[0.04] transition-all duration-300">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-black text-xs uppercase tracking-widest truncate mb-2">{gameName}</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {platforms.slice(0, 2).map((p, i) => (
                                      <span key={i} className="text-[9px] font-black uppercase text-gray-500 tracking-tighter">{p}</span>
                                    ))}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-4 bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
                                  onClick={() => {
                                    setSelectedGame({
                                      game: firstGame.game,
                                      userGames: userGames,
                                      platforms: platforms,
                                      levels: uniqueLevels
                                    })
                                    setShowGameDialog(true)
                                  }}
                                >
                                  Inspect
                                </Button>
                              </div>
                            </div>
                          )
                        })
                      })()
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <Gamepad2 className="h-8 w-8 text-gray-800 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">No data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <div className="bg-[#070707]/90 border border-white/[0.05] rounded-[32px] p-8 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-[1px] flex-1 bg-white/[0.05]"></div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Performance Reports</h3>
                      <div className="h-[1px] flex-1 bg-white/[0.05]"></div>
                    </div>
                    {canReview && (
                      <Button onClick={() => setShowReviewDialog(true)} className="ml-6 h-9 px-6 bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/[0.05]">
                        <Plus className="h-3 w-3 mr-2" />
                        File Report
                      </Button>
                    )}
                  </div>

                  {reviewsLoading ? (
                    <LoadingSync fullScreen={false} subtext="Scanning Reports" />
                  ) : reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {reviewsData.reviews.map((review) => (
                        <div key={review.id} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 relative group overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div key={star} className={`w-1.5 h-1.5 rounded-full ${star <= review.rating ? 'bg-green-500' : 'bg-gray-800'}`}></div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-900 border border-white/[0.05]">
                              {review.reviewer.avatar ? (
                                <img src={review.reviewer.avatar} alt={review.reviewer.username} className="w-full h-full object-cover grayscale-[0.5]" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><User className="h-4 w-4 text-gray-700" /></div>
                              )}
                            </div>
                            <div>
                              <span className="block text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">{review.reviewer.username}</span>
                              <span className="block text-[8px] font-black text-gray-600 uppercase tracking-tighter">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-[11px] font-bold text-gray-400 leading-relaxed italic line-clamp-3">"{review.comment}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Star className="h-8 w-8 text-gray-800 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">No reports found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Actions & Stats */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-[#070707]/90 border border-white/[0.05] rounded-[32px] p-8 backdrop-blur-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-8 text-center">Protocol Actions</h3>
              <div className="space-y-4">
                <Button
                  asChild
                  className={`w-full h-12 ${profile.isActive ? 'bg-green-600/80 hover:bg-green-500 text-black' : 'bg-gray-800/50 text-gray-600 border-gray-800/30 cursor-not-allowed'} font-black text-[11px] uppercase tracking-widest rounded-xl transition-all`}
                  disabled={!profile.isActive}
                >
                  <Link href={profile.isActive ? `/profile/${profile.username}/book` : '#'}>
                    {profile.isActive ? 'Initiate Session' : 'Offline Mode'}
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full h-12 bg-white/[0.03] border-white/[0.1] text-gray-300 hover:text-white hover:bg-white/[0.08] font-black text-[11px] uppercase tracking-widest rounded-xl transition-all">
                  <Link href={`/profile/${profile.username}/message`}>
                    Direct Comm
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#070707]/90 border border-white/[0.05] rounded-[32px] p-8 backdrop-blur-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-8 text-center">Operative Stats</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Deployments</span>
                  <span className="text-xs font-black text-white uppercase">{profile.userGames.length} Missions</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Availability</span>
                  <span className="text-xs font-black text-white uppercase">
                    {profile.userAvailability?.filter(av => av.isActive).length || 0} Slots
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Experience</span>
                  <span className="text-xs font-black text-white uppercase">
                    {new Date().getFullYear() - new Date(profile.createdAt).getFullYear()} Years
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Reports</span>
                  <span className="text-xs font-black text-white uppercase">
                    {reviewsData?.totalReviews || 0} Filed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Details Modal */}
      <Dialog open={showGameDialog} onOpenChange={setShowGameDialog}>
        <DialogContent className="bg-black border-white/[0.05] backdrop-blur-xl sm:max-w-[500px] rounded-[32px] p-0 overflow-hidden">
          <div className="p-10">
            <DialogHeader className="mb-10 text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-[1px] w-8 bg-white/[0.1]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Intelligence Data</span>
              </div>
              <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <Gamepad2 className="h-6 w-6 text-gray-500" />
                {selectedGame?.game.name}
              </DialogTitle>
            </DialogHeader>

            {selectedGame && (
              <div className="space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Player Levels */}
                  <div>
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Competency Levels</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.levels?.map((level: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-white/[0.05] text-white border-white/[0.1] text-[9px] font-black uppercase px-2 py-1">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Platforms */}
                  {selectedGame.platforms && selectedGame.platforms.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Deployment</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedGame.platforms.map((platform: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-white/[0.1] text-gray-400 text-[9px] font-black uppercase px-2 py-1">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="flex flex-wrap gap-8 pt-6 border-t border-white/[0.05]">
                  {selectedGame.game.genre && (
                    <div>
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Classification</h4>
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{selectedGame.game.genre}</span>
                    </div>
                  )}

                  {selectedGame.game.platform && (
                    <div>
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Native Source</h4>
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{selectedGame.game.platform}</span>
                    </div>
                  )}
                </div>

                {/* Detailed Breakdown */}
                {selectedGame.userGames && selectedGame.userGames.length > 1 && (
                  <div className="pt-8 border-t border-white/[0.05]">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Operational History</h4>
                    <div className="space-y-3">
                      {selectedGame.userGames.map((userGame: any, index: number) => (
                        <div key={index} className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl flex items-center justify-between">
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            {userGame.platform || 'General'}
                          </span>
                          <span className="text-[10px] font-black text-white px-3 py-1 bg-white/[0.05] rounded-lg border border-white/[0.05]">
                            {userGame.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-12 flex justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowGameDialog(false)}
                className="h-10 px-8 bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Close Portal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}