"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings, Briefcase } from "lucide-react";

export default function MyServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center">
      <Card className="w-full max-w-xl mx-auto bg-white/5 border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            My Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Service management coming soon</h2>
            <p className="text-gray-400 text-lg">Here you will be able to manage your coaching and gaming services.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
