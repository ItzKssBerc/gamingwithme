"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MessageCircle } from "lucide-react";

export default function ContactUsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-900 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-5xl bg-gradient-to-br from-green-600/5 to-green-800/10 backdrop-blur-md border border-green-500/10 shadow-2xl shadow-green-900/20">
        <CardHeader className="pb-6 pt-8 px-6 md:px-8">
          <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent text-center">Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="px-6 md:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="space-y-6">
              <div className="group flex items-center gap-5 p-4 rounded-lg transition-colors hover:bg-green-500/5">
                <div className="p-3 rounded-full bg-green-500/10 text-green-400 transition-all group-hover:scale-110 group-hover:bg-green-500/20">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-green-300">Email</div>
                  <a href="mailto:info@gamingwithyou.com" className="text-sm text-green-100/80 hover:text-green-100">support@gamingwithme.com</a>
                </div>
              </div>
              <div className="group flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-green-500/5">
                <div className="p-2 rounded-full bg-green-500/10 text-green-400 transition-all group-hover:scale-110 group-hover:bg-green-500/20">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-green-300">Phone</div>
                  <a href="tel:+123456789" className="text-sm text-green-100/80 hover:text-green-100">+1 234 567 89</a>
                </div>
              </div>
              <div className="group flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-green-500/5">
                <div className="p-2 rounded-full bg-green-500/10 text-green-400 transition-all group-hover:scale-110 group-hover:bg-green-500/20">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-green-300">Live Chat</div>
                  <a href="/support/chat" className="text-sm text-green-100/80 hover:text-green-100">Start a conversation</a>
                </div>
              </div>
              <div className="mt-8 p-5 rounded-lg bg-green-500/5 text-sm text-green-100/70 border border-green-500/10">
                <p className="leading-relaxed">We usually respond within 24 hours. For urgent matters, please use the phone number above.</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg blur opacity-30"></div>
              <div className="relative bg-black/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-200 mb-4">Join our Discord Community</h3>
                <div className="w-full flex justify-center">
                  <iframe
                    src="https://discord.com/widget?id=1407286962225807461&theme=dark"
                    width="100%"
                    height="500"
                    allowTransparency={true}
                    frameBorder={0}
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    className="w-full max-w-[420px] h-[480px] rounded-lg shadow-xl shadow-black/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-900/30"
                    title="GamingWithYou Discord"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
