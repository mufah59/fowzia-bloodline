'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, SlidersHorizontal, Droplets, UserPlus } from 'lucide-react'
import Link from 'next/link'
import DonorCard from '@/components/donor/DonorCard'
import ContactModal from '@/components/donor/ContactModal'
import { BLOOD_GROUP_LABELS, DISTRICTS } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

export default function SearchClient() {
  const [user,     setUser]     = useState<User | null>(null)
  const [filters,  setFilters]  = useState({ blood: '', district: '', eligible: false, verified: false })
  const [donors,   setDonors]   = useState<any[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchDonors = useCallback(async (pg = 1) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.blood)    params.set('blood',    filters.blood)
    if (filters.district) params.set('district', filters.district)
    if (filters.eligible) params.set('eligible', 'true')
    if (filters.verified) params.set('verified', 'true')
    params.set('page', String(pg))

    const res  = await fetch(`/api/donors?${params}`)
    const data = await res.json()
    setDonors(data.donors ?? [])
    setTotal(data.total  ?? 0)
    setPages(data.pages  ?? 1)
    setPage(pg)
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchDonors(1) }, []) // eslint-disable-line

  return (
    <main className="flex-1 bg-surface">
      {/* Search bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container-site px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-display text-2xl font-bold text-ink mb-5">Find Blood Donors</h1>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="label">Blood Group</label>
              <select className="input" value={filters.blood} onChange={e => setFilters(f => ({ ...f, blood: e.target.value }))}>
                <option value="">Any Blood Group</option>
                {Object.entries(BLOOD_GROUP_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">District</label>
              <select className="input" value={filters.district} onChange={e => setFilters(f => ({ ...f, district: e.target.value }))}>
                <option value="">All Districts</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex flex-col justify-end gap-2 sm:col-span-2">
              <div className="flex gap-2 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={filters.eligible}
                    onChange={e => setFilters(f => ({ ...f, eligible: e.target.checked }))}
                    className="rounded border-gray-300 text-crimson"
                  />
                  <span>Eligible only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={e => setFilters(f => ({ ...f, verified: e.target.checked }))}
                    className="rounded border-gray-300 text-crimson"
                  />
                  <span>Verified only</span>
                </label>
              </div>
              <button onClick={() => fetchDonors(1)} className="btn-primary w-full sm:w-auto">
                <Search className="h-4 w-4" /> Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Register as recipient CTA — shown to guests only */}
      {!user && (
        <div className="border-b border-blue-100 bg-trust-pale/60">
          <div className="container-site px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-trust font-medium">
              Found a donor? Register as a recipient to request their contact details.
            </p>
            <Link
              href="/register/recipient"
              className="inline-flex items-center gap-2 rounded-lg bg-trust px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity flex-shrink-0"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Register as Recipient
            </Link>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="container-site px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {loading ? 'Searching...' : `${total} donor${total !== 1 ? 's' : ''} found`}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <SlidersHorizontal className="h-4 w-4" />
            Results sorted by eligibility & reputation
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-8 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Droplets className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-500">No donors found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {donors.map(donor => (
                <DonorCard
                  key={donor.id}
                  donor={donor}
                  user={user}
                  onContact={() => setSelected(donor)}
                />
              ))}
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => fetchDonors(page - 1)}
                  disabled={page <= 1}
                  className="btn-outline px-4 py-2 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page} of {pages}</span>
                <button
                  onClick={() => fetchDonors(page + 1)}
                  disabled={page >= pages}
                  className="btn-outline px-4 py-2 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <ContactModal donor={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  )
}
