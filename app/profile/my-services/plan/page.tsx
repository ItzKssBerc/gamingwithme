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
          {/* show up to 2 slot times under the date */}
          {slotsMap && slotsMap[d.iso] && slotsMap[d.iso].length > 0 && (
            <div className="mt-2 text-[10px] text-green-100 space-y-0 max-w-full">
              {(() => {
                const items = slotsMap[d.iso]
                const limit = 5
                const show = items.slice(0, limit)
                return (
                  <>
                    {show.map((s, i) => (
                      <div key={i} className="truncate">{s.time} {s.capacity ? `• ${s.capacity}p` : ''}</div>
                    ))}
                    {items.length > limit && (
                      <div className="text-xs text-green-200">+{items.length - limit} more</div>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

// SlotAdder component for modal
function SlotAdder({ onAdd }: { onAdd: (time: string, cap: number) => void }) {
  const [time, setTime] = useState('')
  const [cap, setCap] = useState('1')
  return (
    <div className="flex items-center space-x-2">
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-9 rounded px-2 bg-black/30 text-green-100" />
      <input type="number" min={1} value={cap} onChange={(e) => setCap(e.target.value)} className="w-20 h-9 rounded px-2 bg-black/30 text-green-100" />
      <button type="button" onClick={() => { if (time) { onAdd(time, Number(cap || 1)); setTime(''); setCap('1') } }} className="text-sm bg-green-500 px-2 rounded text-black">Add slot</button>
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

export default function PlanPage() {
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

  if (!id) return <div className="p-8">Missing service id</div>
  if (loading) return <div className="p-8">Loading{error ? ` - ${error}` : '...'}</div>
  if (error) return (
    <div className="p-8">
      <div className="mb-4 text-red-400">Error: {error}</div>
      <div className="space-x-2">
        <button onClick={() => { setError(null); setLoading(true); /* refetch by changing id effect */ const f = async () => {}; setTimeout(() => window.location.reload(), 50) }} className="px-3 py-1 bg-gray-800 rounded">Retry</button>
        <button onClick={() => router.push('/profile/my-services')} className="px-3 py-1 border rounded">Back</button>
      </div>
    </div>
  )
  if (!service) return <div className="p-8">Service not found</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Plan: {service.title}</h1>
      <div className="mb-4">
        <button onClick={() => setShowRaw(v => !v)} className="text-xs px-2 py-1 border rounded">{showRaw ? 'Hide' : 'Show'} API response</button>
        {showRaw && (
          <pre className="mt-2 p-3 bg-black/60 text-xs text-green-100 overflow-auto rounded max-h-60">{JSON.stringify(rawResponse ?? service ?? {}, null, 2)}</pre>
        )}
      </div>
      <p className="mb-4 text-sm text-gray-400">Game: {service.gameName} — Platform: {service.platformName || service.gamePlatform}</p>
      <div className="space-y-6">
        <WeeklyCalendar selected={selectedWeekDates} onToggle={(iso) => {
          setSelectedWeekDates(prev => prev.includes(iso) ? prev.filter(p => p !== iso) : [...prev, iso])
        }} onOpenDay={(iso) => setOpenDayIso(iso)} slotsMap={slotsMap} />

        

        {/* Day details dialog */}
        <Dialog open={!!openDayIso} onOpenChange={(isOpen) => { if (!isOpen) setOpenDayIso(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{openDayIso ? isoToLocalDate(openDayIso)!.toLocaleDateString('en-US', { weekday: 'long' }) : 'Day details'}</DialogTitle>
              <DialogDescription>{openDayIso ? `Manage slots for ${isoToLocalDate(openDayIso)!.toLocaleDateString('en-US', { weekday: 'long' })}` : ''}</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              <p className="text-green-100">Selected: {openDayIso ? (selectedWeekDates.includes(openDayIso) ? 'Yes' : 'No') : '—'}</p>

              {openDayIso && (
                <div className="mt-2">
                  {selectedWeekDates.includes(openDayIso) ? (
                    <button type="button" onClick={() => setSelectedWeekDates((prev) => prev.filter((d) => d !== openDayIso!))} className="px-3 py-1 bg-red-600 text-white rounded">Mark day inactive</button>
                  ) : (
                    <div>
                      <button
                        type="button"
                        onClick={() => setSelectedWeekDates((prev) => (prev.includes(openDayIso!) ? prev : [...prev, openDayIso!]))}
                        className={`px-3 py-1 rounded ${((slotsMap[openDayIso!] && slotsMap[openDayIso!].length > 0) ? 'bg-green-500 text-black' : 'bg-gray-700 text-green-200 cursor-not-allowed')}`}
                        disabled={!(slotsMap[openDayIso!] && slotsMap[openDayIso!].length > 0)}
                      >
                        Mark day active
                      </button>
                      {!(slotsMap[openDayIso!] && slotsMap[openDayIso!].length > 0) && (
                        <div className="text-sm text-yellow-300 mt-2">Please add at least one slot to activate the day.</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="text-sm text-green-200 mb-2">Slots</div>
                <div className="space-y-2">
                  {(openDayIso && slotsMap[openDayIso]) ? (
                    slotsMap[openDayIso].map((s, idx) => (
                      <div key={s.id ?? idx} className="flex items-center justify-between bg-gray-900/40 px-3 py-2 rounded">
                        <div className="flex items-center space-x-2">
                          <input value={s.time} onChange={(e) => updateSlot(openDayIso, idx, { time: e.target.value })} type="time" className="bg-black/20 px-2 py-1 rounded text-green-100" />
                          <input value={String(s.capacity)} onChange={(e) => updateSlot(openDayIso, idx, { capacity: Number(e.target.value) })} type="number" min={1} className="w-20 bg-black/20 px-2 py-1 rounded text-green-100" />
                        </div>
                        <button type="button" onClick={() => { if (openDayIso) removeSlot(openDayIso, idx) }} className="text-xs text-red-400">Remove</button>
                      </div>
                    ))
                  ) : (
                    <div className="text-green-300 text-sm">No slots yet.</div>
                  )}
                </div>
                <div className="mt-3">
                  <SlotAdder onAdd={(time, cap) => { if (openDayIso) {
                    // generate id so UI updates predictably
                    const id = `${openDayIso}-${time}-${Date.now()}`
                    setSlotsMap(prev => ({ ...prev, [openDayIso]: [...(prev[openDayIso] || []), { id, time, capacity: cap }] }))
                    // ensure the day is selected
                    setSelectedWeekDates(prev => prev.includes(openDayIso!) ? prev : [...prev, openDayIso!])
                  } }} />
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

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> <span>Active</span></label>
          <button onClick={save} className="px-4 py-2 bg-green-500 text-black rounded">Save</button>
          <button onClick={() => router.push('/profile/my-services')} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </div>
    </div>
  )
}
