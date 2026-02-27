"use client"

import { Button } from "@/components/ui/button"
import {
  Gamepad2,
  Users,
  Calendar,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navigation() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile()
    }
  }, [session])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  return (
    <nav className={`sticky top-0 z-50 transition-colors duration-500 ${isScrolled
      ? 'bg-black/80 backdrop-blur-md border-b border-white/[0.02]'
      : 'bg-black border-b border-white/[0.05]'
      }`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Logo - col - balra igazítva */}
          <div className="col-span-1 flex items-center justify-start">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo/logo.png"
                alt="GamingWithMe Logo"
                width={32}
                height={32}
                className="h-8 w-auto opacity-80"
                priority
              />
              <span className="text-xl font-black text-gray-200 font-orbitron tracking-wider">GamingWithMe</span>
            </Link>
          </div>

          {/* Mobile Navigation - col - középre igazítva */}
          <div className="col-span-1 md:hidden flex items-center justify-center">
            {/* Üres - mobil menüben nincs tartalom */}
          </div>

          {/* Desktop Navigation - col - középre igazítva */}
          <div className="col-span-1 hidden md:flex items-center justify-center">
            <div className="flex items-center space-x-8">
              <Link href="/games" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                Games
              </Link>
              <Link href="/gamers" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                Gamers
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-1 px-2 py-1 rounded-md">
                    Support <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/90 border border-white/[0.05] text-white rounded-xl shadow-2xl min-w-[140px] backdrop-blur-xl" align="start">
                  <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 rounded-lg mx-1 my-0.5">
                    <Link href="/support/contactus" className="flex items-center space-x-2 cursor-pointer py-2 px-3">
                      <span className="text-[10px] font-black uppercase tracking-widest">Contact us</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 rounded-lg mx-1 my-0.5">
                    <Link href="/support/faq" className="flex items-center space-x-2 cursor-pointer py-2 px-3">
                      <span className="text-[10px] font-black uppercase tracking-widest">FAQ</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Desktop Auth Buttons - col - jobbra igazítva */}
          <div className="col-span-1 hidden md:flex items-center justify-end space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto bg-transparent border-none hover:bg-transparent">
                      <div className="p-1 rounded-full hover:bg-white/5 transition-colors">
                        {userProfile?.avatar ? (
                          <Image
                            src={userProfile.avatar}
                            alt="Profile"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover border border-white/10 hover:border-white/20 transition-colors"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-white/10 hover:border-white/20 transition-colors">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-black/90 border border-white/[0.05] text-white rounded-xl shadow-2xl backdrop-blur-xl" sideOffset={10} align="end">
                    <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 rounded-lg mx-1 my-0.5">
                      <Link href="/profile" className="flex items-center space-x-2 cursor-pointer py-2 px-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 rounded-lg mx-1 my-0.5">
                      <Link href={`/profile/${session.user?.username}/my-bookings`} className="flex items-center space-x-2 cursor-pointer py-2 px-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">My Bookings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 rounded-lg mx-1 my-0.5">
                      <Link href="/profile/my-services" className="flex items-center space-x-2 cursor-pointer py-2 px-3">
                        <Settings className="h-4 w-4 text-gray-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">My Services</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 rounded-lg mx-1 my-0.5">
                      <Link href="/profile" className="flex items-center space-x-2 cursor-pointer py-2 px-3">
                        <Settings className="h-4 w-4 text-gray-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/[0.05] mx-2" />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center space-x-2 cursor-pointer text-red-500/70 hover:text-red-400 hover:bg-red-500/5 focus:bg-red-500/5 rounded-lg mx-1 my-0.5 py-2 px-3"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Button asChild className="h-9 min-w-[100px] justify-center bg-white/[0.08] border border-white/[0.1] text-gray-300 hover:text-white hover:bg-white/[0.15] transition-all duration-300 font-orbitron tracking-widest text-[10px] uppercase font-black rounded-lg">
                  <Link href="/login">
                    Login
                  </Link>
                </Button>
                <Button asChild className="h-9 min-w-[100px] justify-center bg-green-600/80 border border-green-500/50 text-black shadow-lg hover:bg-green-500 transition-all duration-300 font-orbitron tracking-widest text-[10px] uppercase font-black rounded-lg">
                  <Link href="/registration">
                    Sign up
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="col-span-1 md:hidden flex items-center justify-end">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/[0.05]">
            <div className="flex flex-col space-y-4">
              <Link
                href="/games"
                className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest"
                onClick={() => setIsMenuOpen(false)}
              >
                <Gamepad2 className="h-4 w-4" />
                <span>Games</span>
              </Link>
              <Link
                href="/gamers"
                className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="h-4 w-4" />
                <span>Gamers</span>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-400 hover:text-white transition-colors flex items-center justify-between w-full space-x-2 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Support</span>
                    </div>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[calc(100vw-2rem)] bg-black/90 border border-white/[0.05] text-white rounded-xl shadow-2xl backdrop-blur-xl" side="bottom" align="start" sideOffset={10}>
                  <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 rounded-lg mx-1 my-0.5">
                    <Link href="/support/contactus" className="flex items-center space-x-2 cursor-pointer py-2 px-3" onClick={() => setIsMenuOpen(false)}>
                      <span className="text-[10px] font-black uppercase tracking-widest">Contact us</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 rounded-lg mx-1 my-0.5">
                    <Link href="/support/faq" className="flex items-center space-x-2 cursor-pointer py-2 px-3" onClick={() => setIsMenuOpen(false)}>
                      <span className="text-[10px] font-black uppercase tracking-widest">FAQ</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="pt-4 border-t border-white/[0.05]">
                {session ? (
                  <div className="flex flex-col space-y-2">
                    {/* Mobile Profile Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-0 h-auto bg-transparent border-none hover:bg-transparent w-full justify-start">
                          <div className="flex items-center space-x-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl w-full hover:bg-white/5 transition-colors">
                            {userProfile?.avatar ? (
                              <Image
                                src={userProfile.avatar}
                                alt="Profile"
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover border border-white/10"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-white/10">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                            <div className="flex-1 text-left">
                              <p className="text-gray-200 font-black text-[10px] uppercase tracking-widest">
                                {session.user?.username || session.user?.email}
                              </p>
                              <p className="text-gray-600 text-[9px] uppercase font-black">Tap to open menu</p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-700" />
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full bg-black/90 border border-white/[0.05] text-white rounded-xl backdrop-blur-xl" side="bottom" align="start" sideOffset={10}>
                        <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 rounded-lg mx-1 my-0.5">
                          <Link href="/profile" className="flex items-center space-x-2 cursor-pointer py-2 px-3" onClick={() => setIsMenuOpen(false)}>
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 rounded-lg mx-1 my-0.5">
                          <Link href={`/profile/${session.user?.username}/my-bookings`} className="flex items-center space-x-2 cursor-pointer py-2 px-3" onClick={() => setIsMenuOpen(false)}>
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">My Bookings</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 rounded-lg mx-1 my-0.5">
                          <Link href="/profile/my-services" className="flex items-center space-x-2 cursor-pointer py-2 px-3" onClick={() => setIsMenuOpen(false)}>
                            <Settings className="h-4 w-4 text-gray-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">My Services</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 rounded-lg mx-1 my-0.5">
                          <Link href="/profile" className="flex items-center space-x-2 cursor-pointer py-2 px-3" onClick={() => setIsMenuOpen(false)}>
                            <Settings className="h-4 w-4 text-gray-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-white/[0.05] mx-2" />
                        <DropdownMenuItem
                          onClick={() => {
                            signOut({ callbackUrl: "/" })
                            setIsMenuOpen(false)
                          }}
                          className="flex items-center space-x-2 cursor-pointer text-red-500/70 hover:text-red-400 hover:bg-red-500/5 focus:bg-red-500/5 rounded-lg mx-1 my-0.5 py-2 px-3"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button asChild className="w-full justify-center bg-white/[0.08] border border-white/[0.1] text-gray-300 hover:bg-white/[0.15] hover:text-white transition-all duration-300 font-orbitron tracking-widest text-[10px] uppercase font-black rounded-lg">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-center bg-green-600/80 border border-green-500/50 text-black shadow-lg hover:bg-green-500 transition-all duration-300 font-orbitron tracking-widest text-[10px] uppercase font-black rounded-lg">
                      <Link href="/registration" onClick={() => setIsMenuOpen(false)}>
                        Sign up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
