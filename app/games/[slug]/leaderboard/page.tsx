"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Trophy,
  Star,
  Users,
  Crown,
  Medal,
  Award,
  Filter,
  Search,
  Loader2,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import LoadingSync from "@/components/LoadingSync"


interface Game {
  id: number
  name: string
  slug: string
  cover?: { url: string } | null
}

interface LeaderboardPlayer {
  id: string
  username: string
  email: string
  bio: string | null
  avatar: string | null
  gameName: string
  gameSlug: string
  platforms: string[]
  rating: number
  totalGames: number
  rank: number
}

export default function GameLeaderboardPage() {
  const params = useParams()
  const slug = params.slug as string

  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'rating' | 'games' | 'name'>('rating')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')

  useEffect(() => {
    const fetchGameAndPlayers = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(null)

        // Fetch game details
        const gameResponse = await fetch(`/api/igdb/game/${slug}`)
        if (gameResponse.ok) {
          const gameData = await gameResponse.json()
          setGame(gameData.game)
        }

        // Fetch leaderboard data
        const leaderboardResponse = await fetch(`/api/games/${slug}/leaderboard`)
        if (leaderboardResponse.ok) {
          const leaderboardData = await leaderboardResponse.json()
          setPlayers(leaderboardData.players || [])
        } else {
          const errorData = await leaderboardResponse.json()
          setError(errorData.error || 'Failed to load leaderboard')
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setError('Failed to load leaderboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchGameAndPlayers()
  }, [slug])

  // Get unique platforms from all players
  const allPlatforms = Array.from(
    new Set(
      players.flatMap(player => player.platforms || [])
    )
  ).sort()

  // Filter and sort players
  const filteredAndSortedPlayers = players
    .filter(player => {
      // Search filter
      const matchesSearch =
        player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.bio?.toLowerCase().includes(searchTerm.toLowerCase())

      // Platform filter
      const matchesPlatform =
        selectedPlatform === 'all' ||
        (player.platforms && player.platforms.includes(selectedPlatform))

      return matchesSearch && matchesPlatform
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'games':
          return b.totalGames - a.totalGames
        case 'name':
          return a.username.localeCompare(b.username)
        default:
          return 0
      }
    })

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return <span className="text-gray-400 font-semibold">{rank}</span>
  }

  if (loading) {
    return <LoadingSync message="SYNC / RANKINGS" subtext="Loading Rankings" />
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Leaderboard</h3>
            <p className="text-gray-400 mb-4">{error || 'Game not found'}</p>
            <Button asChild className="gaming-button">
              <Link href="/games">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Games
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">

      {/* Header / Navigation */}
      <nav className="p-4 md:p-6 flex items-center justify-between border-b border-white/[0.03] bg-transparent sticky top-0 z-50">
        <Button asChild variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-full px-4">
          <Link href={`/games/${slug}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back / Game</span>
          </Link>
        </Button>
      </nav>

      <main className="container mx-auto px-4 py-8 md:py-12 space-y-12 max-w-6xl">
        {/* Dossier Header */}
        <section className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8 border-b border-white/[0.05]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] border border-primary/20 px-2 py-0.5 rounded">Leaderboard</span>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">{game.name}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
              Top Gamers
            </h1>
          </div>

          <div className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-6 rounded-3xl flex items-center gap-8">
            <div className="space-y-1">
              <span className="block text-[8px] font-black text-gray-600 uppercase tracking-widest">Total Squad</span>
              <span className="block text-2xl font-black text-white leading-none">{players.length}</span>
            </div>
            <div className="h-8 w-px bg-white/[0.05]"></div>
            <div className="space-y-1">
              <span className="block text-[8px] font-black text-gray-600 uppercase tracking-widest">Elite Tier</span>
              <span className="block text-2xl font-black text-white leading-none">
                {players.filter(p => p.rating > 80).length}
              </span>
            </div>
          </div>
        </section>

        {/* Tactical Controls */}
        <section className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 h-4 w-4" />
            <input
              type="text"
              placeholder="Filter by Username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary/40 text-sm font-medium transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {['rating', 'games', 'name'].map((option) => (
              <Button
                key={option}
                variant="ghost"
                onClick={() => setSortBy(option as any)}
                className={`flex-1 lg:flex-none h-auto py-3 px-6 rounded-xl border transition-all ${sortBy === option
                  ? 'bg-primary/10 border-primary/20 text-primary'
                  : 'bg-white/[0.02] border-white/[0.05] text-gray-500 hover:text-white hover:bg-white/[0.05]'
                  }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">/{option === 'rating' ? 'Rating' : option}</span>
              </Button>
            ))}
          </div>
        </section>

        {/* Dossier Grid */}
        <section className="space-y-4 pb-20">
          {filteredAndSortedPlayers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredAndSortedPlayers.map((player, index) => (
                <Link href={`/profile/${player.username}`} key={player.id} className="group">
                  <div className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md group-hover:border-primary/40 transition-all duration-500 p-4 md:p-6 rounded-[32px] flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                    {/* Rank HUD */}
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-white/[0.03] border border-white/[0.05] rounded-2xl shrink-0 group-hover:bg-primary/10 transition-colors duration-500">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter mb-1">Rank</span>
                      <span className="text-xl font-black text-white leading-none">
                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                      </span>
                    </div>

                    {/* Operative Bio */}
                    <div className="flex-1 flex flex-col md:flex-row items-center gap-6 w-full">
                      <div className="w-14 h-14 rounded-full p-0.5 border border-white/[0.05] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 shrink-0">
                        <img
                          src={player.avatar || '/default-avatar.png'}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-center md:text-left space-y-1">
                        <h4 className="text-lg font-black text-white uppercase tracking-widest group-hover:text-primary transition-colors">
                          {player.username}
                        </h4>
                        {player.bio && (
                          <p className="text-gray-500 text-[10px] font-medium leading-tight line-clamp-1 max-w-sm uppercase tracking-wider italic">
                            {player.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats HUD */}
                    <div className="flex items-center gap-12 shrink-0 px-6 py-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl w-full md:w-auto justify-center md:justify-end">
                      <div className="space-y-1">
                        <span className="block text-[8px] font-black text-gray-600 uppercase tracking-widest">Rating</span>
                        <div className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-primary" />
                          <span className="text-lg font-black text-white leading-none">{player.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[8px] font-black text-gray-600 uppercase tracking-widest">Games Played</span>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-gray-500" />
                          <span className="text-lg font-black text-white leading-none">{player.totalGames}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Indicator */}
                    <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-white/[0.05] text-gray-600 group-hover:text-primary group-hover:border-primary/20 transition-all">
                      <Trophy className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[#070707]/40 border border-white/[0.05] p-24 rounded-[40px] text-center space-y-6">
              <Trophy className="h-16 w-16 text-gray-700 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">No Gamers Match Query</h3>
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Reset filters to see the leaderboard</p>
              </div>
              <Button
                onClick={() => { setSearchTerm(''); setSelectedPlatform('all'); }}
                variant="ghost"
                className="text-gray-400 hover:text-white uppercase font-black text-[10px] tracking-widest mt-4"
              >
                / Reset Filters
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}