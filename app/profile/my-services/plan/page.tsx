"use client"

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function PlanPage() {
  const search = useSearchParams()
  const router = useRouter()
  const id = search.get('id')
  const [service, setService] = useState<any>(null)
  const [slotsMap, setSlotsMap] = useState<Record<string, Array<{ id?: string; time: string; capacity: number }>>>({})
  const [isActive, setIsActive] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      <p className="mb-4 text-sm text-gray-400">Game: {service.gameName} — Platform: {service.platformName || service.gamePlatform}</p>
      <div className="space-y-6">
        {Object.keys(slotsMap).length === 0 && <div className="text-sm text-gray-400">No slots yet. Add dates and slots.</div>}
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
