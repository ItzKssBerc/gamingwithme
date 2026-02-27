"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Gamepad2,
  Star,
  Calendar,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Trophy,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import LoadingSync from "@/components/LoadingSync"

import { useParams } from "next/navigation"

interface Game {
  id: number
  name: string
  slug: string
  summary?: string | null
  storyline?: string | null
  rating?: number | null
  rating_count?: number | null
  first_release_date?: number | null
  cover?: { url: string } | null
  genres?: Array<{ id: number; name: string }>
  platforms?: Array<{ id: number; name: string }>
  screenshots?: Array<{ url: string }>
  videos?: Array<{ video_id: string }>
  websites?: Array<{ category: number; url: string }>
  similar_games?: Array<{ id: number; name: string; cover?: { url: string } }>
  dlcs?: Array<{ id: number; name: string; cover?: { url: string } }>
  expansions?: Array<{ id: number; name: string; cover?: { url: string } }>
  game_modes?: Array<{ id: number; name: string }>
  player_perspectives?: Array<{ id: number; name: string }>
  age_ratings?: Array<{ category: number; rating: number }>
}

interface Player {
  id: string;
  username: string;
  avatar?: string | null;
  rating?: number;
}

export default function GameDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [players, setPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [playersError, setPlayersError] = useState<string | null>(null);

  const [showStoryline, setShowStoryline] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/igdb/game/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setGame(data.game)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Game not found')
        }
      } catch (error) {
        console.error('Error fetching game:', error)
        setError('Failed to load game details')
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [slug])

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!game?.name) return;

      try {
        setPlayersLoading(true);
        setPlayersError(null);

        const response = await fetch(`/api/gamers?game=${encodeURIComponent(game.name)}`);
        if (response.ok) {
          const data = await response.json();
          setPlayers(data.gamers);
        } else {
          const errorData = await response.json();
          setPlayersError(errorData.error || 'Failed to fetch players');
        }
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayersError('Failed to load players');
      } finally {
        setPlayersLoading(false);
      }
    };

    if (game) {
      fetchPlayers();
    }
  }, [game]);

  if (loading) {
    return <LoadingSync message="SYNC / DATABASE" subtext="Accessing IGDB Records" />
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Game</h3>
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
          <Link href="/games" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back / Database</span>
          </Link>
        </Button>
      </nav>

      <main className="container mx-auto px-4 py-8 md:py-12 space-y-12 max-w-6xl">
        {/* Hero & Meta Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cover Art */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="aspect-[3/4] bg-white/[0.02] rounded-3xl overflow-hidden border border-white/[0.05] relative group">
              {game.cover?.url ? (
                <img
                  src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.url.split('/').pop()}`}
                  alt={game.name}
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                  <Gamepad2 className="h-24 w-24 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </div>
          </div>

          {/* Core Info HUD */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black text-green-500/60 uppercase tracking-[0.3em] border border-green-500/20 px-2 py-0.5 rounded">Game Object</span>
                {game.first_release_date && (
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{new Date(game.first_release_date * 1000).getFullYear()} / Release</span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                {game.name}
              </h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stats Module */}
              <div className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <span>Combat Rating</span>
                  <Star className="h-3 w-3 text-primary" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-white leading-none">
                    {game.rating ? game.rating.toFixed(1) : "N/A"}
                  </span>
                  <span className="text-gray-600 text-[10px] font-black pb-1 lowercase">/ 100</span>
                </div>
                <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${game.rating || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Data Status Module */}
              <div className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-6 rounded-3xl space-y-4">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Platform Sync</div>
                <div className="flex flex-wrap gap-1.5">
                  {game.platforms?.slice(0, 4).map((p, i) => (
                    <span key={i} className="text-[8px] font-black px-2 py-0.5 bg-white/[0.05] text-gray-400 rounded-sm italic">
                      {p.name}
                    </span>
                  )) || <span className="text-[8px] text-gray-600 italic">No data</span>}
                  {(game.platforms?.length || 0) > 4 && (
                    <span className="text-[8px] text-gray-600 italic">+{game.platforms!.length - 4} more</span>
                  )}
                </div>
              </div>

              {/* Action HUB */}
              <div className="flex flex-col gap-3">
                <Button asChild className="gaming-button w-full h-auto py-4 rounded-2xl group">
                  <Link href={`/games/${slug}/leaderboard`}>
                    <Trophy className="h-4 w-4 mr-3 group-hover:rotate-12 transition-transform" />
                    <span className="uppercase font-black tracking-widest text-[12px]">View Rankings</span>
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <div className="flex-1 h-12 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-center">
                    <div className="flex gap-1 group">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary transition-colors duration-300" style={{ transitionDelay: `${i * 100}ms` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Narrative & Details */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/[0.05]"></div>
                <h2 className="text-[12px] font-black text-gray-500 uppercase tracking-[0.4em] px-4 italic">Narrative.log</h2>
                <div className="h-px flex-1 bg-white/[0.05]"></div>
              </div>
              <div className="bg-[#0a0a0a]/60 border border-white/10 backdrop-blur-md p-8 md:p-10 rounded-[40px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-30 select-none pointer-events-none">
                  <span className="text-[60px] font-black text-white/5 uppercase tracking-tighter leading-none">DATA</span>
                </div>
                <div className="space-y-8 relative z-10">
                  {game.summary ? (
                    <p className="text-gray-400 leading-relaxed text-lg font-medium selection:bg-primary selection:text-black">
                      {game.summary}
                    </p>
                  ) : (
                    <p className="text-gray-600 italic">No summary record found in archive.</p>
                  )}
                  {game.storyline && (
                    <div className="pt-8 border-t border-white/[0.05]">
                      <button
                        onClick={() => setShowStoryline(!showStoryline)}
                        className="flex items-center justify-between w-full group/toggle"
                      >
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-widest">Intel / Storyline</h3>
                        {showStoryline ? (
                          <ChevronUp className="h-4 w-4 text-gray-600 group-hover/toggle:text-primary transition-colors" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-600 group-hover/toggle:text-primary transition-colors" />
                        )}
                      </button>
                      {showStoryline && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                          <p className="text-gray-500 leading-relaxed text-sm">
                            {game.storyline}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Tags */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-8 rounded-[32px] space-y-8 sticky top-24">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Metadata Sync</h3>

                <div className="space-y-6">
                  <div>
                    <span className="block text-[8px] font-black text-gray-600 uppercase tracking-widest mb-3">Classification</span>
                    <div className="flex flex-wrap gap-2">
                      {game.genres?.map((genre, index) => (
                        <span key={index} className="px-3 py-1 bg-white/[0.03] border border-white/[0.05] text-[9px] font-black text-gray-400 uppercase tracking-wider rounded-full">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[8px] font-black text-gray-600 uppercase tracking-widest mb-3">Mission Modes</span>
                    <div className="flex flex-wrap gap-2">
                      {game.game_modes?.map((mode, index) => (
                        <span key={index} className="px-3 py-1 bg-white/[0.03] border border-white/[0.05] text-[9px] font-black text-gray-400 uppercase tracking-wider rounded-full">
                          {mode.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/[0.05] flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Status</span>
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest animate-pulse">Synced</span>
              </div>
            </div>
          </div>
        </section>

        {/* Players Roster */}
        <section className="space-y-8 pb-20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Gamers</h2>
            </div>
            {(players.length > 0) && (
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                {players.length} Active
              </span>
            )}
          </div>

          {playersLoading ? (
            <div className="bg-[#070707]/40 border border-white/[0.05] rounded-[40px] overflow-hidden">
              <LoadingSync fullScreen={false} subtext="Scanning Operative Roster" />
            </div>
          ) : playersError ? (
            <div className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-12 rounded-[40px] text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500/40 mx-auto" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Error Loading Roster</p>
            </div>
          ) : players.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {players.map((player) => (
                <Link href={`/profile/${player.username}`} key={player.id} className="group">
                  <div className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md group-hover:border-primary/40 transition-all duration-500 p-6 rounded-[32px] relative overflow-hidden flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full p-1 border border-white/[0.05] group-hover:border-primary/20 transition-all duration-500 overflow-hidden relative">
                      <img
                        src={player.avatar || '/default-avatar.png'}
                        alt={player.username}
                        className="w-full h-full rounded-full object-cover grayscale-[0.8] group-hover:grayscale-0 transition-all duration-700"
                        onError={(e) => {
                          e.currentTarget.src = '/default-avatar.png';
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-black text-white uppercase tracking-widest group-hover:text-primary transition-colors">{player.username}</h4>
                      {player.rating && (
                        <div className="flex items-center justify-center gap-1.5 mt-2">
                          <div className="w-1 h-1 rounded-full bg-green-500"></div>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter italic">{player.rating.toFixed(1)} Rating</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[#070707]/40 border border-white/[0.05] p-12 rounded-[40px] text-center">
              <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px]">No operatives assigned to this sector.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
