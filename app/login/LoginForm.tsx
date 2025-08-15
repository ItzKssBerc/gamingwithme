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
  EyeOff
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 grid md:grid-cols-2">
      {/* Video Section */}
      <div className="hidden md:block h-screen relative">
        <video 
          className="w-full h-full object-cover" 
          src="/videos/signinsignup.mp4" 
          autoPlay 
          muted 
          loop 
          playsInline
        />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-slate-900"></div>
      </div>

      {/* Login Form */}
      <div className="relative flex items-center justify-center p-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green-900/50 to-transparent blur-3xl -translate-x-1/2"></div>
        <Card className="w-full max-w-md gaming-card border-0 bg-gradient-to-br from-green-600/10 to-green-800/10 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/10 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all duration-300"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-white/10 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all duration-300 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-green-400 hover:text-green-300 underline transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full text-lg py-3 bg-green-300/30 backdrop-blur-md border border-green-300/50 text-white shadow-lg hover:bg-green-300/50 hover:border-green-400/70 hover:scale-105 transition-all duration-300 font-bold rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging In...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Login
                  </>
                )}
              </Button>

              {/* Sign Up Link */}
              <div className="text-center text-gray-300">
                <span>New to GamingWithYou? </span>
                <Link 
                  href="/registration" 
                  className="text-green-400 hover:text-green-300 underline font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
