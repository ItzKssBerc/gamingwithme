"use client"

import { Mail, Phone, MessageCircle, Disc as Discord } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-gaming-green selection:text-black">
      {/* Hero Background Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gaming-green/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative container mx-auto px-4 pt-4 pb-16 md:pt-6 md:pb-24 max-w-7xl">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Info Cards - Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-2xl font-bold font-orbitron text-white/90 mb-8 border-l-4 border-gaming-green pl-4">
              Direct Contact
            </h2>

            <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gaming-green/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(25,255,0,0.05)]">
              <div className="flex items-start gap-5">
                <div className="p-3 rounded-xl bg-gaming-green/10 text-gaming-green transition-transform group-hover:scale-110">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-orbitron text-white/40 uppercase tracking-widest mb-1">Email</h3>
                  <a href="mailto:support@gamingwithme.com" className="text-lg text-white hover:text-gaming-green transition-colors">
                    support@gamingwithme.com
                  </a>
                </div>
              </div>
            </div>

            <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gaming-green/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(25,255,0,0.05)]">
              <div className="flex items-start gap-5">
                <div className="p-3 rounded-xl bg-gaming-green/10 text-gaming-green transition-transform group-hover:scale-110">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-orbitron text-white/40 uppercase tracking-widest mb-1">Phone</h3>
                  <a href="tel:+123456789" className="text-lg text-white hover:text-gaming-green transition-colors">
                    +1 234 567 89
                  </a>
                </div>
              </div>
            </div>

            <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gaming-green/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(25,255,0,0.05)]">
              <div className="flex items-start gap-5">
                <div className="p-3 rounded-xl bg-gaming-green/10 text-gaming-green transition-transform group-hover:scale-110">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-orbitron text-white/40 uppercase tracking-widest mb-1">Live Chat</h3>
                  <Link href="/support/chat" className="text-lg text-white hover:text-gaming-green transition-colors">
                    Start a conversation
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Response Badge */}
            <div className="p-6 rounded-2xl bg-gaming-green/5 border border-gaming-green/20">
              <div className="flex items-center gap-3 text-gaming-green mb-3">
                <div className="h-2 w-2 rounded-full bg-gaming-green animate-pulse" />
                <span className="text-xs font-bold font-orbitron uppercase tracking-widest">Active Status</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Response time: <span className="text-white font-bold">&lt; 24 hours</span>. For urgent gameplay issues, join our Discord for immediate player support.
              </p>
            </div>
          </div>

          {/* Social/Discord Section - Right Column */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-bold font-orbitron text-white/90 border-l-4 border-gaming-green pl-4 mb-8">
              Community Hub
            </h2>

            <div className="relative group overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 md:p-12 flex flex-col items-center justify-center text-center">
              {/* Background Glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gaming-green/10 blur-[80px] -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gaming-green/5 blur-[80px] -ml-32 -mb-32" />

              <div className="relative z-10 max-w-lg space-y-8">
                <div className="flex justify-center">
                  <div className="p-8 rounded-full bg-black/60 border border-gaming-green/20 shadow-[0_0_40px_rgba(25,255,0,0.1)] group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
                    <Image
                      src="/logo/logo.png"
                      alt="GamingWithMe Logo"
                      width={96}
                      height={96}
                      className="h-24 w-auto"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-4xl md:text-5xl font-bold font-orbitron text-white tracking-tighter">
                    Join Our <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Discord</span>
                  </h3>
                  <p className="text-white/40 text-lg leading-relaxed">
                    Connect with over <span className="text-white font-bold">5,000+ members</span>. Get instant support, join exclusive tournaments, and find your next squad.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-gaming-green font-bold font-orbitron text-xl">24/7</div>
                    <div className="text-white/30 text-xs uppercase tracking-widest font-bold">Support</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-emerald-400 font-bold font-orbitron text-xl">Daily</div>
                    <div className="text-white/30 text-xs uppercase tracking-widest font-bold">Events</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 col-span-2 md:col-span-1">
                    <div className="text-green-400 font-bold font-orbitron text-xl">Pro</div>
                    <div className="text-white/30 text-xs uppercase tracking-widest font-bold">Coaching</div>
                  </div>
                </div>

                <a
                  href="https://discord.gg/56FHDE6F77"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center justify-center gap-4 w-full py-6 rounded-2xl bg-gaming-green hover:bg-white text-black font-bold font-orbitron text-lg uppercase tracking-wider transition-all duration-300 shadow-[0_10px_40px_rgba(25,255,0,0.2)] hover:shadow-[0_15px_50px_rgba(25,255,0,0.4)] hover:-translate-y-1 overflow-hidden group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                  <Discord className="h-6 w-6" />
                  <span>Enter the Community</span>
                </a>

                <p className="text-white/20 text-xs font-medium uppercase tracking-[0.2em]">
                  No registration required to browse
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
