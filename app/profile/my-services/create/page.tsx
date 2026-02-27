"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, ArrowLeft, Save, Sparkles, Gamepad2, Layout, Clock, DollarSign, ListChecks } from "lucide-react"
import Link from "next/link"

export default function CreateServicePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('id')

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    gameId: "",
    platform: "",
    price: 0,
    duration: 60,
    capacity: 1,
    slots: [] as { date: string, time: string, capacity: number }[],
    weeklySlots: [] as { dayOfWeek: number, time: string, capacity: number }[]
  })

  // Fetch existing service if editing
  useEffect(() => {
    if (serviceId) {
      fetch(`/api/user/services?id=${serviceId}`)
        .then(res => res.json())
        .then(data => {
          if (data.service) {
            setFormData({
              title: data.service.title || "",
              description: data.service.description || "",
              gameId: data.service.gameId || "",
              platform: data.service.platformId || data.service.platformName || "",
              price: data.service.price || 0,
              duration: data.service.duration || 60,
              capacity: data.service.capacity || 1,
              slots: data.service.serviceSlots || [],
              weeklySlots: data.service.weeklyServiceSlots || []
            })
          }
        })
    }
  }, [serviceId])

  const addSlot = () => setFormData(prev => ({ ...prev, slots: [...prev.slots, { date: "", time: "", capacity: 1 }] }))
  const removeSlot = (index: number) => setFormData(prev => ({ ...prev, slots: prev.slots.filter((_, i) => i !== index) }))

  const addWeeklySlot = () => setFormData(prev => ({ ...prev, weeklySlots: [...prev.weeklySlots, { dayOfWeek: 1, time: "", capacity: 1 }] }))
  const removeWeeklySlot = (index: number) => setFormData(prev => ({ ...prev, weeklySlots: prev.weeklySlots.filter((_, i) => i !== index) }))

  const handleCreate = async () => {
    setIsLoading(true)
    try {
      const method = serviceId ? 'PATCH' : 'POST'
      const res = await fetch("/api/user/services", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: serviceId })
      })

      if (res.ok) {
        router.push("/profile/my-services")
      } else {
        const err = await res.json()
        alert(err.error || "Failed to save service")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-6">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-900/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link href="/profile/my-services" className="inline-flex items-center text-sm text-gray-500 hover:text-green-400 transition-colors mb-4 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-4">
              {serviceId ? "Update" : "Create"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Service</span>
              <Sparkles className="w-8 h-8 text-green-500 animate-pulse" />
            </h1>
          </div>

          <Button
            onClick={handleCreate}
            disabled={isLoading}
            className="h-14 px-10 bg-green-500 hover:bg-green-400 text-black font-extrabold rounded-2xl shadow-xl flex items-center gap-2 group shadow-green-500/20"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            {serviceId ? "Save Changes" : "Launch Service"}
          </Button>
        </div>

        <div className="space-y-12">
          {/* Section 1: Basic Info */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md relative overflow-hidden group/section">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500 scale-y-0 group-hover/section:scale-y-100 transition-transform duration-500 origin-top"></div>

            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-green-500/10 rounded-xl">
                <Layout className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-widest text-gray-300">Basic Information</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Service Title</Label>
                <Input
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Master Ninja: Movement & Strategy Coaching"
                  className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-green-500/50 transition-all text-lg font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Detailed Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what learners will achieve, your methods, and requirements..."
                  className="min-h-[160px] bg-white/5 border-white/10 rounded-xl focus:border-green-500/50 transition-all text-base resize-none py-4"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Game & Platform */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md relative overflow-hidden group/section">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500 scale-y-0 group-hover/section:scale-y-100 transition-transform duration-500 origin-top"></div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Gamepad2 className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-300">Game Details</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Search Game</Label>
                  <Input
                    value={formData.gameId}
                    onChange={e => setFormData(prev => ({ ...prev, gameId: e.target.value }))}
                    placeholder="Game Name or ID"
                    className="h-12 bg-white/5 border-white/10 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Primary Platform</Label>
                  <Input
                    value={formData.platform}
                    onChange={e => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                    placeholder="PC, PS5, Xbox, Crossplay..."
                    className="h-12 bg-white/5 border-white/10 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md relative overflow-hidden group/section">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500 scale-y-0 group-hover/section:scale-y-100 transition-transform duration-500 origin-top"></div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-yellow-500/10 rounded-xl">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-300">Pricing & Timing</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Price ($)</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="h-12 bg-white/5 border-white/10 rounded-xl text-center font-bold text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Duration (Min)</Label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={e => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      className="h-12 bg-white/5 border-white/10 rounded-xl text-center"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Session Capacity (People)</Label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={e => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    className="h-12 bg-white/5 border-white/10 rounded-xl text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Availability Slots */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md relative overflow-hidden group/section">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500 scale-y-0 group-hover/section:scale-y-100 transition-transform duration-500 origin-top"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-300">Availability Schedule</h2>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={addWeeklySlot} size="sm" className="border-white/5 hover:bg-white/5 rounded-xl flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Weekly
                </Button>
                <Button variant="outline" onClick={addSlot} size="sm" className="border-white/5 hover:bg-white/5 rounded-xl flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add One-time
                </Button>
              </div>
            </div>

            {/* Weekly Slots */}
            {formData.weeklySlots.length > 0 && (
              <div className="space-y-4 mb-8">
                <Label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 block mb-3">Recurring Weekly Slots</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.weeklySlots.map((s, i) => (
                    <div key={`w-${i}`} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 group/slot">
                      <select
                        value={s.dayOfWeek}
                        onChange={e => setFormData(prev => {
                          const copy = [...prev.weeklySlots]
                          copy[i].dayOfWeek = Number(e.target.value)
                          return { ...prev, weeklySlots: copy }
                        })}
                        className="bg-transparent text-sm font-bold text-green-400 focus:outline-none"
                      >
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, idx) => (
                          <option key={idx} value={idx} className="bg-slate-900 text-white">{d}</option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={s.time}
                        onChange={e => setFormData(prev => {
                          const copy = [...prev.weeklySlots]
                          copy[i].time = e.target.value
                          return { ...prev, weeklySlots: copy }
                        })}
                        className="bg-transparent text-sm text-gray-300 focus:outline-none"
                      />
                      <Button
                        onClick={() => removeWeeklySlot(i)}
                        variant="ghost"
                        size="icon"
                        className="ml-auto opacity-0 group-hover/slot:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Slots */}
            {formData.slots.length > 0 && (
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 block mb-3">Specific One-time Dates</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.slots.map((s, i) => (
                    <div key={`s-${i}`} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 group/slot">
                      <input
                        type="date"
                        value={s.date}
                        onChange={e => setFormData(prev => {
                          const copy = [...prev.slots]
                          copy[i].date = e.target.value
                          return { ...prev, slots: copy }
                        })}
                        className="bg-transparent text-sm font-bold text-blue-400 focus:outline-none"
                      />
                      <input
                        type="time"
                        value={s.time}
                        onChange={e => setFormData(prev => {
                          const copy = [...prev.slots]
                          copy[i].time = e.target.value
                          return { ...prev, slots: copy }
                        })}
                        className="bg-transparent text-sm text-gray-300 focus:outline-none"
                      />
                      <Button
                        onClick={() => removeSlot(i)}
                        variant="ghost"
                        size="icon"
                        className="ml-auto opacity-0 group-hover/slot:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.weeklySlots.length === 0 && formData.slots.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-gray-500 text-sm">No availability slots added yet. Click an "Add" button above to start.</p>
              </div>
            )}
          </div>

          {/* Final Checklist */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-green-500/5 border border-green-500/10 rounded-[32px]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <ListChecks className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Ready to go live?</h3>
                <p className="text-sm text-gray-400">Review your pricing and schedule before launching.</p>
              </div>
            </div>

            <Button
              onClick={handleCreate}
              disabled={isLoading}
              className="h-14 px-12 bg-green-500 hover:bg-green-400 text-black font-extrabold rounded-2xl shadow-xl flex items-center gap-2 group shadow-green-500/30"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />}
              {serviceId ? "Confirm Updates" : "Activate Service"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
