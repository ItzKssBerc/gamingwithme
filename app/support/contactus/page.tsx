"use client"

import { Mail, Phone, MessageCircle, Disc as Discord } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-gaming-green selection:text-black">
      <div className="relative container mx-auto px-4 md:px-10 pt-4 pb-16 md:pt-6 md:pb-24 max-w-7xl">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Contact Info Cards - Left Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-[1px] w-8 bg-white/[0.1]"></div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 font-orbitron">
                Direct Contact
              </h2>
              <div className="h-[1px] flex-1 bg-white/[0.1]"></div>
            </div>

            <div className="group p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#070707]/90 border border-white/[0.03] backdrop-blur-sm hover:border-gaming-green/30 transition-all duration-500">
              <div className="flex items-center md:items-start gap-4 md:gap-6">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/[0.05] border border-white/[0.05] text-gaming-green transition-transform group-hover:scale-110 shrink-0">
                  <Mail className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[9px] md:text-[10px] font-black font-orbitron text-gray-500 uppercase tracking-widest mb-1">Email</h3>
                  <a href="mailto:support@gamingwithme.com" className="text-lg md:text-xl font-bold text-white hover:text-gaming-green transition-colors tracking-tighter truncate block">
                    support@gamingwithme.com
                  </a>
                </div>
              </div>
            </div>

            <div className="group p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#070707]/90 border border-white/[0.03] backdrop-blur-sm hover:border-gaming-green/30 transition-all duration-500">
              <div className="flex items-center md:items-start gap-4 md:gap-6">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/[0.05] border border-white/[0.05] text-gaming-green transition-transform group-hover:scale-110 shrink-0">
                  <Phone className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[9px] md:text-[10px] font-black font-orbitron text-gray-500 uppercase tracking-widest mb-1">Phone</h3>
                  <a href="tel:+123456789" className="text-base md:text-xl font-bold text-white hover:text-gaming-green transition-colors tracking-tighter truncate block">
                    +1 234 567 89
                  </a>
                </div>
              </div>
            </div>

            <div className="group p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#070707]/90 border border-white/[0.03] backdrop-blur-sm hover:border-gaming-green/30 transition-all duration-500">
              <div className="flex items-center md:items-start gap-4 md:gap-6">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/[0.05] border border-white/[0.05] text-gaming-green transition-transform group-hover:scale-110 shrink-0">
                  <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[9px] md:text-[10px] font-black font-orbitron text-gray-500 uppercase tracking-widest mb-1">Live Chat</h3>
                  <Link href="/support/chat" className="text-base md:text-xl font-bold text-white hover:text-gaming-green transition-colors tracking-tighter block">
                    Start a conversation
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Response Badge */}
            <div className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#070707]/90 border border-white/[0.03] backdrop-blur-sm overflow-hidden relative">

              <div className="flex items-center gap-3 text-gaming-green mb-3 md:mb-4 relative z-10">
                <div className="h-2 w-2 rounded-full bg-gaming-green animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-black font-orbitron uppercase tracking-[0.3em]">Support Status</span>
              </div>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed relative z-10 font-medium tracking-tight">
                Standard response window: <span className="text-white font-black">&lt; 24 hours</span>. For faster response, join our community on Discord.
              </p>
            </div>
          </div>

          {/* Social/Discord Section - Right Column */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-[1px] w-8 bg-white/[0.1]"></div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 font-orbitron">
                Community Hub
              </h2>
              <div className="h-[1px] flex-1 bg-white/[0.1]"></div>
            </div>

            <div className="relative group overflow-hidden rounded-[40px] bg-[#070707]/90 border border-white/[0.03] p-8 md:p-16 flex flex-col items-center justify-center text-center backdrop-blur-sm">
              {/* Internal Accent Glow */}


              <div className="relative z-10 max-w-xl space-y-12">
                <div className="flex justify-center">
                  <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.1] shadow-2xl group-hover:scale-110 transition-transform duration-700 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gaming-green/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Image
                      src="/logo/logo.png"
                      alt="GamingWithMe Logo"
                      width={120}
                      height={120}
                      className="h-16 w-auto md:h-28 relative z-10"
                    />
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-3xl md:text-7xl font-black font-orbitron text-white tracking-tighter uppercase italic leading-[1.1] md:leading-[0.9]">
                    Join Our <span className="text-white">Discord</span>
                  </h3>
                  <p className="text-gray-500 text-base md:text-xl leading-relaxed max-w-md mx-auto font-medium">
                    Join <span className="text-white font-black">5,000+ gamers</span>. Instant support, global events, and finding new teammates.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 pt-4">
                  <div className="p-4 md:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="text-gaming-green font-black font-orbitron text-lg md:text-2xl tracking-tighter italic">24/7</div>
                    <div className="text-gray-600 text-[8px] md:text-[9px] uppercase tracking-widest font-black mt-1">Active</div>
                  </div>
                  <div className="p-4 md:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="text-white font-black font-orbitron text-lg md:text-2xl tracking-tighter italic">Daily</div>
                    <div className="text-gray-600 text-[8px] md:text-[9px] uppercase tracking-widest font-black mt-1">Play</div>
                  </div>
                  <div className="p-4 md:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05] col-span-2 md:col-span-1">
                    <div className="text-white font-black font-orbitron text-lg md:text-2xl tracking-tighter italic">PRO</div>
                    <div className="text-gray-600 text-[8px] md:text-[9px] uppercase tracking-widest font-black mt-1">Tips</div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 md:pt-6">
                  <a
                    href="https://discord.gg/56FHDE6F77"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center justify-center gap-4 md:gap-6 w-full py-6 md:py-8 rounded-[20px] md:rounded-[24px] bg-white text-black font-black font-orbitron text-base md:text-xl uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all duration-500 shadow-2xl hover:shadow-gaming-green/20 hover:-translate-y-2 overflow-hidden group/btn"
                  >
                    <Discord className="h-5 w-5 md:h-7 md:w-7" />
                    <span>Join the Server</span>
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </a>

                  <p className="text-gray-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] italic leading-tight">
                    Secure connection enabled
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
