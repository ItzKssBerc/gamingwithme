"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  CheckCircle,
  Sparkles,
  Shield,
  Trophy,
  Users,
  Star,
  Zap,
  Twitch
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegistrationPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Registration successful, redirect to login
      router.push("/login?message=Registration successful! Please sign in.")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isPasswordValid = formData.password.length >= 8
  const doPasswordsMatch = formData.password === formData.confirmPassword

  return (
    <div className="min-h-screen bg-transparent flex overflow-hidden">
      {/* Left Column - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl">
          <CardHeader className="text-center pt-8 pb-4">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] relative group">
                <UserPlus className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute -inset-1 bg-primary/20 blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
              Join Authority
            </CardTitle>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Initialize Operative Profile</p>
          </CardHeader>
          <CardContent className="pt-8">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <User className="h-3 w-3" />
                  // Alias_Init
                </label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="NOMAD_UNITS"
                  className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 text-sm font-medium"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  // Contact_Vector
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="UNIT@NOMAD.SYS"
                  className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 text-sm font-medium"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  // Security_Protocol
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
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
                {formData.password && (
                  <div className="px-2 flex items-center gap-2">
                    <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${isPasswordValid ? 'bg-primary' : 'bg-yellow-500/40'}`}></div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${isPasswordValid ? 'text-primary' : 'text-yellow-500'}`}>
                      {isPasswordValid ? "Secure" : "Weak"}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  // Integrity_Check
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 pr-14 text-sm font-medium tracking-widest"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-white transition-colors p-2"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded"
                />
                <label htmlFor="terms" className="text-sm text-gray-300">
                  I agree to the{" "}
                  <Link href="/terms-and-conditions" className="text-green-400 hover:text-green-300 underline transition-colors">
                    Terms and Conditions
                  </Link>
                  {" "}and{" "}
                  <Link href="/privacy-policy" className="text-green-400 hover:text-green-300 underline transition-colors">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-lg py-3 bg-green-700/40 backdrop-blur-md border border-green-700/70 text-white shadow-lg hover:bg-green-700/60 hover:border-green-500/80 hover:scale-105 transition-all duration-300 font-bold rounded-xl"
                disabled={!agreedToTerms || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>



              {/* Sign In Link */}
              <div className="text-center text-gray-300">
                <span>Already have an account? </span>
                <Link
                  href="/login"
                  className="text-green-400 hover:text-green-300 underline font-medium transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      {/* Right Column - Video Showcase */}
      <div className="hidden lg:flex lg:w-1/2 p-0 overflow-hidden relative group">
        <video
          className="w-full h-full object-cover transition-all duration-1000 ease-in-out group-hover:scale-105"
          src="/videos/signinsignup2.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-green-900/20 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"></div>
        <div className="absolute inset-0 bg-green-950/30 mix-blend-multiply"></div>
        <div className="absolute inset-0 flex flex-col items-start justify-start text-left p-16 pointer-events-none">
          <h1 className="text-5xl font-bold text-white drop-shadow-xl mb-2">
            Join the Gaming Community!
          </h1>
          <h2 className="text-4xl font-bold text-green-400 drop-shadow-lg mb-6">
            Create Account
          </h2>
          <p className="text-xl text-gray-200 max-w-md drop-shadow-lg mb-8">
            Ready to level up? Let's get you started on your gaming journey!
          </p>
          <div className="w-full flex flex-col items-center pointer-events-auto mt-8">
            <p className="text-lg text-gray-300 mb-6">Or continue with</p>
            <div className="flex gap-8">
              <button className="h-28 w-28 flex items-center justify-center rounded-full bg-white/10 border border-green-500/30 text-white hover:bg-white/20 transition-all duration-300">
                <span className="text-5xl font-bold">G</span>
              </button>
              <button className="h-28 w-28 flex items-center justify-center rounded-full bg-white/10 border border-green-500/30 text-white hover:bg-white/20 transition-all duration-300">
                <Twitch className="h-14 w-14" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}