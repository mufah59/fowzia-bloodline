import { redirect }         from 'next/navigation'
import { getCurrentUser }   from '@/lib/supabase-server'
import { db }               from '@/lib/db'
import Navbar                         from '@/components/Navbar'
import Footer                         from '@/components/Footer'
import Link                           from 'next/link'
import {
  Search, User, Phone, Clock, CheckCircle2, XCircle,
  Droplets, MapPin, Calendar,
} from 'lucide-react'
import { BLOOD_GROUP_LABELS, formatDate } from '@/lib/utils'

export const metadata = { title: 'My Dashboard — Fowzia Bloodline' }

export default async function RecipientDashboardPage() {
  const user = await getCurrentUser()
  if (!user || user.user_metadata?.role !== 'RECIPIENT') {
    redirect('/login?callbackUrl=/recipient/dashboard')
  }

  const profile = await db.recipientProfile.findUnique({
    where:   { userId: user.id },
    include: { user: { select: { name: true, email: true, createdAt: true } } },
  })
  if (!profile) redirect('/register/recipient')

  const contactRequests = await db.contactRequest.findMany({
    where:   { requestedById: user.id },
    include: {
      donorProfile: {
        include: { user: { select: { name: true, phone: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  const pendingCount  = contactRequests.filter(r => r.status === 'PENDING').length
  const approvedCount = contactRequests.filter(r => r.status === 'APPROVED').length

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface">
        <div className="container-site px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-ink">
              Welcome, {profile.user.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {profile.district}
              {profile.area && ` · ${profile.area}`}
            </p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-lg">
            <Link
              href="/search"
              className="card p-5 hover:shadow-hover transition-shadow flex items-center gap-4"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blood-50">
                <Search className="h-5 w-5 text-crimson" />
              </div>
              <div>
                <p className="font-semibold text-ink">Find Donors</p>
                <p className="text-xs text-gray-500 mt-0.5">Search by blood group & district</p>
              </div>
            </Link>

            <Link
              href="/profile"
              className="card p-5 hover:shadow-hover transition-shadow flex items-center gap-4"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-trust-pale">
                <User className="h-5 w-5 text-trust" />
              </div>
              <div>
                <p className="font-semibold text-ink">My Profile</p>
                <p className="text-xs text-gray-500 mt-0.5">View and update your details</p>
              </div>
            </Link>
          </div>

          {/* Stats */}
          {contactRequests.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg">
              <div className="card p-4 text-center">
                <p className="font-display text-2xl font-bold text-ink">{contactRequests.length}</p>
                <p className="text-xs text-gray-500 mt-1">Total Requests</p>
              </div>
              <div className="card p-4 text-center">
                <p className="font-display text-2xl font-bold text-emerald-600">{approvedCount}</p>
                <p className="text-xs text-gray-500 mt-1">Approved</p>
              </div>
              <div className="card p-4 text-center">
                <p className="font-display text-2xl font-bold text-amber-500">{pendingCount}</p>
                <p className="text-xs text-gray-500 mt-1">Pending</p>
              </div>
            </div>
          )}

          {/* Contact requests */}
          <div>
            <h2 className="font-display text-lg font-bold text-ink mb-4">My Contact Requests</h2>

            {contactRequests.length === 0 ? (
              <div className="card p-10 text-center">
                <Droplets className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                <p className="font-semibold text-gray-500">No contact requests yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Search for donors and request their contact details.
                </p>
                <Link href="/search" className="btn-primary mt-5 inline-flex">
                  <Search className="h-4 w-4" /> Find Donors
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {contactRequests.map(req => (
                  <div key={req.id} className="card p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blood-50 font-bold text-crimson text-xs">
                          {BLOOD_GROUP_LABELS[req.bloodGroup] ?? req.bloodGroup}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink text-sm truncate">
                            {req.donorProfile.user.name}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {req.donorProfile.district}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {req.status === 'APPROVED' && req.phoneRevealed ? (
                          <a
                            href={`tel:${req.donorProfile.user.phone}`}
                            className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:underline"
                          >
                            <Phone className="h-4 w-4" />
                            {req.donorProfile.user.phone}
                          </a>
                        ) : (
                          <StatusBadge status={req.status} />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 pl-[52px]">
                      {req.reason && (
                        <p className="text-xs text-gray-400 truncate flex-1">{req.reason}</p>
                      )}
                      <p className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                        <Calendar className="h-3 w-3" />
                        {formatDate(req.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
        <Clock className="h-3 w-3" /> Pending review
      </span>
    )
  }
  if (status === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
        <CheckCircle2 className="h-3 w-3" /> Approved
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
      <XCircle className="h-3 w-3" /> Rejected
    </span>
  )
}
