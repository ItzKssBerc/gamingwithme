"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Users as GamersIcon,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Trophy
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface User {
  id: string
  username: string
  avatar?: string | null
  country?: string | null
  rating?: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  nextPage: number | null
  prevPage: number | null
}

export default function GamersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [retryCount, setRetryCount] = useState(0);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: '12',
        });
        if (debouncedSearchQuery.trim()) {
            params.append('q', debouncedSearchQuery.trim());
        }

        try {
            const response = await fetch(`/api/gamers?${params.toString()}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data.gamers || []);
            setPagination(data.pagination);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message || 'An unexpected error occurred.');
            setUsers([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    };
    
    fetchUsers();
  }, [currentPage, debouncedSearchQuery, retryCount]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (pagination?.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Header */}
      <section className="py-6 bg-black/20">
        <div className="container mx-auto px-4 max-w-4xl">
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                <GamersIcon className="inline mr-3 h-8 w-8 text-green-400" />
                Gamers Directory
              </h1>
              <p className="text-lg text-gray-300 mb-2">
                Explore our community of gamers
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  10,000+ gamers registered
                </span>
                <span className="flex items-center gap-1">
                  <Search className="h-4 w-4" />
                  Real-time search
                </span>
                <span className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Filter by country
                </span>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="relative z-20 py-6 bg-gradient-to-r from-white/5 to-white/10 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col items-start justify-start gap-4 lg:gap-6" style={{minHeight: 'auto', width: '100%', justifyContent: 'center', padding: '1rem 0'}}>
            
            {/* First Row - Search Bar and Leaderboard button */}
            <div className="flex flex-col sm:flex-row items-center justify-start gap-4 lg:gap-6 w-full">
              {/* Search Input Group */}
              <div className="relative group flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative flex items-center w-full h-12 sm:h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-green-500/20 transition-all duration-300 group-hover:border-green-400/30 pr-2">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 ml-3 sm:ml-4 mr-2 sm:mr-3 group-hover:text-green-400 transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="Search gamers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base font-medium"
                  />
                </div>
              </div>

              {/* Leaderboard Button */}
              <Link href="/leaderboard" passHref>
                <Button variant="outline" className="h-12 sm:h-14 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-green-400/50 transition-all duration-300 flex items-center justify-center px-4 rounded-2xl shadow-lg">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="font-semibold">Leaderboard</span>
                </Button>
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* Gamers Grid */}
      <section className="relative z-0 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Error Loading Gamers</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <Button onClick={handleRetry} className="gaming-button">
                Try Again
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Gamers Found</h3>
              <p className="text-gray-400 mb-4 text-center">
                No gamers match your current search criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-12 gap-y-10">
                  {users.map((user) => (
                    <Link href={`/profile/${user.username}`} key={user.id} className="block group">
                      <Card className="relative h-[220px] w-[160px] p-0 mx-auto overflow-hidden border-4 border-green-400/40 bg-green-300/10 shadow-lg rounded-2xl">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-xl group-hover:scale-105 transition-all duration-300"
                            style={{ aspectRatio: '4/5' }}
                          />
                        ) : (
                          <div className="absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-700 to-slate-800 shadow-xl" style={{ aspectRatio: '4/5' }}>
                            <Users className="h-10 w-10 text-white" />
                          </div>
                        )}
                        {/* Név badge a kép alján, balra igazítva */}
                        <div className="absolute bottom-2 left-2 bg-green-500/90 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg border border-green-700 w-fit max-w-[80%] truncate z-10 text-left">
                          {user.username}
                        </div>
                        {/* Értékelés badge jobb felső sarokban */}
                        {typeof user.rating === 'number' && (
                          <div className="absolute top-2 right-2 z-10 bg-yellow-400/90 text-black text-xs font-bold px-2 py-1 rounded-full shadow border border-yellow-600 flex items-center gap-1">
                            {user.rating}
                          </div>
                        )}
                      </Card>
                    </Link>
                  ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    onClick={() => handlePageChange(pagination.prevPage!)}
                    disabled={!pagination.hasPrev}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                    <span className="text-white font-medium">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                  </div>
                  
                  <Button
                    onClick={() => handlePageChange(pagination.nextPage!)}
                    disabled={!pagination.hasNext}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
