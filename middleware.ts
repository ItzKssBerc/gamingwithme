import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  const path = request.nextUrl.pathname

  // If user is authenticated
  if (token) {
    // Prevent authenticated users from accessing login or registration
    if (path === '/login' || path === '/registration') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Skip onboarding check only for these essential paths
    const skipOnboardingPaths = [
      '/onboarding',
      '/api/user/onboarding',
      '/api/user/onboarding-status',
      '/api/auth',
      '/api/igdb',
      '/api/upload',
      '/logout'
    ]

    if (skipOnboardingPaths.some(skipPath => path.startsWith(skipPath))) {
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images).*)',
  ],
} 