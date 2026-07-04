import Navbar  from '@/components/Navbar'
import Footer  from '@/components/Footer'
import Link    from 'next/link'
import { db } from '@/lib/db'
import { Heart, Award, Users, Star } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Donor Wall — Fowzia Bloodline',
  description: 'Public transparency wall showing everyone who has financially supported Fowzia Bloodline. Every name here helped fund a coconut reward for a blood donor.',
}

export default async function DonorWallPage() {
  const [donations, stats] = await Promise.all([
    db.platformDonation.findMany({
      where:   { isVerified: true, isPublic: true },
      orderBy: { amount: 'desc' },
      select:  { id: true, name: true, profession: true, amount: true, coconutsCount: true, message: true, createdAt: true },
    }),
    db.platformDonation.aggregate({
      where:  { isVerified: true },
      _sum:   { amount: true, coconutsCount: true },
      _count: { id: true },
    }),
  ])

  const totalAmount    = Number(stats._sum.amount    ?? 0)
  const totalCoconuts  = Number(stats._sum.coconutsCount ?? 0)
  const totalSupporters = stats._count.id

  // Rank donors by amount for badges
  const sorted    = [...donations].sort((a, b) => Number(b.amount) - Number(a.amount))
  const topAmount = sorted[0] ? Number(sorted[0].amount) : 0

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-hero text-white py-16">
          <div className="container-site px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <Heart className="h-7 w-7 fill-white text-white" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-4">Wall of Supporters</h1>
            <p className="text-lg text-white/80 leading-relaxed">
              These generous people have supported Fowzia Bloodline financially. Every donation funds the <strong className="text-white">coconut reward (DaaB)</strong> we send to verified blood donors.
            </p>
            <p className="text-sm text-white/60 mt-3">100% transparent. Every contribution listed. No hidden names.</p>
          </div>
        </section>

        {/* Stats */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-site px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {[
                { label: 'Total Supporters', value: totalSupporters,                     icon: Users },
                { label: 'Total Raised',      value: `৳ ${totalAmount.toLocaleString()}`, icon: Heart },
                { label: 'Coconuts Funded',   value: totalCoconuts,                      icon: Award },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 px-6 py-5">
                  <Icon className="h-6 w-6 text-crimson flex-shrink-0" />
                  <div>
                    <p className="font-display text-2xl font-bold text-ink">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="section bg-surface">
          <div className="container-site">
            {donations.length === 0 ? (
              <div className="text-center py-20">
                <Heart className="h-14 w-14 mx-auto text-gray-200 mb-4" />
                <p className="text-lg font-medium text-gray-500 mb-2">Be the first supporter</p>
                <p className="text-sm text-gray-400 mb-6">No verified donations yet — yours could be the first!</p>
                <Link href="/donate" className="btn-primary">Support This Platform</Link>
              </div>
            ) : (
              <>
                {/* Top donors podium */}
                {sorted.length >= 3 && (
                  <div className="mb-10">
                    <h2 className="font-display text-xl font-bold text-ink mb-6 text-center">Top Supporters</h2>
                    <div className="flex items-end justify-center gap-4">
                      {[sorted[1], sorted[0], sorted[2]].map((d, i) => {
                        if (!d) return null
                        const positions = [2, 1, 3]
                        const pos       = positions[i]
                        const heights   = ['h-28', 'h-36', 'h-24']
                        const colors    = ['bg-gray-100', 'bg-gold-pale border-2 border-gold', 'bg-blood-50 border border-blood-200']
                        return (
                          <div key={d.id} className="flex flex-col items-center gap-3">
                            <div className="text-center">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-crimson text-white font-bold text-lg mx-auto">
                                {d.name.charAt(0)}
                              </div>
                              <p className="text-sm font-semibold text-ink mt-2 max-w-[100px] text-center leading-tight">{d.name}</p>
                              <p className="text-xs font-bold text-crimson">৳{Number(d.amount).toLocaleString()}</p>
                            </div>
                            <div className={`w-24 rounded-t-xl flex items-center justify-center ${heights[i]} ${colors[i]}`}>
                              <span className="font-display text-2xl font-bold text-gray-500">#{pos}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Full list */}
                <h2 className="font-display text-xl font-bold text-ink mb-5">All {donations.length} Supporters</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {donations.map((d, idx) => {
                    const amount      = Number(d.amount)
                    const isTopDonor  = amount === topAmount && idx === 0
                    return (
                      <div key={d.id} className={`card-hover p-6 ${isTopDonor ? 'border-2 border-gold' : ''}`}>
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-blood-50 text-crimson font-bold text-lg">
                            {d.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-display font-semibold text-ink truncate">{d.name}</p>
                              {isTopDonor && <Star className="h-4 w-4 text-gold fill-gold-light flex-shrink-0" />}
                            </div>
                            {d.profession && <p className="text-xs text-gray-400">{d.profession}</p>}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-crimson">৳{amount.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400">{d.coconutsCount} 🥥</p>
                          </div>
                        </div>

                        {d.message && (
                          <p className="text-xs text-gray-500 italic leading-relaxed mb-3 border-t border-gray-100 pt-3">
                            "{d.message}"
                          </p>
                        )}

                        <p className="text-[10px] text-gray-400">{formatDate(d.createdAt)}</p>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* CTA */}
            <div className="mt-12 rounded-2xl bg-hero p-10 text-white text-center">
              <h3 className="font-display text-2xl font-bold mb-3">Add Your Name to This Wall</h3>
              <p className="text-white/80 mb-6 text-sm max-w-lg mx-auto">
                Join these supporters. Every ৳120 = one DaaB reward for a blood donor. Your name, forever on this wall.
              </p>
              <Link href="/donate" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-crimson hover:shadow-lg transition-all">
                <Heart className="h-4 w-4" /> Support Now
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
