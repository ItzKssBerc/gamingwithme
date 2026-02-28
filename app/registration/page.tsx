"use client"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
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
    <div className="min-h-screen flex items-center justify-center">
      {/* Registration Form */}
      <div className="w-full flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl">
          <CardHeader className="text-center pt-12 pb-4">
            <CardTitle className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
              Create Account
            </CardTitle>
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
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="Username"
                  className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 text-sm font-medium"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 text-sm font-medium"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  Password
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
                  Confirm Password
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
    </div>
  )
}