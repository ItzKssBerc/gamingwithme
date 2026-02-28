"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Twitch
} from "lucide-react"
import Link from "next/link"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const messageParam = searchParams.get("message")
    if (messageParam) {
      setMessage(messageParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password. Please try again.")
      } else {
        // Login successful, redirect to home page
        router.push("/")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred during login.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Login Form */}
      <div className="relative w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl">
          <CardHeader className="text-center pt-12 pb-4">
            <CardTitle className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                {error}
              </div>
            )}
            {message && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-3">
                <label htmlFor="email" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 text-sm font-medium"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[9px] font-black text-gray-600 hover:text-primary uppercase tracking-tighter underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 pr-14 text-sm font-medium tracking-widest"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-white transition-colors p-2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="gaming-button w-full h-auto py-5 rounded-2xl group relative overflow-hidden"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="uppercase font-black text-[10px] tracking-[.3em]">Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <LogIn className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    <span className="uppercase font-black text-[10px] tracking-[.3em]">Sign In</span>
                  </div>
                )}
              </Button>

              <div className="relative py-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10"></span>
                </div>
                <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[.3em]">
                  <span className="bg-[#0a0a0a] px-4 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button
                  type="button"
                  onClick={() => signIn("google")}
                  variant="outline"
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl h-12 gap-2"
                >
                  <span className="text-xl font-bold">G</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase">Google</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => signIn("twitch")}
                  variant="outline"
                  className="bg-purple-600/10 border-purple-600/30 hover:bg-purple-600/20 text-white rounded-xl h-12 gap-2"
                >
                  <Twitch className="h-4 w-4 text-purple-400" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Twitch</span>
                </Button>
              </div>

              {/* Sign Up Link */}
              <div className="pt-4 text-center">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                  No active profile?
                  <Link
                    href="/registration"
                    className="ml-2 text-primary hover:text-primary/80 underline decoration-primary/20 transition-all"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
