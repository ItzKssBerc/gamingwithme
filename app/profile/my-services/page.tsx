"use client"

import React, { useEffect, useState } from "react";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";

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
    // Fetch user's services from API
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
    try {
      const res = await fetch('/api/user/services', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      if (!res.ok) throw new Error('Delete failed')
      setServices(prev => prev.filter(s => s.id !== id))
    } catch (e) {
      console.error('Failed to delete service', e)
      alert('Could not delete service')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-500/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-400 to-teal-500 drop-shadow-2xl mb-4">
              My Services
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Manage and showcase your gaming coaching services with professional tools
            </p>
            <Button
              variant="default"
              className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-black font-bold px-8 py-4 text-lg rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-green-400/50 hover:border-green-300"
              onClick={() => window.location.href = '/profile/my-services/create'}
            >
              <span className="inline-block align-middle mr-3 text-2xl">✨</span> 
              Create New Service
            </Button>
          </div>
          
          {/* Content Section */}
          <div className="mt-16">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64 bg-gradient-to-br from-gray-800/50 to-green-900/30 backdrop-blur-sm rounded-3xl border border-green-500/20 shadow-2xl">
                <div className="relative">
                  <span className="animate-spin rounded-full h-16 w-16 border-4 border-green-500/20 border-t-green-400 shadow-lg"></span>
                  <div className="absolute inset-0 animate-pulse rounded-full bg-green-400/10"></div>
                </div>
                <span className="text-green-100 text-xl font-medium mt-6 animate-pulse">Loading your services...</span>
              </div>
            ) : services.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-gray-800/40 via-green-900/20 to-emerald-900/30 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-green-500/30 p-12 relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 bg-green-500/5 opacity-30">
                  <div className="absolute top-4 left-4 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute top-8 right-8 w-1 h-1 bg-emerald-400 rounded-full animate-pulse delay-100"></div>
                  <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse delay-200"></div>
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-green-300 rounded-full animate-pulse delay-300"></div>
                </div>
                
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center mb-8">
                    <div className="relative">
                      <span className="inline-block text-7xl text-green-400 drop-shadow-lg animate-bounce">🎮</span>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-lg font-bold">+</span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400 mb-4">
                    Ready to Start Coaching?
                  </h2>
                  <p className="text-green-200 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                    Create your first coaching service and start helping gamers improve their skills!
                  </p>
                  <Button
                    variant="default"
                    className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-black font-bold px-10 py-4 text-lg rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 border-2 border-green-400/50 hover:border-green-300 group"
                    onClick={() => window.location.href = '/profile/my-services/create'}
                  >
                    <span className="inline-block align-middle mr-3 text-xl group-hover:animate-bounce">🚀</span> 
                    Create Your First Service
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">{services.length}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-green-100">Active Services</h2>
                      <p className="text-green-300">Manage your coaching offerings</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {services.map((service, index) => (
                    <div 
                      key={service.id} 
                      className="group bg-gradient-to-br from-gray-800/60 to-green-900/30 backdrop-blur-sm rounded-2xl shadow-2xl p-6 hover:scale-[1.02] transition-all duration-300 border border-green-500/20 hover:border-green-400/50 relative overflow-hidden"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                          <ServiceCard
                            service={service}
                            memberCount={service.sessionsPerWeek || 0}
                            onDelete={handleDelete}
                            gameName={service.gameName}
                            gamePlatform={service.gamePlatform}
                            platformName={service.platformName}
                          />
                        <div className="mt-4 p-3 bg-green-900/20 rounded-lg border border-green-500/20 flex items-center justify-start space-x-3">
                          <button onClick={() => window.location.href = `/profile/my-services/plan?id=${service.id}`} className="text-sm text-green-200 hover:text-green-100">Plan</button>
                          <button onClick={() => handleDelete(service.id)} className="text-sm text-red-400 hover:text-red-500">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
