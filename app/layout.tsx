import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import HudBackground from "@/components/HudBackground";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GamingWithMe - Connect with Gamers",
  description: "Connect with gamers, book sessions, and discover amazing gaming experiences. Your ultimate gaming community platform.",
  keywords: ["gaming", "community", "bookings", "gamers", "esports", "tournaments"],
  authors: [{ name: "GamingWithMe Team" }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: "GamingWithMe - Connect with Gamers",
    description: "Connect with gamers, book sessions, and discover amazing gaming experiences.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GamingWithMe - Connect with Gamers",
    description: "Connect with gamers, book sessions, and discover amazing gaming experiences.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased bg-[#050505] text-white`}
      >
        <SessionProvider session={session}>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1 relative z-0 bg-[#050505]">
              <HudBackground />
              <div className="relative z-10">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
