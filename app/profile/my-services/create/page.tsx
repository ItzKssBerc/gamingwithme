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
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogHeader } from '@/components/ui/dialog'

// Simple weekly calendar component (Mon - Sun)
function WeeklyCalendar({ selected, onToggle, onOpenDay }: { selected: string[]; onToggle: (iso: string) => void; onOpenDay?: (iso: string) => void }) {
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
  const iso = `${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,'0')}-${String(dd.getDate()).padStart(2,'0')}`
    const label = englishShort[i]
    return { iso, label, number: dd.getDate() }
  })

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d) => (
        <button
          key={d.iso}
          type="button"
          onClick={() => {
            // If an onOpenDay handler is provided, open the day modal instead of toggling immediately.
            // This prevents the button from flipping selection every time you open the details dialog.
            if (onOpenDay) {
              onOpenDay(d.iso)
              return
            }
            // toggle selection (only when no modal handler is used)
            onToggle(d.iso)
          }}
          className={`flex flex-col items-center p-3 rounded-lg transition-colors duration-150 ${selected.includes(d.iso) ? 'bg-green-500 text-black' : 'bg-gray-800/40 text-green-200'}`}
        >
          <span className="text-sm font-semibold">{d.label.charAt(0)}</span>
          <span className="text-xs mt-1">{d.number}</span>
        </button>
      ))}
    </div>
  )
}

// SlotAdder component for modal
function SlotAdder({ onAdd, editSlot }: { 
  onAdd: (time: string, cap: number) => void,
  editSlot?: { time: string, capacity: number } | null
}) {
  const [time, setTime] = useState(editSlot?.time || '')
  const [cap, setCap] = useState(editSlot?.capacity?.toString() || '1')

  // Update form when editSlot changes
  useEffect(() => {
    if (editSlot) {
      setTime(editSlot.time)
      setCap(editSlot.capacity.toString())
    }
  }, [editSlot])

  return (
    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
      <div className="flex-1 space-y-1">
        <label className="text-sm text-green-300">Time</label>
        <input 
          type="time" 
          value={time} 
          onChange={(e) => setTime(e.target.value)} 
          className="w-full h-12 rounded-xl px-3 bg-black/40 border border-green-700/30 text-green-100 focus:border-green-500 transition-colors"
        />
      </div>
      <div className="w-full sm:w-32 space-y-1">
        <label className="text-sm text-green-300">Capacity</label>
        <input 
          type="number" 
          min={1} 
          value={cap} 
          onChange={(e) => setCap(e.target.value)} 
          className="w-full h-12 rounded-xl px-3 bg-black/40 border border-green-700/30 text-green-100 focus:border-green-500 transition-colors"
        />
      </div>
      <div className="sm:self-end">
        <button 
          type="button" 
          onClick={() => { 
            if (time) { 
              onAdd(time, Number(cap || 1))
              if (!editSlot) {
                setTime('')
                setCap('1')
              }
            } 
          }}
          className="w-full sm:w-auto h-12 px-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:to-emerald-400 text-black font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!time}
        >
          {editSlot ? 'Update Slot' : 'Add Slot'}
        </button>
      </div>
    </div>
  )
}

