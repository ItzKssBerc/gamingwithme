"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Save, User, Mail, Lock, AlertTriangle, ShieldAlert, Eye, EyeOff, Settings, Gamepad2, Languages, Tags, Camera, Upload, Star, Plus, X, Loader2, Image, CreditCard, ExternalLink, CheckCircle2 } from "lucide-react"

interface Game {
  id: string
  name: string
  slug: string
  genre?: string | null
  platform?: string | null
  platforms?: Array<{ id: number, name: string }> | null
  igdbCoverUrl?: string | null
}

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner", color: "bg-white/[0.03] text-gray-400 border-white/10" },
  { value: "intermediate", label: "Intermediate", color: "bg-primary/[0.03] text-primary/70 border-primary/20" },
  { value: "advanced", label: "Advanced", color: "bg-primary/[0.05] text-primary border-primary/30" },
  { value: "expert", label: "Expert", color: "bg-primary/[0.08] text-primary font-black border-primary/40" }
]

const LANGUAGE_LEVELS = [
  { value: "basic", label: "Basic" },
  { value: "conversational", label: "Conversational" },
  { value: "fluent", label: "Fluent" },
  { value: "native", label: "Native" }
]

const COMMON_LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese",
  "Russian", "Chinese", "Japanese", "Korean", "Arabic", "Hindi"
]

const GAMING_CATEGORIES = [
  {
    id: "competitive",
    name: "Competitive Gaming",
    description: "Esports, tournaments, ranked play",
    icon: "🏆"
  },
  {
    id: "casual",
    name: "Casual Gaming",
    description: "Relaxed, fun, social gaming",
    icon: "😊"
  },
  {
    id: "streaming",
    name: "Content Creation",
    description: "Streaming, YouTube, social media",
    icon: "📺"
  },
  {
    id: "coaching",
    name: "Coaching & Teaching",
    description: "Help others improve their skills",
    icon: "🎓"
  },
  {
    id: "events",
    name: "Event Organization",
    description: "Tournaments, meetups, LAN parties",
    icon: "🎪"
  },
  {
    id: "development",
    name: "Game Development",
    description: "Creating games, modding, tools",
    icon: "🛠️"
  }
]

