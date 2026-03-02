"use client"

import { Button } from "@/components/ui/button"
import { signIn, useSession } from "next-auth/react"
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
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function RegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  // Redirect if already authenticated
  useEffect(() => {
    if (session) {
      router.push("/")
    }
  }, [session, router])

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRegistered, setIsRegistered] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'AccessDenied' || errorParam === 'OAuthAccountNotLinked') {
      setError("An account with this email already exists. Please sign in with your existing method.");
    }
  }, [searchParams]);

  const handleOAuthSignIn = (provider: string) => {
    // Set a cookie to indicate this is a signup attempt
    document.cookie = "is_signup=true; path=/; max-age=300"; // 5 minutes
    signIn(provider, { callbackUrl: "/" });
  }

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

      // Registration successful!
      setIsRegistered(true)
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
    <div className="min-h-screen bg-transparent text-white selection:bg-primary/30 font-sans flex items-center justify-center">
      {/* Registration Form or Success Message */}
      <div className="relative z-10 w-full flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl">
          {isRegistered ? (
            <div className="p-8 py-16 text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                  Gamer Account Created!
                </h2>
                <p className="text-gray-400 text-sm font-medium px-4">
                  Your profile has been created. Access the platform by signing in with your credentials.
                </p>
              </div>
              <Link href="/login" className="block w-full">
                <Button className="gaming-button w-full h-auto py-5 rounded-2xl group flex items-center justify-center gap-3">
                  <Star className="h-4 w-4 text-primary animate-pulse" />
                  <span className="uppercase font-black text-[10px] tracking-[.3em]">Go to Sign In</span>
                </Button>
              </Link>
            </div>
          ) : (
            <>
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
                  {/* ... same form fields ... */}
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
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

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
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

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
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

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
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

                  <Button
                    type="submit"
                    className="gaming-button w-full h-auto py-5 rounded-2xl group flex items-center justify-center gap-3 shadow-lg"
                    disabled={!agreedToTerms || isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="uppercase font-black text-[10px] tracking-[.3em]">Creating Account...</span>
                      </div>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="uppercase font-black text-[10px] tracking-[.3em]">Create Account</span>
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
                      onClick={() => handleOAuthSignIn("google")}
                      variant="outline"
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl h-12 gap-2"
                    >
                      <span className="text-xl font-bold">G</span>
                      <span className="text-[10px] font-bold tracking-widest uppercase">Google</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleOAuthSignIn("twitch")}
                      variant="outline"
                      className="bg-purple-600/10 border-purple-600/30 hover:bg-purple-600/20 text-white rounded-xl h-12 gap-2"
                    >
                      <Twitch className="h-4 w-4 text-purple-400" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">Twitch</span>
                    </Button>
                  </div>

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
            </>
          )}
        </Card>
      </div>
    </div>
  )
}