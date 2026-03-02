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
    <div className="min-h-screen bg-transparent text-white selection:bg-primary/30 font-sans">

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-12">
        {/* Navigation */}
        <Link href="/profile" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
          Navigate: Return to Profile
        </Link>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-white/[0.05] pb-12">
          <div className="max-w-2xl">

            <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
              My <span className="text-white/20">Coaching</span><br />Services
            </h1>
            <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-lg">
              Authorized access to professional service management. Configure session parameters, pricing structures, and overall availability.
            </p>
          </div>

          <Link href="/profile/my-services/create">
            <Button className="h-14 px-10 bg-white text-black hover:bg-white/90 font-black rounded-full shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 uppercase text-[10px] tracking-[0.2em]">
              <Plus className="w-4 h-4 stroke-[3]" />
              Create New Service
            </Button>
          </Link>
        </div>

        {/* Stats Section */}
        {!loading && services.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {[
              { label: 'Active Services', value: services.length, icon: LayoutGrid },
              { label: 'Live Status', value: services.filter(s => s.isActive).length, icon: Settings },
              { label: 'Total Sales', value: '00', icon: Calendar },
              { label: 'New Requests', value: '00', icon: Inbox },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-sm group hover:bg-white/[0.07] transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <stat.icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 group-hover:text-gray-400 transition-colors">{stat.label}</span>
                </div>
                <div className="text-3xl font-black tracking-tighter">
                  {typeof stat.value === 'number' && stat.value < 10 && stat.value !== 0 ? `0${stat.value}` : stat.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-white/5 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 animate-pulse">Syncing Database Cluster...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white/[0.01] border border-white/5 rounded-[48px] p-24 text-center backdrop-blur-sm border-dashed">
            <div className="group relative w-20 h-20 mx-auto mb-10">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative w-full h-full bg-[#0a0a0a] border border-white/10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                <Plus className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-black tracking-tighter mb-4 uppercase">No Services Found</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-12 text-sm font-medium leading-relaxed">
              Your service manifest is currently empty. Create your first professional service to begin coaching.
            </p>
            <Link href="/profile/my-services/create">
              <Button variant="outline" className="border-white/10 text-white hover:bg-white hover:text-black h-12 px-10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                Add First Service
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {services.map((service, index) => (
              <div key={service.id} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 150}ms` }}>
                <ServiceCard
                  service={service}
                  memberCount={service.sessionsPerWeek || 0}
                  onDelete={handleDelete}
                  gameName={service.gameName}
                  gamePlatform={service.gamePlatform}
                  platformName={service.platformName}
                />

                {/* Tactical Management Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Link href={`/profile/my-services/plan?id=${service.id}`}>
                    <Button variant="secondary" className="w-full bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] h-10 transition-all flex items-center justify-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Plan
                    </Button>
                  </Link>
                  <Link href={`/profile/my-services/requests?id=${service.id}`}>
                    <Button variant="secondary" className="w-full bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] h-10 transition-all flex items-center justify-center gap-2">
                      <Inbox className="w-3 h-3" />
                      Orders
                    </Button>
                  </Link>
                  <Link href={`/profile/my-services/create?id=${service.id}`}>
                    <Button variant="secondary" className="w-full bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] h-10 transition-all flex items-center justify-center gap-2">
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleDelete(service.id)}
                    variant="secondary"
                    className="w-full bg-red-500/5 hover:bg-red-500/15 text-red-500/60 hover:text-red-500 border border-red-500/10 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] h-10 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
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
