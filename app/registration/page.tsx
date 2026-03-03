"use client"

import { Button } from "@/components/ui/button"
import { signIn, useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
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
  Twitch,
  RefreshCw,
  Copy,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Camera,
  Upload,
  X,
  Gamepad2
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { debounce } from "lodash"


export default function RegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  // State for flow control
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRegistered, setIsRegistered] = useState(false)

  // Step 1: Account Creation State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "gamer" as "gamer" | "coach",
    nickname: "",
    bio: "",
    profilePictureUrl: "",
    clan: ""
  })

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [sliderValue, setSliderValue] = useState(0)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Step 4: IGDB Game Search State
  const [gameSearch, setGameSearch] = useState("")
  const [igdbResults, setIgdbResults] = useState<any[]>([])
  const [isSearchingGames, setIsSearchingGames] = useState(false)
  const [selectedGames, setSelectedGames] = useState<any[]>([])

  // Redirect if already authenticated and completed onboarding
  useEffect(() => {
    if (session) {
      router.push("/")
    }
  }, [session, router])

  // Real-time validation
  const checkUsername = useCallback(
    debounce(async (username: string) => {
      if (username.length < 3) {
        setUsernameStatus('idle')
        return
      }
      setUsernameStatus('checking')
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`)
        const data = await res.json()
        setUsernameStatus(data.available ? 'available' : 'taken')
      } catch (err) {
        setUsernameStatus('idle')
      }
    }, 500),
    []
  )

  const checkEmail = useCallback(
    debounce(async (email: string) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailStatus('idle')
        return
      }
      setEmailStatus('checking')
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
        const data = await res.json()
        setEmailStatus(data.available ? 'available' : 'taken')
      } catch (err) {
        setEmailStatus('idle')
      }
    }, 500),
    []
  )

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+"
    let pass = ""
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, password: pass, confirmPassword: pass }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'username') checkUsername(value)
    if (field === 'email') checkEmail(value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        handleInputChange("profilePictureUrl", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0
    let strength = 0
    if (pass.length >= 8) strength += 25
    if (/[A-Z]/.test(pass)) strength += 25
    if (/[0-9]/.test(pass)) strength += 25
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25
    return strength
  }

  const nextStep = () => setCurrentStep(prev => prev + 1)
  const prevStep = () => setCurrentStep(prev => prev - 1)

  const searchGames = useCallback(
    debounce(async (query: string) => {
      if (!query || query.trim().length < 2) {
        setIgdbResults([])
        return
      }
      setIsSearchingGames(true)
      try {
        const res = await fetch(`/api/igdb/search-games?q=${encodeURIComponent(query)}&limit=12`)
        const data = await res.json()
        setIgdbResults(data.games || [])
      } catch {
        setIgdbResults([])
      } finally {
        setIsSearchingGames(false)
      }
    }, 400),
    []
  )

  const toggleGame = (game: any) => {
    setSelectedGames(prev =>
      prev.find(g => g.id === game.id)
        ? prev.filter(g => g.id !== game.id)
        : [...prev, game]
    )
  }

  // Step 4: Platform picker state
  const [pendingGame, setPendingGame] = useState<any>(null)

  const PLATFORM_LABELS: Record<number, string> = {
    6: "PC", 48: "PS4", 167: "PS5", 49: "Xbox One", 169: "Xbox Series X",
    130: "Switch", 3: "Linux", 14: "Mac",
  }

  const getGamePlatforms = (game: any): { id: number; name: string }[] => {
    if (game.platforms && game.platforms.length > 0) {
      return game.platforms.map((p: any) => ({
        id: typeof p === 'object' ? p.id : p,
        name: typeof p === 'object' ? (p.abbreviation || p.name) : (PLATFORM_LABELS[p] || `Platform ${p}`)
      }))
    }
    return [{ id: 6, name: "PC" }, { id: 48, name: "PS4" }, { id: 167, name: "PS5" },
    { id: 49, name: "Xbox One" }, { id: 130, name: "Switch" }]
  }

  const handleGameClick = (game: any) => {
    // If already selected, remove it
    if (selectedGames.some(g => g.id === game.id)) {
      setSelectedGames(prev => prev.filter(g => g.id !== game.id))
      return
    }
    // Otherwise open platform picker
    setPendingGame(game)
  }

  const confirmGameWithPlatform = (platform: { id: number; name: string }) => {
    if (!pendingGame) return
    setSelectedGames(prev => [...prev, { ...pendingGame, selectedPlatform: platform }])
    setPendingGame(null)
  }

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameStatus !== 'available' || emailStatus !== 'available') {
      setError("Please ensure username and email are available")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (getPasswordStrength(formData.password) < 50) {
      setError("Password is too weak")
      return
    }
    if (!captchaVerified) {
      setError("Please verify the captcha (simulated)")
      return
    }
    setError("")
    nextStep()
  }

  const registerUser = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          nickname: formData.nickname,
          bio: formData.bio
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Registration failed")

      setIsRegistered(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Internal error")
      setCurrentStep(1) // Return to start if critical error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 font-sans flex flex-col items-center py-12 px-4">
      {/* Progress Stepper */}
      <div className="w-full max-w-4xl mb-12 px-4">
        <div className="flex items-center justify-between relative">
          {Array.from({ length: formData.role === 'coach' ? 5 : 4 }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${currentStep > step
                  ? 'bg-[#19FF00] border-[#19FF00] shadow-[0_0_20px_rgba(25,255,0,0.3)]'
                  : currentStep === step
                    ? 'bg-blue-700 border-blue-700 text-white shadow-[0_0_20px_rgba(29,78,216,0.5)]'
                    : 'bg-black border-white/10 text-gray-500'
                }`}>
                {currentStep > step ? <CheckCircle className="h-5 w-5 text-blue-700" /> : step}
              </div>
              <span className={`text-[8px] uppercase font-black tracking-widest mt-2 ${currentStep > step ? 'text-blue-400' : currentStep === step ? 'text-blue-400' : 'text-gray-600'
                }`}>
                Step {step}
              </span>
            </div>
          ))}
          {/* Progress Line */}
          <div className="absolute top-5 left-0 w-full h-[2px] bg-white/5 -z-0"></div>
          <div
            className="absolute top-5 left-0 h-[2px] bg-[#19FF00] -z-0 transition-all duration-500 shadow-[0_0_15px_rgba(25,255,0,0.5)]"
            style={{ width: `${(currentStep - 1) * (100 / ((formData.role === 'coach' ? 5 : 4) - 1))}%` }}
          ></div>
        </div>
      </div>

      <div className={`w-full transition-all duration-500 ${currentStep === 4 ? 'max-w-7xl' : 'max-w-xl'}`}>
        {currentStep === 1 && (
          <Card className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="text-center pt-8 pb-4">
              <CardTitle className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                Create Account
              </CardTitle>
              <CardDescription className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">
                Step 1 of {formData.role === 'coach' ? 5 : 4}: Identity & Security
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3 animate-shake">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitStep1} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 px-1">
                    <User className="h-3 w-3 text-[#19FF00]" />
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="Enter username"
                      className={`w-full px-5 py-4 bg-white/[0.03] border rounded-2xl text-white placeholder-gray-700 focus:outline-none transition-all duration-300 text-sm font-medium ${usernameStatus === 'available' ? 'border-[#19FF00]/40' :
                        usernameStatus === 'taken' ? 'border-red-500/40' : 'border-white/10'
                        }`}
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                      {usernameStatus === 'available' && <CheckCircle className="h-4 w-4 text-[#19FF00]" />}
                      {usernameStatus === 'taken' && <X className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                  {usernameStatus === 'taken' && <p className="text-[10px] text-red-500 font-bold px-2 uppercase tracking-widest">Username is already taken</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 px-1">
                    <Mail className="h-3 w-3 text-[#19FF00]" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="gamer@example.com"
                      className={`w-full px-5 py-4 bg-white/[0.03] border rounded-2xl text-white placeholder-gray-700 focus:outline-none transition-all duration-300 text-sm font-medium ${emailStatus === 'available' ? 'border-[#19FF00]/40' :
                        emailStatus === 'taken' ? 'border-red-500/40' : 'border-white/10'
                        }`}
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {emailStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                      {emailStatus === 'available' && <CheckCircle className="h-4 w-4 text-[#19FF00]" />}
                      {emailStatus === 'taken' && <X className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <Lock className="h-3 w-3 text-[#19FF00]" />
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="text-[9px] font-black text-[#19FF00] uppercase tracking-widest hover:brightness-125 transition-all flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19FF00]/20 transition-all duration-300 pr-14 text-sm font-medium tracking-widest"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors p-2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="space-y-1.5 px-1">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${getPasswordStrength(formData.password) <= 25 ? 'bg-red-500' :
                            getPasswordStrength(formData.password) <= 50 ? 'bg-orange-500' :
                              getPasswordStrength(formData.password) <= 75 ? 'bg-yellow-500' : 'bg-[#19FF00]'
                            }`}
                          style={{ width: `${getPasswordStrength(formData.password)}%` }}
                        ></div>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${getPasswordStrength(formData.password) >= 75 ? 'text-[#19FF00]' : 'text-gray-500'
                        }`}>
                        Strength: {
                          getPasswordStrength(formData.password) <= 25 ? 'Weak' :
                            getPasswordStrength(formData.password) <= 50 ? 'Fair' :
                              getPasswordStrength(formData.password) <= 75 ? 'Good' : 'Exceptional'
                        }
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 px-1">
                    <Shield className="h-3 w-3 text-[#19FF00]" />
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19FF00]/20 transition-all duration-300 pr-14 text-sm font-medium tracking-widest"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors p-2"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Smart Captcha: Slide to Verify */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                    Security Calibration
                  </label>
                  <div
                    className={`relative h-14 bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden group transition-all duration-300 ${captchaVerified ? 'border-[#19FF00]/40 bg-[#19FF00]/5' : ''}`}
                  >
                    {!captchaVerified ? (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-[10px] font-black uppercase tracking-[.2em] text-gray-600 group-hover:text-gray-400 transition-colors">
                            Slide to Verify
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sliderValue}
                          onChange={(e) => {
                            const val = parseInt(e.target.value)
                            setSliderValue(val)
                            if (val >= 95) {
                              setCaptchaVerified(true)
                              setSliderValue(100)
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#19FF00]/20 to-[#19FF00]/40 border-r border-[#19FF00]/50 transition-all duration-100 flex items-center justify-end pr-4"
                          style={{ width: `${sliderValue}%` }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#19FF00] flex items-center justify-center shadow-[0_0_15px_rgba(25,255,0,0.5)]">
                            <ChevronRight className="h-5 w-5 text-black" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center gap-3 animate-in fade-in zoom-in duration-500">
                        <CheckCircle className="h-5 w-5 text-[#19FF00]" />
                        <span className="text-[10px] font-black uppercase tracking-[.2em] text-[#19FF00]">
                          Identity Verified
                        </span>
                        <Sparkles className="h-4 w-4 text-[#19FF00] animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3 px-1">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/10 bg-white/5 text-[#19FF00] focus:ring-[#19FF00]/20 transition-all"
                  />
                  <label className="text-[10px] text-gray-500 font-medium leading-relaxed">
                    I agree to the <Link href="/terms" className="text-white hover:text-[#19FF00] underline">Terms</Link> and <Link href="/privacy" className="text-white hover:text-[#19FF00] underline">Privacy Policy</Link>.
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={!agreedToTerms || !captchaVerified}
                  className="w-full h-16 bg-[#19FF00] hover:bg-[#15D500] text-black rounded-2xl flex items-center justify-center gap-3 group transition-all duration-300 disabled:opacity-50 disabled:grayscale overflow-hidden relative shadow-[0_0_30px_rgba(25,255,0,0.1)]"
                >
                  <span className="uppercase font-black text-xs tracking-[.2em] relative z-10">Next Level</span>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </Button>

                <div className="text-center text-[10px] font-black uppercase tracking-widest text-gray-600">
                  Already have an account? <Link href="/login" className="text-white hover:text-[#19FF00] transition-colors underline">Sign in</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader className="text-center pt-8 pb-4">
              <CardTitle className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                Choose Role
              </CardTitle>
              <CardDescription className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">
                Step 2 of {formData.role === 'coach' ? 5 : 4}: Coach or Player
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange("role", "gamer")}
                  className={`relative p-6 rounded-[24px] border-2 transition-all duration-500 text-left group overflow-hidden ${formData.role === "gamer"
                    ? "bg-[#19FF00]/10 border-[#19FF00] shadow-[0_0_30px_rgba(25,255,0,0.1)]"
                    : "bg-white/[0.02] border-white/5 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div className="space-y-2">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.role === "gamer" ? "bg-[#19FF00] text-black" : "bg-white/5 text-gray-400"
                        }`}>
                        <Users className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-white">Player</h3>
                      <p className="text-xs text-gray-500 font-medium max-w-[200px]">Join the community, play games, and find teammates.</p>
                    </div>
                    {formData.role === "gamer" && <CheckCircle className="h-6 w-6 text-[#19FF00] animate-in zoom-in" />}
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Gamepad2 className="w-32 h-32 text-white" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange("role", "coach")}
                  className={`relative p-6 rounded-[24px] border-2 transition-all duration-500 text-left group overflow-hidden ${formData.role === "coach"
                    ? "bg-[#19FF00]/10 border-[#19FF00] shadow-[0_0_30px_rgba(25,255,0,0.1)]"
                    : "bg-white/[0.02] border-white/5 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div className="space-y-2">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.role === "coach" ? "bg-[#19FF00] text-black" : "bg-white/5 text-gray-400"
                        }`}>
                        <Trophy className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-white">Coach</h3>
                      <p className="text-xs text-gray-500 font-medium max-w-[200px]">Share your expertise, mentor players, and earn rewards.</p>
                    </div>
                    {formData.role === "coach" && <CheckCircle className="h-6 w-6 text-[#19FF00] animate-in zoom-in" />}
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Star className="w-32 h-32 text-white" />
                  </div>
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={prevStep}
                  variant="ghost"
                  className="flex-1 h-14 border border-white/10 text-white rounded-2xl uppercase font-black text-[10px] tracking-widest hover:bg-white/5"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={nextStep}
                  className="flex-[2] h-14 bg-[#19FF00] hover:bg-[#15D500] text-black rounded-2xl uppercase font-black text-xs tracking-widest shadow-[0_0_20px_rgba(25,255,0,0.1)]"
                >
                  Continue <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader className="text-center pt-8 pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#19FF00]/10 border border-[#19FF00]/20 mb-6">
                <Star className="h-8 w-8 text-[#19FF00]" />
              </div>
              <CardTitle className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                Profile Details
              </CardTitle>
              <CardDescription className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">
                Step 3 of {formData.role === 'coach' ? 5 : 4}: Personalize Your Identity
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-[#19FF00]/20 to-transparent border-2 border-dashed border-[#19FF00]/40 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-[#19FF00]">
                    {formData.profilePictureUrl ? (
                      <img src={formData.profilePictureUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-600 group-hover:text-[#19FF00] transition-colors">
                        <Camera className="h-8 w-8" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Upload</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {formData.profilePictureUrl && (
                    <button
                      onClick={() => handleInputChange("profilePictureUrl", "")}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-30"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Recommended: 400x400 PNG/JPG</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 px-1">
                    <User className="h-3 w-3 text-[#19FF00]" />
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange("nickname", e.target.value)}
                    placeholder="Case Sensitive Nickname"
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19FF00]/20 transition-all duration-300 text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 px-1">
                    <Shield className="h-3 w-3 text-[#19FF00]" />
                    Clan / Team
                  </label>
                  <input
                    type="text"
                    value={formData.clan}
                    onChange={(e) => handleInputChange("clan", e.target.value)}
                    placeholder="Enter your clan or team name"
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19FF00]/20 transition-all duration-300 text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 px-1">
                    <Mail className="h-3 w-3 text-[#19FF00]" />
                    Bio
                  </label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell the world about your gaming journey..."
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-[#19FF00]/20 transition-all duration-300 text-sm font-medium min-h-[120px] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={prevStep}
                  variant="ghost"
                  className="flex-1 h-14 border border-white/10 text-white rounded-2xl uppercase font-black text-[10px] tracking-widest hover:bg-white/5"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!formData.nickname}
                  className="flex-[2] h-14 bg-[#19FF00] hover:bg-[#15D500] text-black rounded-2xl uppercase font-black text-xs tracking-widest shadow-[0_0_20px_rgba(25,255,0,0.1)] disabled:opacity-50"
                >
                  Continue <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col gap-5">
            {/* Header row */}
            <div className="flex items-stretch gap-5 px-1">
              <div className="flex-shrink-0">
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#19FF00] mb-1">
                  Step 4 of {formData.role === 'coach' ? 5 : 4}
                </p>
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
                  My Games
                </h2>
              </div>
              {/* Search input — matches title height */}
              <div className="relative flex-1 self-stretch">
                <input
                  type="text"
                  value={gameSearch}
                  onChange={(e) => {
                    setGameSearch(e.target.value)
                    searchGames(e.target.value)
                  }}
                  placeholder="Search IGDB..."
                  className="w-full h-full pl-12 pr-10 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#19FF00]/30 transition-all text-sm font-medium backdrop-blur-sm"
                />
                {isSearchingGames
                  ? <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#19FF00] animate-spin" />
                  : <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                }
                {gameSearch && (
                  <button onClick={() => { setGameSearch(""); setIgdbResults([]) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Two-panel layout */}
            <div className="grid grid-cols-[320px_1fr] gap-5 h-[560px]">

              {/* LEFT: My List */}
              <div className="flex flex-col h-full rounded-3xl overflow-hidden bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
                <div className="px-5 py-4 border-b border-white/5 flex-shrink-0 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">My List</p>
                  </div>
                  {selectedGames.length > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-black text-[#19FF00] bg-[#19FF00]/10 border border-[#19FF00]/20 rounded-full uppercase tracking-widest">{selectedGames.length}</span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                  {selectedGames.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-700 gap-3">
                      <Star className="h-12 w-12 opacity-20" />
                      <p className="text-xs font-black uppercase tracking-widest text-center opacity-60">Select games<br />from the right</p>
                    </div>
                  )}
                  {selectedGames.map(game => {
                    const cover = game.cover?.url
                      ? `https:${game.cover.url.replace('t_thumb', 't_cover_small')}`
                      : null
                    return (
                      <div key={game.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 hover:border-[#19FF00]/20 rounded-2xl group transition-all">
                        {cover ? (
                          <img src={cover} alt={game.name} className="w-10 h-14 object-cover rounded-xl flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-14 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Gamepad2 className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black uppercase tracking-tight text-white line-clamp-2 mb-1.5 leading-tight">{game.name}</p>
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-[#19FF00]/10 text-[#19FF00] rounded-lg uppercase tracking-widest border border-[#19FF00]/20">{game.selectedPlatform?.name}</span>
                        </div>
                        <button
                          onClick={() => setSelectedGames(prev => prev.filter(g => g.id !== game.id))}
                          className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0 p-1 hover:bg-red-400/10 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* RIGHT: Search results */}
              <div className="flex flex-col h-full rounded-3xl overflow-hidden bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
                <div className="px-5 py-4 border-b border-white/5 flex-shrink-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Results</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {igdbResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-700 gap-3">
                      <Gamepad2 className="h-12 w-12 opacity-20" />
                      <p className="text-xs font-black uppercase tracking-widest text-center opacity-60">Search for your<br />favorite games above</p>
                    </div>
                  )}
                  <div className="grid grid-cols-4 gap-3">
                    {igdbResults.map(game => {
                      const isSelected = selectedGames.some(g => g.id === game.id)
                      const isPending = pendingGame?.id === game.id
                      const cover = game.cover?.url
                        ? `https:${game.cover.url.replace('t_thumb', 't_cover_small')}`
                        : null
                      return (
                        <div key={game.id} className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => handleGameClick(game)}
                            className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 group border-2 ${isSelected
                              ? 'border-[#19FF00] shadow-[0_0_20px_rgba(25,255,0,0.25)]'
                              : isPending
                                ? 'border-blue-400 shadow-[0_0_16px_rgba(96,165,250,0.2)]'
                                : 'border-white/5 hover:border-white/25 hover:shadow-[0_0_12px_rgba(255,255,255,0.05)]'
                              }`}
                          >
                            {cover ? (
                              <img src={cover} alt={game.name} className="w-full h-40 object-cover" />
                            ) : (
                              <div className="w-full h-40 bg-white/5 flex items-center justify-center">
                                <Gamepad2 className="h-10 w-10 text-gray-600" />
                              </div>
                            )}
                            <div className="p-3 bg-gradient-to-t from-black/80 to-black/40">
                              <span className="text-xs font-black uppercase tracking-tight text-gray-200 group-hover:text-white line-clamp-2 leading-tight">
                                {game.name}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-[#19FF00] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(25,255,0,0.5)]">
                                <CheckCircle className="h-3.5 w-3.5 text-black" />
                              </div>
                            )}
                            {!isSelected && !isPending && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const defaultPlatform = getGamePlatforms(game)[0]
                                  setSelectedGames(prev => [...prev, { ...game, selectedPlatform: defaultPlatform }])
                                }}
                                className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-[#19FF00] border border-white/20 hover:border-[#19FF00] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 text-white hover:text-black shadow-lg"
                                title="Quick add"
                              >
                                <span className="text-sm font-black leading-none">+</span>
                              </button>
                            )}
                          </button>
                          {/* Inline platform picker */}
                          {isPending && (
                            <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                              <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-2">Select platform</p>
                              <div className="flex flex-wrap gap-1.5">
                                {getGamePlatforms(game).map(platform => (
                                  <button
                                    key={platform.id}
                                    type="button"
                                    onClick={() => confirmGameWithPlatform(platform)}
                                    className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 rounded-lg hover:bg-[#19FF00]/20 hover:border-[#19FF00]/40 hover:text-[#19FF00] transition-all text-gray-400"
                                  >
                                    {platform.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="flex justify-between gap-4">
              <Button
                onClick={prevStep}
                variant="ghost"
                className="h-14 px-8 border border-white/10 text-white rounded-2xl uppercase font-black text-[10px] tracking-widest hover:bg-white/5"
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Button
                onClick={() => {
                  if (formData.role === 'coach') nextStep()
                  else registerUser()
                }}
                disabled={isLoading}
                className="h-14 px-10 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl uppercase font-black text-sm tracking-widest shadow-[0_0_30px_rgba(29,78,216,0.2)]"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (formData.role === 'coach' ? 'Continue →' : 'Finish & Create Account →')}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <Card className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader className="text-center pt-8 pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 mb-6 font-bold text-blue-500 text-2xl">
                S
              </div>
              <CardTitle className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                Monetization
              </CardTitle>
              <CardDescription className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">
                Step 5 of 5: Coach Authorization
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[28px] text-center space-y-6 border-dashed">
                <div className="space-y-2">
                  <h4 className="text-lg font-black uppercase tracking-tight text-white">Connect Stripe</h4>
                  <p className="text-xs text-gray-500 font-medium">To start earning as a coach, you'll need to link your payout method.</p>
                </div>

                <Button className="w-full h-14 bg-white text-black hover:bg-gray-100 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                  <span className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center text-white text-[10px]">S</span>
                  Connect with Stripe
                </Button>

                <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[.2em]">Securely handled via Stripe Connect</p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={prevStep}
                  variant="ghost"
                  className="flex-1 h-14 border border-white/10 text-white rounded-2xl uppercase font-black text-[10px] tracking-widest hover:bg-white/5"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={registerUser}
                  disabled={isLoading}
                  className="flex-[2] h-14 bg-[#19FF00] hover:bg-[#15D500] text-black rounded-2xl uppercase font-black text-xs tracking-widest shadow-[0_0_20px_rgba(25,255,0,0.1)]"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm & Join"} <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isRegistered && (
          <Card className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-500">
            <CardContent className="p-12 text-center space-y-8">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-[#19FF00]/10 rounded-[32px] flex items-center justify-center border border-[#19FF00]/20">
                  <CheckCircle className="h-12 w-12 text-[#19FF00] animate-bounce" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                  Welcome aboard!
                </h2>
                <p className="text-gray-400 text-sm font-medium px-4">
                  Account successfully calibrated. You are now part of the GamingWithMe elite circle.
                </p>
              </div>
              <Link href="/login" className="block w-full">
                <Button className="w-full h-16 bg-[#19FF00] hover:bg-[#15D500] text-black rounded-2xl font-black uppercase text-xs tracking-[.2em] shadow-[0_0_30px_rgba(25,255,0,0.2)]">
                  Continue to Field
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div >
  )
}