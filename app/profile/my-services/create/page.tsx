"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'

// Simple weekly calendar component (Mon - Sun)
function WeeklyCalendar({ selected, onToggle }: { selected: string[]; onToggle: (iso: string) => void }) {
  const startOfWeek = (() => {
    const d = new Date()
    const day = d.getDay() // 0 Sun .. 6 Sat
    // want Monday as first day -> calculate offset
    const diffToMon = (day + 6) % 7 // 0 -> Mon
    const mon = new Date(d)
    mon.setDate(d.getDate() - diffToMon)
    mon.setHours(0,0,0,0)
    return mon
  })()

  const englishShort = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const days = Array.from({ length: 7 }).map((_, i) => {
    const dd = new Date(startOfWeek)
    dd.setDate(startOfWeek.getDate() + i)
    const iso = dd.toISOString().slice(0,10)
    const label = englishShort[i]
    return { iso, label, number: dd.getDate() }
  })

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d) => (
        <button
          key={d.iso}
          type="button"
          onClick={() => onToggle(d.iso)}
          className={`flex flex-col items-center p-3 rounded-lg transition-colors duration-150 ${selected.includes(d.iso) ? 'bg-green-500 text-black' : 'bg-gray-800/40 text-green-200'}`}
        >
          <span className="text-sm font-semibold">{d.label.charAt(0)}</span>
          <span className="text-xs mt-1">{d.number}</span>
        </button>
      ))}
    </div>
  )
}

export default function CreateServicePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [gameId, setGameId] = useState('')
  const [userGames, setUserGames] = useState<any[]>([])
  const [platform, setPlatform] = useState('')
  const [platformsMap, setPlatformsMap] = useState<Record<string, string[]>>({})
  const [price, setPrice] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1..3
  const [selectedWeekDates, setSelectedWeekDates] = useState<string[]>([])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile-data')
        if (!res.ok) return
        const data = await res.json()
        const games = data?.profile?.userGames || []
        // Build maps: unique games and platforms per game
        const gameMap = new Map<string, any>()
        const pMap = new Map<string, Set<string>>()

        for (const ug of games) {
          const g = ug?.game || ug
          const id = String(g?.id ?? g?.igdbId ?? '')
          if (!id) continue
          if (!gameMap.has(id)) gameMap.set(id, g)
          const pf = ug?.platform
          if (pf) {
            if (!pMap.has(id)) pMap.set(id, new Set())
            pMap.get(id)!.add(String(pf))
          }
        }

        const uniqueById = Array.from(gameMap.values()) as Array<{ id: string | number; name: string }>
        const platformsObj: Record<string, string[]> = {}
        for (const [k, setOf] of pMap.entries()) platformsObj[k] = Array.from(setOf)

        setUserGames(uniqueById)
        setPlatformsMap(platformsObj)
        if (uniqueById.length > 0 && uniqueById[0]?.id) {
          const firstId = String(uniqueById[0].id)
          setGameId(firstId)
          const plats = platformsObj[firstId] || []
          if (plats.length > 0) setPlatform(plats[0])
        }
      } catch (err) {
        // ignore
      }
    }
    fetchProfile()
  }, [])

  // Update platform when selected game changes
  useEffect(() => {
    if (!gameId) {
      setPlatform('')
      return
    }
    const plats = platformsMap[gameId] || []
    if (plats.length > 0) setPlatform(plats[0])
    else setPlatform('')
  }, [gameId, platformsMap])

  

  const submitService = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/user/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, gameId: gameId || null, platform: platform || null, price: Number(price) })
      })
      if (!res.ok) throw new Error('Failed to create')
      router.push('/profile/my-services')
    } catch (err) {
      console.error(err)
      setError('Failed to create service')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')
    if (step === 1) {
      if (!title.trim()) return setError('Title is required')
      // require game selection
      if (!gameId) return setError('Please choose a game')
      setStep(2)
      return
    }
    if (step === 2) {
      if (!price || Number(price) <= 0) return setError('Price must be > 0')
      setStep(3)
      return
    }
    if (step === 3) {
      // final submit
      submitService()
    }
  }

  const handleBack = () => {
    setError('')
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="bg-gradient-to-br from-black/60 to-green-900/30 border border-green-700/20 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-4">Create Service</h1>
          <p className="text-green-200 mb-6">Fill in the details to add a new coaching service.</p>

          <form onSubmit={handleContinue} className="space-y-4">
            {/* Step 1: Title + Game + Description + Price */}
            {step === 1 && (
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Competitive LoL coaching" />
                <div className="mt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Choose game</Label>
                      <Select value={gameId} onValueChange={(val) => setGameId(val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a game..." />
                        </SelectTrigger>
                        <SelectContent>
                          {userGames && userGames.length > 0 ? (
                            userGames.map((g) => (
                              <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="league-of-legends">League of Legends</SelectItem>
                              <SelectItem value="valorant">Valorant</SelectItem>
                              <SelectItem value="csgo">CS:GO</SelectItem>
                              <SelectItem value="apex-legends">Apex Legends</SelectItem>
                              <SelectItem value="fortnite">Fortnite</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Platform</Label>
                      <Select value={platform} onValueChange={(val) => setPlatform(val)} disabled={!gameId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform..." />
                        </SelectTrigger>
                        <SelectContent>
                          {gameId && platformsMap && platformsMap[gameId] && platformsMap[gameId].length > 0 ? (
                            platformsMap[gameId].map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="__no_game_selected__" disabled>Choose a game first</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your service" />
                </div>
                <div className="mt-4">
                  <Label>Price (USD)</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="20" />
                </div>
              </div>
            )}

            {/* Step 2: Weekly calendar (Mon - Sun) */}
            {step === 2 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Weekly availability</h3>
                <p className="text-green-200 mb-4">Select the days you can offer this service (Mon - Sun).</p>
                  <WeeklyCalendar
                    selected={selectedWeekDates}
                    onToggle={(iso) => {
                      setSelectedWeekDates((prev) => {
                        if (prev.includes(iso)) return prev.filter((p) => p !== iso)
                        return [...prev, iso]
                      })
                    }}
                  />
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Review your service</h3>
                <div className="bg-gray-800/40 p-4 rounded-lg border border-green-600/20">
                  <p className="text-green-100"><strong>Title:</strong> {title}</p>
                  <p className="text-green-100"><strong>Game:</strong> {userGames.find(g => String(g.id) === String(gameId))?.name ?? '—'}</p>
                  <p className="text-green-100"><strong>Platform:</strong> {platform || '—'}</p>
                  <p className="text-green-100"><strong>Price:</strong> ${price}</p>
                  <p className="text-green-100 mt-2"><strong>Description:</strong> {description || '—'}</p>
                </div>
              </div>
            )}

            {error && <div className="text-red-400">{error}</div>}

            <div className="flex justify-between items-center">
              <div>
                <Button type="button" variant="ghost" onClick={() => router.push('/profile/my-services')} className="mr-3">Cancel</Button>
              </div>
              <div className="flex items-center space-x-3">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                )}
                <Button type="submit" variant="default" className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-black font-semibold px-6 py-2 rounded-xl shadow-lg" disabled={loading}>
                  {loading ? 'Processing...' : (step < 3 ? 'Continue' : 'Finish')}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