// Helper: parse YYYY-MM-DD into a local Date to avoid timezone shifts when formatting
function isoToLocalDate(iso?: string | null) {
  if (!iso) return null
  const parts = iso.split('-')
  if (parts.length !== 3) return new Date(iso)
  const y = Number(parts[0])
  const m = Number(parts[1]) - 1
  const d = Number(parts[2])
  return new Date(y, m, d)
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
  const [slotsMap, setSlotsMap] = useState<Record<string, Array<{ id: string; time: string; capacity: number }>>>({})
  const [openDayIso, setOpenDayIso] = useState<string | null>(null)
  const [editingSlot, setEditingSlot] = useState<{ time: string, capacity: number } | null>(null)

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
      // serialize slotsMap into an array of { date, time, capacity }
      const slotsPayload: Array<{ date: string; time: string; capacity: number }> = []
      for (const [date, list] of Object.entries(slotsMap)) {
        for (const s of list) slotsPayload.push({ date, time: s.time, capacity: s.capacity })
      }

      const res = await fetch('/api/user/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, gameId: gameId || null, platform: platform || null, price: Number(price), slots: slotsPayload })
      })

      if (!res.ok) {
        // try to extract helpful error details from the response
        let body: any = null
        try {
          body = await res.json()
        } catch (e) {
          try { body = await res.text() } catch (_) { body = null }
        }
        console.error('Create service failed', { status: res.status, body })
        const details = body?.details ? (Array.isArray(body.details) ? body.details.join('; ') : String(body.details)) : (body?.error || String(body))
        setError(`Create failed: ${res.status} ${details || res.statusText}`)
        setLoading(false)
        return
      }

      router.push('/profile/my-services')
    } catch (err) {
      console.error(err)
      setError((err as any)?.message || 'Failed to create service')
    } finally {
      setLoading(false)
    }
  }

  const addSlot = (iso: string, time: string, cap: number) => {
    setSlotsMap((prev) => {
      const list = prev[iso] ? [...prev[iso]] : []
      const id = `${iso}-${time}-${Date.now()}`
      return { ...prev, [iso]: [...list, { id, time, capacity: cap }] }
    })
    // Ensure the day is marked active when the first slot is added
    setSelectedWeekDates((prev) => (prev.includes(iso) ? prev : [...prev, iso]))
  }

  const removeSlot = (iso: string, id: string) => {
    setSlotsMap((prev) => {
      const list = (prev[iso] || []).filter((s) => s.id !== id)
      const next = { ...prev, [iso]: list }
      // if no slots remain for that day, remove the key and unselect the day
      if (!list || list.length === 0) {
        delete next[iso]
        setSelectedWeekDates((sel) => sel.filter((d) => d !== iso))
      }
      return next
    })
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

  // computed slot counts
  const totalSlotsCount = Object.values(slotsMap).reduce((acc, list) => acc + (list?.length || 0), 0)
  const slotsThisWeekCount = selectedWeekDates.reduce((acc, iso) => acc + ((slotsMap[iso] && slotsMap[iso].length) || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="bg-gradient-to-br from-black/70 to-green-900/30 border border-green-700/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 text-center mb-2">Create Service</h1>
          <p className="text-green-200/80 text-center mb-8">Fill in the details to add a new coaching service.</p>

          <form onSubmit={handleContinue} className="space-y-8">
            {/* Step 1: Title + Game + Description + Price */}
            {step === 1 && (
              <div>
                <div className="space-y-2">
                  <Label className="text-green-300 ml-1">Service Title</Label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Competitive LoL coaching" 
                    className="bg-black/40 border-green-700/30 text-green-100 h-12 rounded-xl focus:border-green-500 transition-colors"
                  />
                </div>
                <div className="mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-green-300 ml-1">Choose Game</Label>
                      <Select value={gameId} onValueChange={(val) => setGameId(val)}>
                        <SelectTrigger className="bg-black/40 border-green-700/30 text-green-100 h-12 rounded-xl">
                          <SelectValue placeholder="Select a game" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-green-700/30">
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
                      <Label className="text-green-300 ml-1">Platform</Label>
                      <Select value={platform} onValueChange={(val) => setPlatform(val)} disabled={!gameId}>
                        <SelectTrigger className="bg-black/40 border-green-700/30 text-green-100 h-12 rounded-xl">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-green-700/30">
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

                <div className="mt-6 space-y-2">
                  <Label className="text-green-300 ml-1">Description</Label>
                  <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Describe your service" 
                    className="bg-black/40 border-green-700/30 text-green-100 min-h-[120px] rounded-xl focus:border-green-500 transition-colors"
                  />
                </div>
                <div className="mt-6 space-y-2">
                  <Label className="text-green-300 ml-1">Price (USD)</Label>
                  <Input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    placeholder="20" 
                    className="bg-black/40 border-green-700/30 text-green-100 h-12 rounded-xl focus:border-green-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Weekly calendar (Mon - Sun) */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-2">
                    Weekly Availability
                  </h3>
                  <p className="text-green-200/80">Select the days you can offer this service</p>
                </div>
                
                <div className="bg-black/40 p-6 rounded-xl border border-green-700/30">
                  <WeeklyCalendar
                    selected={selectedWeekDates}
                    onToggle={(iso) => {
                      setSelectedWeekDates((prev) => {
                        if (prev.includes(iso)) return prev.filter((p) => p !== iso)
                        return [...prev, iso]
                      })
                    }}
                    onOpenDay={(iso) => setOpenDayIso(iso)}
                  />
                  
                  <div className="mt-6 flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-green-200">Selected days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-800/40"></div>
                      <span className="text-green-200">Available to select</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Day details dialog */}
            <Dialog open={!!openDayIso} onOpenChange={(isOpen) => { if (!isOpen) setOpenDayIso(null) }}>
              <DialogContent className="bg-gradient-to-br from-gray-900 to-black border border-green-700/30 shadow-2xl">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                    {openDayIso ? isoToLocalDate(openDayIso)!.toLocaleDateString('en-US', { weekday: 'long' }) : 'Day details'}
                  </DialogTitle>
                  <DialogDescription className="text-green-200/80">
                    {openDayIso ? `Manage slots for ${isoToLocalDate(openDayIso)!.toLocaleDateString('en-US', { weekday: 'long' })}` : ''}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="mt-6 space-y-6">
                  <div className="bg-black/40 p-4 rounded-xl border border-green-700/20">
                    <div className="flex items-center justify-between">
                      <span className="text-green-300">Day Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        openDayIso && selectedWeekDates.includes(openDayIso) 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-gray-800/40 text-gray-400 border border-gray-700/30'
                      }`}>
                        {openDayIso ? (selectedWeekDates.includes(openDayIso) ? 'Active' : 'Inactive') : '—'}
                      </span>
                    </div>

                    {openDayIso && (
                      <div className="mt-4">
                        {selectedWeekDates.includes(openDayIso) ? (
                          <button 
                            type="button" 
                            onClick={() => setSelectedWeekDates((prev) => prev.filter((d) => d !== openDayIso!))}
                            className="w-full py-2 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors"
                          >
                            Mark Day as Inactive
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => setSelectedWeekDates((prev) => (prev.includes(openDayIso!) ? prev : [...prev, openDayIso!]))}
                              className={`w-full py-2 px-4 rounded-lg transition-colors ${
                                (slotsMap[openDayIso!] && slotsMap[openDayIso!].length > 0)
                                  ? 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400'
                                  : 'bg-gray-800/40 border border-gray-700/30 text-gray-400 cursor-not-allowed'
                              }`}
                              disabled={!(slotsMap[openDayIso!] && slotsMap[openDayIso!].length > 0)}
                            >
                              Mark Day as Active
                            </button>
                            {!(slotsMap[openDayIso!] && slotsMap[openDayIso!].length > 0) && (
                              <div className="text-sm text-yellow-300/90 bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-2">
                                Add at least one time slot to activate this day
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-green-400">Time Slots</h4>
                      <span className="text-sm text-green-200/60">
                        {openDayIso && slotsMap[openDayIso] ? `${slotsMap[openDayIso].length} slots` : 'No slots'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {(openDayIso && slotsMap[openDayIso]) ? (
                        slotsMap[openDayIso].map((s) => (
                          <div key={s.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-green-700/20">
                            <div className="text-green-100 flex items-center gap-2">
                              <span className="text-green-400">{s.time}</span>
                              <span className="text-green-200/60">•</span>
                              <span className="text-green-200">{s.capacity} players</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                type="button"
                                onClick={() => {
                                  setEditingSlot(s);
                                  removeSlot(openDayIso, s.id);
                                }}
                                className="text-sm px-3 py-1 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                              >
                                Edit
                              </button>
                              <button 
                                type="button" 
                                onClick={() => removeSlot(openDayIso, s.id)}
                                className="text-sm px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 bg-black/20 rounded-xl border border-green-700/10">
                          <p className="text-green-200/60">No time slots added yet</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-green-700/20">
                      <SlotAdder 
                        onAdd={(time, cap) => { 
                          if (openDayIso) {
                            addSlot(openDayIso, time, cap);
                            setEditingSlot(null);
                          }
                        }} 
                        editSlot={editingSlot}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <DialogClose className="px-6 py-2 bg-gray-800/40 hover:bg-gray-800 text-green-200 rounded-xl border border-green-700/30 transition-colors">
                    Close
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Review your service</h3>
                <div className="bg-black/40 p-6 rounded-xl border border-green-700/30 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-green-400 text-sm font-medium mb-1">Service Title</div>
                      <div className="text-green-100">{title}</div>
                    </div>
                    <div>
                      <div className="text-green-400 text-sm font-medium mb-1">Game</div>
                      <div className="text-green-100">{userGames.find(g => String(g.id) === String(gameId))?.name ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-green-400 text-sm font-medium mb-1">Platform</div>
                      <div className="text-green-100">{platform || '—'}</div>
                    </div>
                    <div>
                      <div className="text-green-400 text-sm font-medium mb-1">Price</div>
                      <div className="text-green-100">${price}</div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="text-green-400 text-sm font-medium mb-2">Description</div>
                    <div className="text-green-100/90 bg-black/20 p-4 rounded-lg">
                      {description || '—'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-green-700/20">
                    <div className="text-green-400 text-sm font-medium mb-3">Availability Overview</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                        <span className="text-green-300">Total sessions:</span>
                        <span className="text-green-100 font-medium">{totalSlotsCount}</span>
                      </div>
                      <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                        <span className="text-green-300">Weekly slots:</span>
                        <span className="text-green-100 font-medium">
                          {slotsThisWeekCount} {selectedWeekDates.length > 0 ? `(${selectedWeekDates.length} days)` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
              <div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => router.push('/profile/my-services')} 
                  className="bg-gray-800/40 border border-green-700/30 text-green-200 hover:bg-gray-800 hover:text-green-100 rounded-xl px-6 py-2 w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {step > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack}
                    className="bg-gray-800/40 border border-green-700/30 text-green-200 hover:bg-gray-800 hover:text-green-100 rounded-xl px-6 py-2 flex-1 sm:flex-none"
                  >
                    Back
                  </Button>
                )}
                <Button 
                  type="submit" 
                  variant="default" 
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:to-emerald-400 text-black font-semibold px-8 py-2 rounded-xl shadow-lg transition-colors flex-1 sm:flex-none" 
                  disabled={loading}
                >
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
