"use client"

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogHeader } from '@/components/ui/dialog'

// Simple weekly calendar component (Mon - Sun) - copied from create flow
function WeeklyCalendar({ selected, onToggle, onOpenDay, slotsMap }: { selected: string[]; onToggle: (iso: string) => void; onOpenDay?: (iso: string) => void; slotsMap?: Record<string, Array<{ time: string; capacity: number }>> }) {
  const startOfWeek = (() => {
    const d = new Date()
    const day = d.getDay()
    const diffToMon = (day + 6) % 7
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
    <div className="grid grid-cols-7 gap-2 mb-6">
      {days.map((d) => (
        <button
          key={d.iso}
          type="button"
          onClick={() => {
            if (onOpenDay) { onOpenDay(d.iso); return }
            onToggle(d.iso)
          }}
          className={`flex flex-col items-center p-3 rounded-lg transition-colors duration-150 ${selected.includes(d.iso) ? 'bg-green-500 text-black' : 'bg-gray-800/40 text-green-200'}`}
        >
          <span className="text-sm font-semibold">{d.label.charAt(0)}</span>
          <span className="text-xs mt-1">{d.number}</span>
          {slotsMap && slotsMap[d.iso] && slotsMap[d.iso].length > 0 && (
            <div className="mt-1 text-[10px]">
              <div className={`${selected.includes(d.iso) ? 'text-black' : 'text-green-200/60'}`}>
                {slotsMap[d.iso].length} slots
              </div>
            </div>
          )}
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

export default function ServicePlanPage() {
  const search = useSearchParams()
  const router = useRouter()
  const id = search.get('id')
  const [service, setService] = useState<any>(null)
  const [slotsMap, setSlotsMap] = useState<Record<string, Array<{ id?: string; time: string; capacity: number }>>>({})
  const [isActive, setIsActive] = useState<boolean>(true)
  const [selectedWeekDates, setSelectedWeekDates] = useState<string[]>([])
  const [openDayIso, setOpenDayIso] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<any>(null)
  const [showRaw, setShowRaw] = useState(false)
  const [editingSlot, setEditingSlot] = useState<{ time: string, capacity: number } | null>(null)

  useEffect(() => {
    if (!id) return
    const fetchService = async () => {
      setLoading(true)
    try {
        const res = await fetch(`/api/user/services?id=${encodeURIComponent(id)}`)
        if (!res.ok) {
      const body = await res.text().catch(() => '<no body>')
      const msg = `fetch failed: ${res.status} - ${body}`
      console.error('Plan page: fetch failed', msg)
      setError(msg)
      setLoading(false)
      return
        }
  const data = await res.json()
  setRawResponse(data)
        // diagnostic
    console.debug('Plan page: fetched service data', data)
        const svc = data?.service ?? null
        if (!svc) {
          const msg = 'service not found in response'
          console.warn('Plan page: service not found in response', { id, data })
          setError(msg)
          setLoading(false)
          return
        }
        setService(svc)
        setIsActive(!!svc.isActive)

        const byDate: Record<string, Array<{ id?: string; time: string; capacity: number }>> = {}
        const slotsRaw = Array.isArray(svc.serviceSlots) ? svc.serviceSlots : (svc.serviceSlots ? Object.values(svc.serviceSlots) : [])
        slotsRaw.forEach((ss: any) => {
          if (!ss) return
          const date = String(ss.date)
          if (!byDate[date]) byDate[date] = []
          byDate[date].push({ id: ss.id, time: ss.time, capacity: ss.capacity })
        })
        setSlotsMap(byDate)
      } catch (e: any) {
        console.error('Plan page: fetchService error', e)
        setError(String(e?.message ?? e))
      } finally {
        setLoading(false)
      }
    }
    fetchService()
  }, [id])

  const addSlot = (date: string) => {
    setSlotsMap(prev => ({ ...prev, [date]: [...(prev[date] || []), { time: '12:00', capacity: 1 }] }))
  }

  const updateSlot = (date: string, idx: number, patch: Partial<{ time: string; capacity: number }>) => {
    setSlotsMap(prev => {
      const list = [...(prev[date] || [])]
      list[idx] = { ...list[idx], ...patch }
      return { ...prev, [date]: list }
    })
  }

  const removeSlot = (date: string, idx: number) => {
    setSlotsMap(prev => {
      const list = [...(prev[date] || [])]
      list.splice(idx, 1)
      return { ...prev, [date]: list }
    })
  }

  const save = async () => {
    if (!id) return
    const slots: any[] = []
    for (const [date, list] of Object.entries(slotsMap)) {
      for (const s of list) slots.push({ date, time: s.time, capacity: s.capacity })
    }
    const res = await fetch('/api/user/services', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isActive, slots }) })
    if (!res.ok) {
      alert('Failed to save')
      return
    }
    router.push('/profile/my-services')
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          Service ID is required
        </div>
      </div>
    )
  }

  if (loading && !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 flex items-center justify-center p-4">
        <div className="text-green-400">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
            {error}
          </div>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => { 
                setError(null); 
                setLoading(true); 
                setTimeout(() => window.location.reload(), 50) 
              }} 
              className="bg-gray-800/40 border border-green-700/30 text-green-200 hover:bg-gray-800 hover:text-green-100 rounded-xl px-6 py-2"
            >
              Retry
            </button>
            <button 
              onClick={() => router.push('/profile/my-services')} 
              className="bg-gray-800/40 border border-green-700/30 text-green-200 hover:bg-gray-800 hover:text-green-100 rounded-xl px-6 py-2"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          Service not found
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="bg-gradient-to-br from-black/70 to-green-900/30 border border-green-700/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 text-center mb-2">
            Plan Schedule
          </h1>
          <div className="text-center mb-8">
            <p className="text-green-200/80 text-lg font-medium">{service.title}</p>
            <p className="text-green-200/60 text-sm mt-1">
              {service.gameName} • {service.platformName || service.gamePlatform}
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-black/40 p-6 rounded-xl border border-green-700/30">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-2">
                    Weekly Availability
                  </h3>
                  <p className="text-green-200/80">Select the days you offer this service</p>
                </div>
                
                <WeeklyCalendar 
                  selected={selectedWeekDates} 
                  onToggle={(iso) => {
                    setSelectedWeekDates(prev => prev.includes(iso) ? prev.filter(p => p !== iso) : [...prev, iso])
                  }} 
                  onOpenDay={(iso) => setOpenDayIso(iso)} 
                  slotsMap={slotsMap} 
                />

        

        {/* Day details dialog */}
        <Dialog open={!!openDayIso} onOpenChange={(isOpen) => { if (!isOpen) setOpenDayIso(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{openDayIso ? isoToLocalDate(openDayIso)!.toLocaleDateString('en-US', { weekday: 'long' }) : 'Day details'}</DialogTitle>
              <DialogDescription>{openDayIso ? `Manage slots for ${isoToLocalDate(openDayIso)!.toLocaleDateString('en-US', { weekday: 'long' })}` : ''}</DialogDescription>
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
                    slotsMap[openDayIso].map((s, idx) => (
                      <div key={s.id ?? idx} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-green-700/20">
                        <div className="text-green-100 flex items-center gap-2">
                          <span className="text-green-400">{s.time}</span>
                          <span className="text-green-200/60">•</span>
                          <span className="text-green-200">{s.capacity} players</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => {
                              if (openDayIso) {
                                setEditingSlot(s);
                                removeSlot(openDayIso, idx);
                              }
                            }}
                            className="text-sm px-3 py-1 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            type="button" 
                            onClick={() => { if (openDayIso) removeSlot(openDayIso, idx) }}
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
                        // generate id so UI updates predictably
                        const id = `${openDayIso}-${time}-${Date.now()}`
                        setSlotsMap(prev => ({ 
                          ...prev, 
                          [openDayIso]: [...(prev[openDayIso] || []), { id, time, capacity: cap }] 
                        }))
                        // ensure the day is selected
                        setSelectedWeekDates(prev => prev.includes(openDayIso!) ? prev : [...prev, openDayIso!])
                        setEditingSlot(null)
                      } 
                    }} 
                    editSlot={editingSlot}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <DialogClose className="bg-gray-800/40 px-4 py-2 rounded text-green-100">Close</DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        {/* show existing slots grouped by date as before */}
        {Object.entries(slotsMap).map(([date, list]) => (
          <div key={date} className="border rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{new Date(date).toLocaleDateString()}</div>
              <div className="space-x-2">
                <button onClick={() => addSlot(date)} className="text-sm text-green-500">Add slot</button>
                <button onClick={() => { setSlotsMap(prev => { const next = { ...prev }; delete next[date]; return next }) }} className="text-sm text-red-400">Remove all</button>
              </div>
            </div>
            <div className="space-y-2">
              {list.map((s, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <input value={s.time} onChange={(e) => updateSlot(date, i, { time: e.target.value })} type="time" className="bg-gray-900/60 px-2 py-1 rounded" />
                  <input value={String(s.capacity)} onChange={(e) => updateSlot(date, i, { capacity: Number(e.target.value) })} type="number" min={1} className="w-20 bg-gray-900/60 px-2 py-1 rounded" />
                  <button onClick={() => removeSlot(date, i)} className="text-red-400 text-sm">Remove</button>
                </div>
              ))}
            </div>
          </div>
        ))}

                <div className="flex items-center justify-center gap-4 text-sm mt-6">
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

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-green-200">
                  <input 
                    type="checkbox" 
                    checked={isActive} 
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-green-700/30 bg-black/40"
                  />
                  <span>Service Active</span>
                </label>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => router.push('/profile/my-services')} 
                  className="bg-gray-800/40 border border-green-700/30 text-green-200 hover:bg-gray-800 hover:text-green-100 rounded-xl px-6 py-2 flex-1 sm:flex-none"
                >
                  Cancel
                </button>
                <button 
                  onClick={save} 
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:to-emerald-400 text-black font-semibold px-8 py-2 rounded-xl shadow-lg transition-colors flex-1 sm:flex-none"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
