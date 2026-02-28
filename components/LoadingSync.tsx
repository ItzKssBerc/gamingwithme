"use client"

import React from 'react'

interface LoadingSyncProps {
    message?: string;
    subtext?: string;
    fullScreen?: boolean;
}

export default function LoadingSync({
    message = "SYNC",
    subtext = "Initializing",
    fullScreen = true
}: LoadingSyncProps) {
    const containerClasses = fullScreen
        ? "fixed inset-0 z-[9999] bg-[#0a0a0c] flex flex-col items-center justify-center overflow-hidden"
        : "relative w-full min-h-[400px] flex flex-col items-center justify-center bg-black/20 rounded-3xl overflow-hidden";

    return (
        <div className={containerClasses}>
            {/* Background */}
            <div className="app-background opacity-50" />

            {/* Scanning Line */}
            <div className="absolute left-0 w-full h-[1px] bg-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-scan" />

            {/* Center Content */}
            <div className="relative flex flex-col items-center scale-90 md:scale-100">
                {/* UI Elements */}
                <div className="absolute -top-12 flex gap-1 items-center opacity-30">
                    <div className="w-1 h-1 bg-white" />
                    <div className="w-8 h-[1px] bg-white/20" />
                    <div className="w-1 h-1 bg-white" />
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white font-orbitron tracking-[0.3em] animate-ui-pulse">
                    {message}
                </h1>

                <div className="mt-8 flex gap-8">
                    <div className="flex flex-col items-center text-center">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{subtext}</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div className="flex flex-col items-center text-center">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Network</span>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Active</span>
                    </div>
                </div>

                {/* Decorative Corners */}
                <div className="absolute -top-16 -left-16 w-8 h-8 border-t border-l border-white/5" />
                <div className="absolute -top-16 -right-16 w-8 h-8 border-t border-r border-white/5" />
                <div className="absolute -bottom-16 -left-16 w-8 h-8 border-b border-l border-white/5" />
                <div className="absolute -bottom-16 -right-16 w-8 h-8 border-b border-r border-white/5" />
            </div>

            {/* Progress Indicator - Corner */}
            <div className="absolute bottom-12 right-12 hidden md:flex flex-col items-end">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">System.Loading</span>
                <div className="w-48 h-[2px] bg-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-primary/40 w-1/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
                </div>
            </div>
        </div>
    )
}