const COMMON_TAGS = [
  "Gamer", "Streamer", "Competitive", "Casual", "FPS", "RPG",
  "Strategy", "MOBA", "Racing", "Fighting", "Puzzle", "Indie"
]

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Account settings states
  const [savingAccount, setSavingAccount] = useState(false)
  const [accountForm, setAccountForm] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [accountErrors, setAccountErrors] = useState<{ [key: string]: string }>({})

  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmForm, setConfirmForm] = useState({
    username: "",
    email: "",
    newPassword: ""
  })
  const [confirmErrors, setConfirmErrors] = useState<{ [key: string]: string }>({})

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  // Sidebar and section states
  const [activeSection, setActiveSection] = useState("account")

  // Stripe Connect states
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null)
  const [stripeOnboardingComplete, setStripeOnboardingComplete] = useState(false)
  const [connectingStripe, setConnectingStripe] = useState(false)

  // Onboarding form states
  const [onboardingForm, setOnboardingForm] = useState({
    bio: "",
    games: [] as string[],
    languages: [] as string[]
  })
  const [onboardingErrors, setOnboardingErrors] = useState<{ [key: string]: string }>({})
  const [savingOnboarding, setSavingOnboarding] = useState(false)

  // Enhanced onboarding states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedGames, setSelectedGames] = useState<{ gameId: string, level: string, name?: string, platform?: string }[]>([])
  const [languages, setLanguages] = useState<{ language: string, level: string }[]>([])
  const [tags, setTags] = useState<string[]>([])

  // Game search states
  const [gameSearchQuery, setGameSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Game[]>([])
  const [searchingGames, setSearchingGames] = useState(false)
  const [allGames, setAllGames] = useState<Game[]>([])
  const [loadingPlatforms, setLoadingPlatforms] = useState<Set<string>>(new Set())
  const [savingPlatforms, setSavingPlatforms] = useState<Set<string>>(new Set())

  // Game selection modal states
  const [selectedGameForSetup, setSelectedGameForSetup] = useState<Game | null>(null)
  const [showGameSetupModal, setShowGameSetupModal] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedSkillLevels, setSelectedSkillLevels] = useState<{ [platform: string]: string }>({})

  // Edit game modal states
  const [editingGame, setEditingGame] = useState<{ gameId: string, level: string, name?: string, platform?: string } | null>(null)
  const [showEditGameModal, setShowEditGameModal] = useState(false)
  const [editPlatforms, setEditPlatforms] = useState<string[]>([])
  const [editSkillLevels, setEditSkillLevels] = useState<{ [platform: string]: string }>({})

  // Profile picture states
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)

  // Account status and deletion states
  const [accountStatus, setAccountStatus] = useState<boolean>(true)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteForm, setDeleteForm] = useState({
    password: "",
    confirmText: ""
  })
  const [deleteErrors, setDeleteErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)

    if (session?.user && status === 'authenticated') {
      console.log('Session is authenticated, loading profile data')
      setAccountForm({
        username: session.user.username || "",
        email: session.user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

      // Load profile data from API
      fetchProfileData()
    }
  }, [session, status])

  const fetchProfileData = async () => {
    try {
      console.log('Fetching profile data...')
      console.log('Session user:', session?.user)
      console.log('Session user email:', session?.user?.email)

      // Get session token
      const token = await fetch('/api/auth/session')
      const sessionData = await token.json()
      console.log('Session data from API:', sessionData)

      const response = await fetch('/api/user/profile-data', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Profile data received:', data)

        const profile = data.profile

        // Set onboarding form data
        setOnboardingForm({
          bio: profile.bio || "",
          games: profile.userGames?.map((ug: any) => ug.game.name) || [],
          languages: profile.userLanguages?.map((ul: any) => ul.language) || []
        })

        // Set enhanced onboarding data
        setSelectedCategories(
          profile.userTags
            ?.filter((ut: any) => ut.tag.startsWith('category:'))
            ?.map((ut: any) => ut.tag.replace('category:', '')) || []
        )

        setSelectedGames(
          profile.userGames?.map((ug: any) => ({
            gameId: ug.game.id.toString(),
            level: ug.level,
            name: ug.game.name,
            platform: ug.platform
          })) || []
        )

        setLanguages(
          profile.userLanguages?.map((ul: any) => ({
            language: ul.language,
            level: ul.level
          })) || []
        )

        setTags(
          profile.userTags
            ?.filter((ut: any) => !ut.tag.startsWith('category:'))
            ?.map((ut: any) => ut.tag) || []
        )

        // Set profile image if exists
        if (profile.avatar) {
          setProfileImage(profile.avatar)
        }

        // Set account status
        setAccountStatus(profile.isActive !== false) // Default to true if not set

        // Set Stripe status
        setStripeAccountId(profile.stripeAccountId || null)
        setStripeOnboardingComplete(!!profile.stripeOnboardingComplete)

        console.log('Profile data loaded successfully')
      } else {
        console.error('Failed to fetch profile data:', response.status)
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
    }
  }

  const validateAccountForm = () => {
    const errors: { [key: string]: string } = {}

    if (!accountForm.username.trim()) {
      errors.username = "Username is required"
    } else if (accountForm.username.length < 3) {
      errors.username = "Username must be at least 3 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(accountForm.username)) {
      errors.username = "Username can only contain letters, numbers, and underscores"
    }

    if (!accountForm.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountForm.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (accountForm.newPassword && accountForm.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters"
    }

    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    setAccountErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateConfirmForm = () => {
    const errors: { [key: string]: string } = {}

    // Check if username matches
    if (accountForm.username !== confirmForm.username) {
      errors.username = "Username does not match"
    }

    // Check if email matches
    if (accountForm.email !== confirmForm.email) {
      errors.email = "Email does not match"
    }

    // Check if new password matches (only if new password was entered)
    if (accountForm.newPassword && accountForm.newPassword !== confirmForm.newPassword) {
      errors.newPassword = "New password does not match"
    }

    // Check if new password is required when account form has it
    if (accountForm.newPassword && !confirmForm.newPassword) {
      errors.newPassword = "Please confirm your new password"
    }

    setConfirmErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveClick = () => {
    if (!validateAccountForm()) return

    // Check if any changes were made
    const hasChanges =
      accountForm.username !== (session?.user?.username || "") ||
      accountForm.email !== (session?.user?.email || "") ||
      accountForm.newPassword

    if (!hasChanges) {
      alert('No changes were made.')
      return
    }

    // Set confirmation form with changed values only
    setConfirmForm({
      username: accountForm.username,
      email: accountForm.email,
      newPassword: accountForm.newPassword
    })
    setConfirmErrors({})
    setShowConfirmModal(true)
  }

  const handleConfirmSave = async () => {
    if (!validateConfirmForm()) return

    setSavingAccount(true)
    try {
      const response = await fetch('/api/user/account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: accountForm.username,
          email: accountForm.email,
          currentPassword: accountForm.currentPassword || undefined,
          newPassword: accountForm.newPassword || undefined
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setShowConfirmModal(false)
          alert('Account updated successfully!')
          // Clear password fields after successful save
          setAccountForm(prev => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          }))
          // Clear confirmation form
          setConfirmForm({
            username: "",
            email: "",
            newPassword: ""
          })
          setConfirmErrors({})
        } else {
          setAccountErrors(data.errors || {})
          setShowConfirmModal(false)
        }
      } else {
        const errorData = await response.json()
        setAccountErrors(errorData.errors || {})
        setShowConfirmModal(false)
      }
    } catch (error) {
      console.error('Error updating account:', error)
      setAccountErrors({ general: 'Failed to update account. Please try again.' })
      setShowConfirmModal(false)
    } finally {
      setSavingAccount(false)
    }
  }

  const handleCancelConfirm = () => {
    setShowConfirmModal(false)
    setConfirmForm({
      username: "",
      email: "",
      newPassword: ""
    })
    setConfirmErrors({})
  }

  // Onboarding functions
  const validateOnboardingForm = () => {
    const errors: { [key: string]: string } = {}

    if (!onboardingForm.bio.trim()) {
      errors.bio = "Bio is required"
    } else if (onboardingForm.bio.length > 500) {
      errors.bio = "Bio must be less than 500 characters"
    }

    if (onboardingForm.games.length === 0) {
      errors.games = "At least one game is required"
    }

    if (onboardingForm.languages.length === 0) {
      errors.languages = "At least one language is required"
    }

    setOnboardingErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleOnboardingSave = async () => {
    setSavingOnboarding(true)
    try {
      const response = await fetch('/api/user/profile-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio: onboardingForm.bio,
          categories: selectedCategories,
          games: selectedGames,
          languages,
          tags
        }),
      })

      if (response.ok) {
        alert('Profile updated successfully!')
      } else {
        const errorData = await response.json()
        setOnboardingErrors(errorData.errors || {})
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setOnboardingErrors({ general: 'Failed to update profile. Please try again.' })
    } finally {
      setSavingOnboarding(false)
    }
  }

  const addGame = (game: string) => {
    if (game.trim() && !onboardingForm.games.includes(game.trim())) {
      setOnboardingForm(prev => ({
        ...prev,
        games: [...prev.games, game.trim()]
      }))
    }
  }

  const removeGame = (gameToRemove: string) => {
    setOnboardingForm(prev => ({
      ...prev,
      games: prev.games.filter(game => game !== gameToRemove)
    }))
  }

  const addLanguage = (language: string) => {
    if (language.trim() && !onboardingForm.languages.includes(language.trim())) {
      setOnboardingForm(prev => ({
        ...prev,
        languages: [...prev.languages, language.trim()]
      }))
    }
  }

  const removeLanguage = (languageToRemove: string) => {
    setOnboardingForm(prev => ({
      ...prev,
      languages: prev.languages.filter(language => language !== languageToRemove)
    }))
  }

  // Account status and deletion functions
  const handleToggleAccountStatus = async () => {
    setTogglingStatus(true)
    try {
      const newStatus = !accountStatus
      console.log('Toggling account status to:', newStatus)

      const response = await fetch('/api/user/account', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: newStatus
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Account status updated successfully:', data)
        setAccountStatus(!accountStatus)
        // Show success message inline instead of alert
        setAccountErrors({ success: data.message })
        // Clear success message after 3 seconds
        setTimeout(() => setAccountErrors({}), 3000)
      } else {
        const errorData = await response.json()
        console.error('Failed to update account status:', errorData)
        setAccountErrors({ general: errorData.error || 'Failed to update account status' })
      }
    } catch (error) {
      console.error('Error toggling account status:', error)
      alert('Failed to update account status. Please try again.')
    } finally {
      setTogglingStatus(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: deleteForm.password,
          confirmText: deleteForm.confirmText
        }),
      })

      if (response.ok) {
        // Show success message and redirect after a short delay
        setDeleteErrors({ success: 'Account deleted successfully' })
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        const errorData = await response.json()
        setDeleteErrors(errorData.errors || { general: errorData.error })
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      setDeleteErrors({ general: 'Failed to delete account. Please try again.' })
    } finally {
      setDeletingAccount(false)
    }
  }

  const validateDeleteForm = () => {
    const errors: { [key: string]: string } = {}

    if (!deleteForm.password) {
      errors.password = 'Password is required'
    }

    if (deleteForm.confirmText !== 'DELETE') {
      errors.confirmText = 'Please type DELETE to confirm'
    }

    setDeleteErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Enhanced game functions
  const handleGameSearch = async (query: string) => {
    setGameSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearchingGames(true)
    try {
      const response = await fetch(`/api/igdb/games?q=${encodeURIComponent(query)}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        const transformedGames = (data.games || []).map((game: any) => ({
          ...game,
          id: game.id.toString()
        }))
        setSearchResults(transformedGames)

        // Store in allGames for reference
        setAllGames(prev => {
          const newGames = [...prev]
          transformedGames.forEach((game: any) => {
            const existingGame = newGames.find(g => g.id === game.id)
            if (!existingGame) {
              newGames.push(game)
            } else {
              const index = newGames.findIndex(g => g.id === game.id)
              newGames[index] = { ...existingGame, ...game }
            }
          })
          return newGames
        })
      }
    } catch (error) {
      console.error('Error searching games:', error)
    } finally {
      setSearchingGames(false)
    }
  }

  const handleAddGame = (game: Game, level: string, platform?: string) => {
    const selectedPlatform = platform || game.platform || undefined
    const existingGame = selectedGames.find(g =>
      g.gameId === game.id &&
      g.platform === selectedPlatform &&
      g.level === level
    )

    if (existingGame) {
      return
    } else {
      setSelectedGames(prev => [...prev, {
        gameId: game.id,
        level,
        name: game.name,
        platform: selectedPlatform
      }])
    }

    setAllGames(prev => {
      const existingGameInAll = prev.find(g => g.id === game.id)
      if (!existingGameInAll) {
        return [...prev, game]
      } else {
        return prev.map(g => g.id === game.id ? { ...g, ...game } : g)
      }
    })

    setGameSearchQuery("")
    setSearchResults([])
  }

  const handleRemoveGame = (gameId: string, platform?: string, level?: string) => {
    if (platform && level) {
      setSelectedGames(prev => prev.filter(g =>
        !(g.gameId === gameId && g.platform === platform && g.level === level)
      ))
    } else {
      setSelectedGames(prev => prev.filter(g => g.gameId !== gameId))
    }
  }

  const handleGameSelect = (game: Game) => {
    setSelectedGameForSetup(game)
    setSelectedPlatforms([])
    setSelectedSkillLevels({})
    setShowGameSetupModal(true)
  }

  const handleQuickAdd = (game: Game) => {
    const defaultPlatform = game.platform || 'PC'
    handleAddGame(game, 'beginner', defaultPlatform)
  }

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )

    if (!selectedPlatforms.includes(platform)) {
      setSelectedSkillLevels(prev => ({
        ...prev,
        [platform]: "beginner"
      }))
    }
  }

  const handleModalSkillLevelChange = (platform: string, level: string) => {
    setSelectedSkillLevels(prev => ({
      ...prev,
      [platform]: level
    }))
  }

  const handleAddGameFromModal = () => {
    if (!selectedGameForSetup || selectedPlatforms.length === 0) {
      alert('Please select at least one platform')
      return
    }

    selectedPlatforms.forEach(platform => {
      const skillLevel = selectedSkillLevels[platform] || "beginner"
      handleAddGame(selectedGameForSetup, skillLevel, platform)
    })

    setShowGameSetupModal(false)
    setSelectedGameForSetup(null)
    setSelectedPlatforms([])
    setSelectedSkillLevels({})
    setGameSearchQuery("")
    setSearchResults([])
  }

  // Enhanced language functions
  const handleAddLanguage = () => {
    setLanguages([...languages, { language: "", level: "conversational" }])
  }

  const handleUpdateLanguage = (index: number, field: 'language' | 'level', value: string) => {
    const updatedLanguages = [...languages]
    updatedLanguages[index][field] = value
    setLanguages(updatedLanguages)
  }

  const handleRemoveLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index))
  }

  // Enhanced tag functions
  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Category functions
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleStripeConnect = async () => {
    setConnectingStripe(true)
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || "Failed to start Stripe Connect onboarding")
      }
    } catch (error) {
      console.error("Stripe Connect Error:", error)
      alert("An unexpected error occurred")
    } finally {
      setConnectingStripe(false)
    }
  }

  // Profile picture functions
  const handleImageUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setProfileImage(data.imageUrl)
        alert('Profile picture updated successfully!')
        setShowImageModal(false)
      } else {
        const errorData = await response.json()
        alert(`Failed to upload image: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleImageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="relative z-10 flex items-center gap-3 text-white/50 text-sm font-black uppercase tracking-[0.3em]">
          <div className="w-4 h-4 border-2 border-white/10 border-t-primary rounded-full animate-spin"></div>
          Synchronizing...
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-primary/30 font-sans">
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">
            Settings
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
              Manage your identity and preferences
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <Card className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveSection("account")}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${activeSection === "account"
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                      : "text-gray-500 hover:bg-white/[0.03] hover:text-white border border-transparent"
                      }`}
                  >
                    <Settings className={`h-4 w-4 ${activeSection === "account" ? "animate-spin-slow" : ""}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Account Settings</span>
                  </button>

                  <button
                    onClick={() => setActiveSection("profile")}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${activeSection === "profile"
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                      : "text-gray-500 hover:bg-white/[0.03] hover:text-white border border-transparent"
                      }`}
                  >
                    <User className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Profile Details</span>
                  </button>

                  <button
                    onClick={() => setActiveSection("payouts")}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${activeSection === "payouts"
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                      : "text-gray-500 hover:bg-white/[0.03] hover:text-white border border-transparent"
                      }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Payout Settings</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === "account" && (
              <Card className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl">
                <CardHeader className="pt-8 pb-4 px-8 text-left">
                  <CardTitle className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {accountErrors.general && (
                      <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <p className="text-red-300 text-sm">{accountErrors.general}</p>
                      </div>
                    )}

                    {accountErrors.success && (
                      <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <p className="text-green-300 text-sm">{accountErrors.success}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="username" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <User className="h-3 w-3" />
                          Username
                        </Label>
                        <Input
                          id="username"
                          value={accountForm.username}
                          onChange={(e) => setAccountForm(prev => ({ ...prev, username: e.target.value }))}
                          className="px-5 py-6 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 text-sm font-medium"
                          placeholder="Your unique ID"
                        />
                        {accountErrors.username && (
                          <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{accountErrors.username}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={accountForm.email}
                          onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                          className="px-5 py-6 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 text-sm font-medium"
                          placeholder="email@example.com"
                        />
                        {accountErrors.email && (
                          <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{accountErrors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6 pt-4">
                      <div className="space-y-3">
                        <Label htmlFor="currentPassword" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <Lock className="h-3 w-3" />
                          Current Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={accountForm.currentPassword}
                            onChange={(e) => setAccountForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="px-5 py-6 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 pr-14 text-sm font-medium tracking-widest"
                            placeholder="Required for changes"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-white transition-colors p-2"
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {accountErrors.currentPassword && (
                          <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{accountErrors.currentPassword}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="newPassword" className="text-[10px] font-black text-gray-500 uppercase tracking-widest">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={accountForm.newPassword}
                              onChange={(e) => setAccountForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="px-5 py-6 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 pr-14 text-sm font-medium tracking-widest"
                              placeholder="New key (optional)"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-white transition-colors p-2"
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {accountErrors.newPassword && (
                            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{accountErrors.newPassword}</p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="confirmPassword" className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Confirm Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={accountForm.confirmPassword}
                              onChange={(e) => setAccountForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="px-5 py-6 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 pr-14 text-sm font-medium tracking-widest"
                              placeholder="Confirm new key"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-white transition-colors p-2"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {accountErrors.confirmPassword && (
                            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{accountErrors.confirmPassword}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      className="gaming-button w-full h-auto py-5 rounded-2xl group relative overflow-hidden mt-4"
                      onClick={handleSaveClick}
                      disabled={savingAccount}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="uppercase font-black text-[10px] tracking-[.3em]">Commit Changes</span>
                      </div>
                    </Button>

                    {/* Account Status Section */}
                    <div className="pt-12">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/5"></span>
                        </div>
                        <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[.3em]">
                          <span className="bg-[#0a0a0a] px-4 text-gray-600 italic">// Access Status</span>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-white/[0.01] border border-white/[0.05] rounded-[24px] gap-6">
                        <div className="text-center md:text-left">
                          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1 flex items-center gap-2 justify-center md:justify-start">
                            Account Visibility
                            <div className={`w-1.5 h-1.5 rounded-full ${accountStatus ? 'bg-primary' : 'bg-red-500'} animate-pulse`}></div>
                          </h4>
                          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                            {accountStatus ? 'Your profile is currently active and visible' : 'Your profile is currently offline'}
                          </p>
                        </div>
                        <Button
                          onClick={handleToggleAccountStatus}
                          disabled={togglingStatus}
                          variant="outline"
                          className={`w-full md:w-auto h-auto py-3 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${accountStatus ? 'border-red-500/20 text-red-500 hover:bg-red-500/10' : 'border-primary/20 text-primary hover:bg-primary/10'}`}
                        >
                          {togglingStatus ? (
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-2" />
                          )}
                          {accountStatus ? 'Go Offline' : 'Initialize Profile'}
                        </Button>
                      </div>
                    </div>

                    {/* Account Deletion Section */}
                    <div className="pt-8">
                      <div className="p-6 bg-red-500/[0.02] border border-red-500/10 rounded-[24px]">
                        <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-3 w-3" />
                          Danger Zone
                        </h4>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tight mb-4">
                          Irreversible action. All profile data will be permanently deleted from the system.
                        </p>
                        <Button
                          onClick={() => setShowDeleteModal(true)}
                          variant="ghost"
                          className="w-full md:w-auto text-[10px] font-black text-red-500/50 hover:text-red-500 hover:bg-red-500/10 uppercase tracking-[.2em]"
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "profile" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {onboardingErrors.general && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">{onboardingErrors.general}</p>
                  </div>
                )}

                {/* Profile Picture Section */}
                <Card className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl">
                  <CardHeader className="pt-8 pb-4 px-8">
                    <CardTitle className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <Camera className="h-4 w-4 text-primary" />
                      </div>
                      Identity Visuals
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">
                      Upload your profile identification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      {/* Current Profile Picture */}
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-[24px] overflow-hidden bg-white/[0.02] border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:border-primary/40 ring-4 ring-transparent group-hover:ring-primary/10">
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt="Profile"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (session?.user as any)?.image ? (
                            <img
                              src={(session?.user as any).image}
                              alt="Profile"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <User className="h-10 w-10 text-gray-700 group-hover:text-primary transition-colors" />
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-xl shadow-xl opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                          <CheckCircle2 className="h-3 w-3 text-black" />
                        </div>
                      </div>

                      {/* Upload Controls */}
                      <div className="flex-1 text-center sm:text-left space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-white uppercase tracking-widest">Avatar Signature</h4>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            JPG / PNG / GIF • System Limit: 5MB
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                          <Button
                            onClick={() => setShowImageModal(true)}
                            className="h-auto py-3 px-6 bg-white/[0.03] border border-white/10 rounded-xl text-white hover:bg-white/[0.06] transition-all group"
                            disabled={uploadingImage}
                          >
                            <div className="flex items-center gap-2">
                              {uploadingImage ? (
                                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                              ) : (
                                <Upload className="h-3 w-3 text-primary group-hover:scale-110 transition-transform" />
                              )}
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                {uploadingImage ? 'Uploading' : 'Update Visual'}
                              </span>
                            </div>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bio Section */}
                <Card className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl">
                  <CardHeader className="pt-8 pb-4 px-8">
                    <CardTitle className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      User Biography
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">
                      System identification and narrative
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <Textarea
                      placeholder="Input your gaming background, specialization, and coaching goals..."
                      value={onboardingForm.bio}
                      onChange={(e) => setOnboardingForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="min-h-[160px] px-6 py-5 bg-white/[0.02] border border-white/10 rounded-[24px] text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 text-sm font-medium leading-relaxed resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Categories Section */}
                <Card className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl">
                  <CardHeader className="pt-8 pb-4 px-8">
                    <CardTitle className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <Star className="h-4 w-4 text-primary" />
                      </div>
                      Specialization Tags
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">
                      Define your coaching focus
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {GAMING_CATEGORIES.map((category, index) => {
                        const isSelected = selectedCategories.includes(category.id);
                        return (
                          <div
                            key={`${category.id}-${index}`}
                            onClick={() => handleCategoryToggle(category.id)}
                            className={`group p-5 rounded-[24px] border transition-all duration-500 cursor-pointer ${isSelected
                              ? 'bg-primary border-primary shadow-[0_0_30px_rgba(var(--primary),0.2)]'
                              : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10'
                              }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`text-2xl transition-transform duration-500 group-hover:scale-125 ${isSelected ? 'brightness-0' : ''}`}>
                                {category.icon}
                              </div>
                              <div>
                                <h3 className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-black' : 'text-white'}`}>
                                  {category.name}
                                </h3>
                                <p className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${isSelected ? 'text-black/60' : 'text-gray-600'}`}>
                                  {category.description}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="ml-auto">
                                  <CheckCircle2 className="h-4 w-4 text-black" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Games Section */}
                <Card className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl">
                  <CardHeader className="pt-8 pb-4 px-8">
                    <CardTitle className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <Gamepad2 className="h-4 w-4 text-primary" />
                      </div>
                      Deployment Library
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">
                      Supported Gaming Platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 space-y-8">
                    {/* Game Search */}
                    <div className="space-y-4">
                      <div className="relative group">
                        <Input
                          placeholder="Search central database for games..."
                          value={gameSearchQuery}
                          onChange={(e) => handleGameSearch(e.target.value)}
                          className="px-6 py-7 bg-white/[0.02] border border-white/10 rounded-[20px] text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 text-sm font-medium pr-14"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                          {searchingGames ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <Tags className="h-4 w-4 text-gray-700 group-focus-within:text-primary transition-colors" />
                          )}
                        </div>
                      </div>

                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <div className="mt-4 space-y-3 p-4 bg-white/[0.01] border border-white/5 rounded-[24px] max-h-[400px] overflow-y-auto custom-scrollbar">
                          <div className="flex items-center gap-2 px-2 mb-2">
                            <span className="text-[8px] font-black text-gray-700 uppercase tracking-[.3em]">Query Results</span>
                          </div>
                          {searchResults.map((game: Game, index) => {
                            const existingGame = selectedGames.find(g => g.gameId === game.id)
                            const isSelected = !!existingGame

                            return (
                              <div key={`search-${game.id}-${index}`} className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.03] rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 bg-white/[0.03] rounded-xl overflow-hidden border border-white/10 group-hover:border-primary/20 transition-all">
                                    {game.igdbCoverUrl ? (
                                      <img
                                        src={game.igdbCoverUrl}
                                        alt={game.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Gamepad2 className="h-5 w-5 text-gray-700" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest">{game.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{game.genre || 'Unknown Sector'}</span>
                                      <div className="w-0.5 h-0.5 rounded-full bg-gray-800"></div>
                                      <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{game.platform || 'Multi-Platform'}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {isSelected ? (
                                    <div className="flex items-center gap-2 pr-2">
                                      <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg">
                                        <span className="text-[8px] font-black text-primary uppercase tracking-widest">Authenticated</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-auto py-2 px-4 border-white/5 text-white/[0.4] hover:text-primary hover:border-primary/20 hover:bg-primary/5 rounded-xl transition-all"
                                        onClick={() => handleGameSelect(game)}
                                      >
                                        <span className="text-[8px] font-black uppercase tracking-widest">Initialize</span>
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Selected Games */}
                    {selectedGames.length > 0 && (
                      <div className="space-y-4 pt-6">
                        <div className="flex items-center justify-between px-2">
                          <label className="text-[8px] font-black text-gray-700 uppercase tracking-[.3em]">Game Inventory</label>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-auto py-1 px-3 text-[8px] font-black text-red-500/40 hover:text-red-500 hover:bg-red-500/5 uppercase tracking-widest rounded-lg transition-all"
                            onClick={() => setSelectedGames([])}
                          >
                            Clear All
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {(() => {
                            const groupedGames = selectedGames.reduce((acc, userGame) => {
                              const gameId = userGame.gameId
                              if (!acc[gameId]) {
                                acc[gameId] = {
                                  gameId: userGame.gameId,
                                  name: userGame.name,
                                  platforms: selectedGames
                                    .filter(g => g.gameId === gameId)
                                    .map(g => ({ platform: g.platform, level: g.level }))
                                    .filter(p => p.platform)
                                }
                              }
                              return acc
                            }, {} as Record<string, any>)

                            return Object.values(groupedGames).map((groupedGame: any, index) => {
                              const game = allGames.find(g => g.id === groupedGame.gameId) ||
                                { id: groupedGame.gameId, slug: "", name: groupedGame.name || `Asset ${groupedGame.gameId}`, genre: "", platform: "", platforms: [] } as Game

                              return (
                                <div key={`${groupedGame.gameId}-${index}`} className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/[0.05] rounded-[24px] hover:border-white/10 transition-all duration-300">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                                      <Gamepad2 className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <h3 className="text-xs font-black text-white uppercase tracking-widest">{game.name}</h3>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{game.genre || 'Sector Unassigned'}</span>
                                        <div className="w-0.5 h-0.5 rounded-full bg-gray-800"></div>
                                        <span className="text-[8px] font-bold text-primary uppercase tracking-widest">{groupedGame.platforms.length} Host{groupedGame.platforms.length > 1 ? 's' : ''} Online</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-auto py-2 px-4 text-[8px] font-black text-gray-600 hover:text-red-500 hover:bg-red-500/5 uppercase tracking-widest rounded-xl transition-all"
                                      onClick={() => handleRemoveGame(groupedGame.gameId)}
                                    >
                                      Remove Service
                                    </Button>
                                  </div>
                                </div>
                              )
                            })
                          })()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>





                <Button
                  className="gaming-button w-full h-auto py-5 rounded-2xl group relative overflow-hidden mt-8 shadow-2xl"
                  onClick={handleOnboardingSave}
                  disabled={savingOnboarding}
                >
                  <div className="flex items-center justify-center gap-3">
                    {savingOnboarding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="uppercase font-black text-[10px] tracking-[.3em]">
                      {savingOnboarding ? 'Synchronizing' : 'Commit Profile'}
                    </span>
                  </div>
                </Button>
              </div>
            )}

            {activeSection === "payouts" && (
              <Card className="bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-md p-2 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="pt-8 pb-4 px-8">
                  <CardTitle className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    Financial Terminal
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">
                    Manage monetary synchronization and payouts
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="space-y-8">
                    {!stripeOnboardingComplete ? (
                      <div className="p-8 bg-blue-500/[0.02] border border-blue-500/10 rounded-[24px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <CreditCard className="h-24 w-24 text-blue-500 -rotate-12" />
                        </div>
                        <div className="relative z-10">
                          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                            Revenue Initialization
                            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
                          </h3>
                          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-relaxed mb-6 max-w-md">
                            To enable monetary reception from operations, direct synchronization with Stripe is required. This establishes a secure terminal for your financial assets.
                          </p>
                          <Button
                            onClick={handleStripeConnect}
                            className="h-auto py-3 px-8 bg-blue-600 text-white hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/20 group"
                            disabled={connectingStripe}
                          >
                            <div className="flex items-center gap-3">
                              {connectingStripe ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                              )}
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                {stripeAccountId ? "Resume Sync" : "Initialize Stripe"}
                              </span>
                            </div>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 bg-primary/[0.02] border border-primary/10 rounded-[24px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <CheckCircle2 className="h-24 w-24 text-primary" />
                        </div>
                        <div className="relative z-10">
                          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                            Terminal Active
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                          </h3>
                          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-6">
                            Secure financial bridge established. Ready for asset distribution.
                          </p>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">SID: {stripeAccountId}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={handleStripeConnect}
                            className="h-auto py-3 px-6 text-[10px] font-black text-gray-400 hover:text-white hover:bg-white/[0.03] rounded-xl uppercase tracking-widest border border-white/5 transition-all"
                            disabled={connectingStripe}
                          >
                            <Settings className="h-3 w-3 mr-2" />
                            Manage Terminal
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="p-6 bg-white/[0.01] border border-white/[0.05] rounded-[20px]">
                      <h4 className="text-[8px] font-black text-gray-500 uppercase tracking-[.3em] mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-yellow-500/50" />
                        Service Guidelines
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="w-1 h-1 rounded-full bg-gray-800 mt-1"></div>
                          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tight">Encrypted processing via Stripe infrastructure.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-1 h-1 rounded-full bg-gray-800 mt-1"></div>
                          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tight">System fee: 10% per transaction for platform maintenance.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-1 h-1 rounded-full bg-gray-800 mt-1"></div>
                          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tight">Asset distribution subject to standard latency cycles.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Game Setup Modal */}
      {showGameSetupModal && selectedGameForSetup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
          <div className="bg-[#0a0a0c]/95 border border-white/10 backdrop-blur-2xl rounded-[32px] p-0 w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-8 space-y-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <Gamepad2 className="h-5 w-5 text-primary" />
                    </div>
                    Asset Configuration
                  </h3>
                  <button
                    onClick={() => {
                      setShowGameSetupModal(false)
                      setSelectedPlatforms([])
                      setSelectedSkillLevels({})
                    }}
                    className="p-2 text-gray-600 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-12">
                  Configure service details for: {selectedGameForSetup.name}
                </p>
              </div>

              <div className="space-y-6 max-h-[50vh] overflow-y-auto px-1 custom-scrollbar">
                {(selectedGameForSetup.platforms && selectedGameForSetup.platforms.length > 0 ?
                  Array.from(new Set(selectedGameForSetup.platforms.map(p => p.name))) :
                  ["PC", "PlayStation", "Xbox", "Nintendo", "Mobile", "VR", "Other"]
                ).map((platform) => (
                  <div key={`platform-${platform}`} className="space-y-3 p-5 bg-white/[0.01] border border-white/[0.05] rounded-[24px] hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handlePlatformToggle(platform)}
                          className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${selectedPlatforms.includes(platform)
                            ? 'bg-primary border-primary'
                            : 'bg-transparent border-white/10'
                            }`}
                        >
                          {selectedPlatforms.includes(platform) && <CheckCircle2 className="h-3 w-3 text-black" />}
                        </button>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedPlatforms.includes(platform) ? 'text-white' : 'text-gray-600'}`}>
                          {platform}
                        </span>
                      </div>
                      {selectedPlatforms.includes(platform) && (
                        <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest 
                          ${selectedSkillLevels[platform] === 'beginner' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                            selectedSkillLevels[platform] === 'intermediate' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                              selectedSkillLevels[platform] === 'advanced' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                selectedSkillLevels[platform] === 'expert' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                  'bg-primary/10 text-primary border border-primary/20'
                          }`}>
                          {selectedSkillLevels[platform] || 'Low'}
                        </div>
                      )}
                    </div>

                    {selectedPlatforms.includes(platform) && (
                      <div className="flex items-center gap-4 pt-2 pl-8">
                        <div className="flex gap-4">
                          {[1, 2, 3, 4].map((level) => {
                            const skillValue = level === 1 ? 'beginner' :
                              level === 2 ? 'intermediate' :
                                level === 3 ? 'advanced' : 'expert'
                            const isSelected = selectedSkillLevels[platform] === skillValue

                            return (
                              <button
                                key={`skill-${platform}-${level}`}
                                onClick={() => handleModalSkillLevelChange(platform, skillValue)}
                                className={`w-3 h-3 rounded-full transition-all relative ${isSelected
                                  ? 'bg-primary scale-125 shadow-[0_0_10px_rgba(var(--primary),0.5)]'
                                  : 'bg-white/10 hover:bg-white/30'
                                  }`}
                                title={skillValue}
                              >
                                {isSelected && <div className="absolute inset-0 bg-primary blur-sm scale-150 opacity-50"></div>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button
                  className="gaming-button h-auto py-5 rounded-2xl w-full group overflow-hidden relative"
                  onClick={handleAddGameFromModal}
                  disabled={selectedPlatforms.length === 0}
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                      Finalize Asset {selectedPlatforms.length > 0 ? `(${selectedPlatforms.length})` : ''}
                    </span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="h-auto py-3 text-[8px] font-black text-gray-600 hover:text-white uppercase tracking-widest"
                  onClick={() => setShowGameSetupModal(false)}
                >
                  Abort Access
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="bg-[#0a0a0c]/95 border border-white/10 backdrop-blur-2xl text-white p-0 rounded-[32px] overflow-hidden shadow-2xl max-w-lg w-[95vw]">
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  Visual Uplink
                </DialogTitle>
              </DialogHeader>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-12">
                Synchronize personal identification data
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-[24px] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all cursor-pointer group relative overflow-hidden">
              <input
                type="file"
                id="image-upload"
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={uploadingImage}
              />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 mb-4 group-hover:scale-110 transition-transform duration-500">
                  <Upload className="h-8 w-8 text-primary/40 group-hover:text-primary transition-colors" />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Engage Upload</h4>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                  Drop file here or click to browse
                </p>
              </div>
            </div>

            {uploadingImage && (
              <div className="flex items-center gap-3 p-4 bg-primary/[0.02] border border-primary/10 rounded-xl animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Uploading visual asset...</span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                variant="ghost"
                className="h-auto py-3 text-[8px] font-black text-gray-600 hover:text-white uppercase tracking-widest mt-2"
                onClick={() => setShowImageModal(false)}
              >
                Disconnect Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-[#0a0a0c]/95 border border-white/10 backdrop-blur-2xl text-white p-0 rounded-[32px] overflow-hidden shadow-2xl max-w-md w-[95vw]">
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  Review Parameters
                </DialogTitle>
              </DialogHeader>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-12">
                Verify and commit modified account data
              </p>
            </div>

            <div className="space-y-6">
              {confirmErrors.general && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-red-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">{confirmErrors.general}</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="confirmUsername" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <User className="h-3 w-3" />
                    Confirm Username
                  </Label>
                  <Input
                    id="confirmUsername"
                    value={confirmForm.username}
                    onChange={(e) => setConfirmForm(prev => ({ ...prev, username: e.target.value }))}
                    className="px-5 py-6 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 text-sm font-medium"
                    placeholder="Enter username"
                  />
                  {confirmErrors.username && (
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{confirmErrors.username}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmEmail" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    Confirm Email
                  </Label>
                  <Input
                    id="confirmEmail"
                    type="email"
                    value={confirmForm.email}
                    onChange={(e) => setConfirmForm(prev => ({ ...prev, email: e.target.value }))}
                    className="px-5 py-6 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 text-sm font-medium"
                    placeholder="Enter email"
                  />
                  {confirmErrors.email && (
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{confirmErrors.email}</p>
                  )}
                </div>

                {accountForm.newPassword && (
                  <div className="space-y-3">
                    <Label htmlFor="confirmNewPassword" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Lock className="h-3 w-3" />
                      Confirm New Key
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmNewPassword"
                        type={showConfirmNewPassword ? "text" : "password"}
                        value={confirmForm.newPassword}
                        onChange={(e) => setConfirmForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="px-5 py-6 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300 pr-14 text-sm font-medium tracking-widest"
                        placeholder="Enter new key"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-white transition-colors p-2"
                      >
                        {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmErrors.newPassword && (
                      <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{confirmErrors.newPassword}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button
                  className="gaming-button h-auto py-5 rounded-2xl w-full group overflow-hidden relative"
                  onClick={handleConfirmSave}
                  disabled={savingAccount}
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {savingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />}
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                      Secure Commit
                    </span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="h-auto py-3 text-[8px] font-black text-gray-600 hover:text-white uppercase tracking-widest"
                  onClick={handleCancelConfirm}
                  disabled={savingAccount}
                >
                  Abort Sync
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-[#0a0a0c]/95 border border-red-500/20 backdrop-blur-2xl text-white p-0 rounded-[32px] overflow-hidden shadow-2xl max-w-md w-[95vw]">
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-red-500 uppercase tracking-tighter flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-500/5 border border-red-500/10">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  Account Deletion
                </DialogTitle>
              </DialogHeader>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-12">
                Irreversible data destruction protocol
              </p>
            </div>

            <div className="space-y-6">
              {deleteErrors.general && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-red-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">{deleteErrors.general}</p>
                </div>
              )}

              {deleteErrors.success && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                  <p className="text-green-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">{deleteErrors.success}</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="deletePassword" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    Account Password
                  </Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    value={deleteForm.password}
                    onChange={(e) => setDeleteForm(prev => ({ ...prev, password: e.target.value }))}
                    className="px-5 py-6 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500/40 focus:border-red-500/40 transition-all duration-300 text-sm font-medium tracking-widest"
                    placeholder="Enter key"
                  />
                  {deleteErrors.password && (
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{deleteErrors.password}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmDelete" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    Confirmation
                  </Label>
                  <Input
                    id="confirmDelete"
                    value={deleteForm.confirmText}
                    onChange={(e) => setDeleteForm(prev => ({ ...prev, confirmText: e.target.value }))}
                    className="px-5 py-6 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500/40 focus:border-red-500/40 transition-all duration-300 text-sm font-black uppercase tracking-[0.4em]"
                    placeholder="Type DELETE"
                  />
                  {deleteErrors.confirmText && (
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{deleteErrors.confirmText}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button
                  className="h-auto py-5 bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-600/20 rounded-2xl w-full group overflow-hidden relative"
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {deletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4 group-hover:scale-110 transition-transform" />}
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                      Confirm Deletion
                    </span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="h-auto py-3 text-[8px] font-black text-gray-600 hover:text-white uppercase tracking-widest"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteForm({ password: "", confirmText: "" })
                    if (!deleteErrors.success) {
                      setDeleteErrors({})
                    }
                  }}
                  disabled={deletingAccount}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 