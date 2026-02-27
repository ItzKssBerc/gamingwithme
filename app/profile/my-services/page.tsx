"use client"

import React, { useEffect, useState } from "react";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Settings, Calendar, Inbox, Trash2, Edit2, ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
  sessionsPerWeek?: number;
  game?: { id: string; name: string } | null;
  platform?: { id: string; name: string } | null;
  gameName?: string | null;
  platformName?: string | null;
  gamePlatform?: string | null;
}

export default function MyServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/services")
      .then((res) => res.json())
      .then((data) => {
        const incoming = (data.services || []) as any[]
        const mapped = incoming.map(s => ({
          ...s,
          gameName: s?.game?.name ?? null,
          gamePlatform: s?.game?.platform ?? null,
          platformName: s?.platform?.name ?? null,
        }))
        setServices(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch('/api/user/services', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      if (!res.ok) throw new Error('Delete failed')
      setServices(prev => prev.filter(s => s.id !== id))
    } catch (e) {
      console.error('Failed to delete service', e)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-900/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-12">
        {/* Breadcrumbs / Back */}
        <Link href="/profile" className="inline-flex items-center text-sm text-gray-500 hover:text-green-400 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </Link>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <Layers className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-green-500/80">Creator Studio</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
              Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Services</span>
            </h1>
            <p className="text-gray-400 max-w-xl text-lg leading-relaxed">
              Create and manage your professional coaching sessions. Set your own prices, schedule availability, and track your bookings.
            </p>
          </div>

          <Link href="/profile/my-services/create">
            <Button className="h-14 px-8 bg-green-500 hover:bg-green-400 text-black font-bold rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Coaching Service
            </Button>
          </Link>
        </div>

        {/* Stats / Filter Bar (Placeholder for future) */}
        {!loading && services.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Total Services', value: services.length, icon: LayoutGrid },
              { label: 'Active Status', value: services.filter(s => s.isActive).length, icon: Settings },
              { label: 'Upcoming Slots', value: '–', icon: Calendar },
              { label: 'New Requests', value: '0', icon: Inbox },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{stat.label}</span>
                </div>
                <div className="text-2xl font-black">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium animate-pulse">Syncing your studio data...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-16 text-center backdrop-blur-sm border-dashed">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
              <Plus className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">No services built yet</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-10 text-lg">
              You haven't created any coaching services yet. Start your journey by offering your first session to the community.
            </p>
            <Link href="/profile/my-services/create">
              <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10 h-14 px-10 rounded-2xl">
                Launch Your First Service
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={service.id} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                <ServiceCard
                  service={service}
                  memberCount={service.sessionsPerWeek || 0}
                  onDelete={handleDelete}
                  gameName={service.gameName}
                  gamePlatform={service.gamePlatform}
                  platformName={service.platformName}
                />

                {/* Management Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/profile/my-services/plan?id=${service.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider py-5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Schedule
                    </Button>
                  </Link>
                  <Link href={`/profile/my-services/requests?id=${service.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider py-5 flex items-center gap-2">
                      <Inbox className="w-3.5 h-3.5" />
                      Orders
                    </Button>
                  </Link>
                  <Link href={`/profile/my-services/create?id=${service.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider py-5 flex items-center gap-2">
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleDelete(service.id)}
                    variant="secondary"
                    className="flex-1 bg-red-500/5 hover:bg-red-500/10 text-red-400/80 border border-red-500/10 rounded-xl text-xs font-bold uppercase tracking-wider py-5 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
