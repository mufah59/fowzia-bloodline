'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, Droplets, ChevronDown, LogOut, LayoutDashboard, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser]         = useState<SupabaseUser | null>(null)
  const [open, setOpen]         = useState(false)
  const [userMenu, setUserMenu] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const role = user?.user_metadata?.role

  const dashboardPath =
    role === 'ADMIN'     ? '/admin' :
    role === 'DONOR'     ? '/donor/dashboard' :
    role === 'RECIPIENT' ? '/recipient/dashboard' : '/login'

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const displayName: string = user?.user_metadata?.name ?? user?.email ?? ''

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container-site flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-crimson shadow-sm group-hover:shadow-glow transition-shadow">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <div className="leading-none">
            <p className="font-display text-base font-bold text-ink">Fowzia Bloodline</p>
            <p className="text-[10px] font-medium text-gray-400 tracking-wider uppercase">by Autolinium</p>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/"         className="btn-ghost">Home</Link>
          <Link href="/search"   className="btn-ghost">Find Donors</Link>
          <Link href="/about"    className="btn-ghost">About</Link>
        </div>

        {/* Desktop auth */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu(v => !v)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-crimson text-[11px] font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{displayName}</span>
                <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', userMenu && 'rotate-180')} />
              </button>
              {userMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white shadow-hover animate-fade-in">
                  <Link href={dashboardPath} onClick={() => setUserMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link href="/profile" onClick={() => setUserMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                  <div className="border-t border-gray-100" />
                  <button onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-blood-600 hover:bg-blood-50 rounded-b-xl">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login"             className="btn-ghost text-sm">Sign In</Link>
              <Link href="/register/donor"    className="btn-primary text-sm">Become a Donor</Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setOpen(v => !v)} className="md:hidden btn-ghost p-2">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden animate-slide-up">
          <div className="flex flex-col gap-1">
            <Link href="/"        onClick={() => setOpen(false)} className="btn-ghost justify-start">Home</Link>
            <Link href="/search"  onClick={() => setOpen(false)} className="btn-ghost justify-start">Find Donors</Link>
            <Link href="/about"   onClick={() => setOpen(false)} className="btn-ghost justify-start">About</Link>
            <div className="border-t border-gray-100 my-2" />
            {user ? (
              <>
                <Link href={dashboardPath} onClick={() => setOpen(false)} className="btn-outline justify-start">Dashboard</Link>
                <button onClick={handleSignOut} className="btn-secondary justify-start">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login"          onClick={() => setOpen(false)} className="btn-outline">Sign In</Link>
                <Link href="/register/donor" onClick={() => setOpen(false)} className="btn-primary">Become a Donor</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
