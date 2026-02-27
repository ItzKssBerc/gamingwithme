import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
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
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <div className="app-grid-pattern" />
          <Navigation />
          <main className="min-h-screen relative z-0">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
