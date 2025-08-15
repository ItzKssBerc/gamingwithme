"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MessageCircle } from "lucide-react";

export default function ContactUsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-900 p-8">
      <Card className="w-full max-w-lg bg-gradient-to-br from-green-600/10 to-green-800/10 backdrop-blur-sm border-0">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-white mb-2">Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-green-400">
              <Mail className="h-6 w-6" />
              <span>Email: <a href="mailto:info@gamingwithyou.com" className="underline hover:text-green-300">info@gamingwithyou.com</a></span>
            </div>
            <div className="flex items-center gap-3 text-green-400">
              <Phone className="h-6 w-6" />
              <span>Phone: <a href="tel:+123456789" className="underline hover:text-green-300">+1 234 567 89</a></span>
            </div>
            <div className="flex items-center gap-3 text-green-400">
              <MessageCircle className="h-6 w-6" />
              <span>Chat: <a href="/support/chat" className="underline hover:text-green-300">Live Support</a></span>
            </div>
            <div className="mt-8 text-gray-300 text-sm">
              We usually respond within 24 hours. For urgent matters, please use the phone number above.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
