import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = req.nextUrl.pathname

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
  }

  const role = user.user_metadata?.role

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
  }
  if (pathname.startsWith('/donor') && role !== 'DONOR') {
    return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
  }
  if (pathname.startsWith('/recipient') && role !== 'RECIPIENT') {
    return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/donor/:path*', '/recipient/:path*'],
}
