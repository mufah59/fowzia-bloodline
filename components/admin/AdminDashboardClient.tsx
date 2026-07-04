'use client'

import { useState } from 'react'
import {
  Users, Droplets, Award, AlertCircle, CheckCircle2, XCircle,
  Clock, Star, LayoutDashboard, Activity, Heart,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, formatDateTime } from '@/lib/utils'

interface Props { data: any }

type Tab = 'overview' | 'donations' | 'feedback' | 'rewards' | 'support'

export default function AdminDashboardClient({ data }: Props) {
  const [tab, setTab]                   = useState<Tab>('overview')
  const [donations, setDonations]       = useState<any[]>(data.pendingDonations)
  const [feedbackList, setFeedbackList] = useState<any[]>(data.pendingFeedback)
  const [platformDonations, setPlatformDonations] = useState<any[]>(data.pendingPlatformDonations)
  const [processing, setProcessing]     = useState<string | null>(null)

  async function reviewPlatformDonation(id: string, action: 'VERIFY' | 'HIDE') {
    setProcessing(id)
    try {
      const res = await fetch(`/api/platform-donations/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) { toast.error('Action failed.'); return }
      toast.success(action === 'VERIFY' ? 'Donation verified & published to Donor Wall!' : 'Donation hidden.')
      setPlatformDonations(prev => prev.filter(d => d.id !== id))
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setProcessing(null)
    }
  }

  async function reviewDonation(id: string, action: 'APPROVED' | 'REJECTED', notes?: string) {
    setProcessing(id)
    try {
      const res = await fetch(`/api/admin/donations/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNotes: notes }),
      })
      if (!res.ok) { toast.error('Review failed.'); return }
      toast.success(action === 'APPROVED' ? 'Donation approved & reward queued!' : 'Donation rejected.')
      setDonations(prev => prev.filter(d => d.id !== id))
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setProcessing(null)
    }
  }

  async function reviewFeedback(id: string, action: 'APPROVED' | 'REJECTED') {
    setProcessing(id)
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) { toast.error('Review failed.'); return }
      toast.success(action === 'APPROVED' ? 'Feedback approved!' : 'Feedback rejected.')
      setFeedbackList(prev => prev.filter(f => f.id !== id))
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setProcessing(null)
    }
  }

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'overview',  label: 'Overview'  },
    { id: 'donations', label: 'Blood Donations', badge: donations.length },
    { id: 'feedback',  label: 'Feedback',  badge: feedbackList.length },
    { id: 'rewards',   label: 'Rewards',   badge: data.pendingRewards },
    { id: 'support',   label: 'Support Donations', badge: platformDonations.length },
  ]

  return (
    <main className="flex-1 bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="container-site">
        {/* Header */}
        <div className="mb-7">
          <h1 className="font-display text-2xl font-bold text-ink">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Fowzia Bloodline — Management Dashboard</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-7 overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'border-crimson text-crimson'
                  : 'border-transparent text-gray-500 hover:text-ink'
              }`}
            >
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-crimson text-white text-[10px] font-bold px-1">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
              {[
                { label: 'Total Donors',     value: data.totalDonors,     icon: Users,    color: 'bg-blood-50 text-crimson'  },
                { label: 'Total Recipients', value: data.totalRecipients, icon: Users,    color: 'bg-trust-pale text-trust'  },
                { label: 'Pending Donations',value: donations.length,     icon: Droplets, color: 'bg-amber-50 text-amber-600'},
                { label: 'Pending Rewards',  value: data.pendingRewards,  icon: Award,    color: 'bg-gold-pale text-gold'    },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="card p-5">
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-display text-3xl font-bold text-ink">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink mb-5 flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-400" /> Recent Admin Actions
              </h2>
              <div className="space-y-3">
                {data.recentActions.length === 0 ? (
                  <p className="text-sm text-gray-400">No admin actions yet.</p>
                ) : data.recentActions.map((action: any) => (
                  <div key={action.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-ink">{action.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-400 mt-0.5">by {action.admin.name} • {action.targetType} {action.targetId.slice(-6)}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatDateTime(action.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DONATIONS */}
        {tab === 'donations' && (
          <div className="space-y-4">
            {donations.length === 0 ? (
              <div className="card p-10 text-center text-gray-400">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No pending donations to review.</p>
              </div>
            ) : donations.map((d: any) => (
              <DonationReviewCard
                key={d.id}
                donation={d}
                processing={processing === d.id}
                onApprove={(notes: string) => reviewDonation(d.id, 'APPROVED', notes)}
                onReject={(notes: string)  => reviewDonation(d.id, 'REJECTED', notes)}
              />
            ))}
          </div>
        )}

        {/* FEEDBACK */}
        {tab === 'feedback' && (
          <div className="space-y-4">
            {feedbackList.length === 0 ? (
              <div className="card p-10 text-center text-gray-400">
                <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No pending feedback to review.</p>
              </div>
            ) : feedbackList.map((fb: any) => (
              <FeedbackReviewCard
                key={fb.id}
                feedback={fb}
                processing={processing === fb.id}
                onApprove={() => reviewFeedback(fb.id, 'APPROVED')}
                onReject={()  => reviewFeedback(fb.id, 'REJECTED')}
              />
            ))}
          </div>
        )}

        {/* REWARDS */}
        {tab === 'rewards' && (
          <div className="card p-8 text-center text-gray-400">
            <Award className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-gray-600 mb-1">Reward Payout Queue</p>
            <p className="text-sm">{data.pendingRewards} reward{data.pendingRewards !== 1 ? 's' : ''} pending bKash payout.</p>
            <p className="text-xs mt-3 text-gray-400">Integrate bKash API to automate payouts, or manage manually from the rewards table.</p>
          </div>
        )}

        {/* SUPPORT DONATIONS */}
        {tab === 'support' && (
          <div>
            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Verified',  value: data.platformDonationStats.total,               color: 'text-emerald-600' },
                { label: 'Total Raised',    value: `৳ ${data.platformDonationStats.amount.toLocaleString()}`, color: 'text-crimson'    },
                { label: 'Coconuts Funded', value: data.platformDonationStats.coconuts,            color: 'text-gold'        },
              ].map(({ label, value, color }) => (
                <div key={label} className="card p-5 text-center">
                  <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <h3 className="font-display font-bold text-ink mb-4">
              Pending Verification ({platformDonations.length})
            </h3>

            {platformDonations.length === 0 ? (
              <div className="card p-10 text-center text-gray-400">
                <Heart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No pending support donations to verify.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {platformDonations.map((pd: any) => (
                  <PlatformDonationCard
                    key={pd.id}
                    donation={pd}
                    processing={processing === pd.id}
                    onVerify={() => reviewPlatformDonation(pd.id, 'VERIFY')}
                    onHide={()   => reviewPlatformDonation(pd.id, 'HIDE')}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

/* ──────────────────────────────────────────── Donation Review Card */
function DonationReviewCard({ donation, processing, onApprove, onReject }: any) {
  const [notes, setNotes] = useState('')
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-ink">{donation.donorProfile.user.name}</p>
            <span className="badge-ineligible">Pending</span>
          </div>
          <p className="text-sm text-gray-500">{donation.hospitalName}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Donation date: {formatDate(donation.donationDate)} • Submitted: {formatDate(donation.createdAt)}
          </p>
        </div>

        <a
          href={donation.proofImageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline text-xs px-3 py-2"
        >
          View Proof Document
        </a>
      </div>

      {donation.notes && (
        <div className="mb-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <strong>Notes:</strong> {donation.notes}
        </div>
      )}

      <div className="mb-4">
        <label className="label">Admin Notes (optional)</label>
        <input
          className="input"
          placeholder="Reason for rejection, or any notes..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onApprove(notes)}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
        >
          {processing ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <CheckCircle2 className="h-4 w-4" />}
          Approve & Queue Reward
        </button>
        <button
          onClick={() => onReject(notes)}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blood-50 border border-blood-200 px-4 py-3 text-sm font-semibold text-crimson hover:bg-blood-100 disabled:opacity-50 transition-colors"
        >
          <XCircle className="h-4 w-4" /> Reject
        </button>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────── Platform Donation Card */
function PlatformDonationCard({ donation, processing, onVerify, onHide }: any) {
  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-semibold text-ink text-lg">{donation.name}</p>
          {donation.profession && <p className="text-sm text-gray-500">{donation.profession}</p>}
          <p className="text-xs text-gray-400 mt-0.5">Submitted: {formatDate(donation.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold text-crimson">৳ {Number(donation.amount).toLocaleString()}</p>
          <p className="text-xs text-gray-400">{donation.coconutsCount} coconut reward{donation.coconutsCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">bKash Number</p>
          <p className="font-mono font-semibold text-ink">{donation.bkashNumber}</p>
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Transaction Ref</p>
          <p className="font-mono font-semibold text-ink">{donation.txReference ?? '—'}</p>
        </div>
      </div>

      {donation.message && (
        <div className="mb-4 rounded-lg bg-gold-pale border border-amber-200 px-4 py-3 text-sm text-amber-900 italic">
          "{donation.message}"
        </div>
      )}

      <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-700 mb-4">
        <strong>To verify:</strong> Open your bKash app, check incoming transfers from <strong>{donation.bkashNumber}</strong> for ৳{Number(donation.amount)} with reference "Bloodline". If confirmed, click Verify.
      </div>

      <div className="flex gap-3">
        <button
          onClick={onVerify}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
        >
          {processing ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <CheckCircle2 className="h-4 w-4" />}
          Verify & Publish to Donor Wall
        </button>
        <button
          onClick={onHide}
          disabled={processing}
          className="px-4 py-3 rounded-xl bg-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          <XCircle className="h-4 w-4 inline mr-1.5" />Hide
        </button>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────── Feedback Review Card */
function FeedbackReviewCard({ feedback, processing, onApprove, onReject }: any) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-semibold text-ink">{feedback.donorProfile.user.name}</p>
          <p className="text-xs text-gray-400">Reviewed by {feedback.recipient.name} • {formatDate(feedback.createdAt)}</p>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: feedback.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-gold-light text-gold-light" />
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-600 italic mb-5">"{feedback.message}"</p>

      <div className="flex gap-3">
        <button
          onClick={onApprove}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
        >
          {processing ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <CheckCircle2 className="h-4 w-4" />}
          Approve
        </button>
        <button
          onClick={onReject}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blood-50 border border-blood-200 px-4 py-2.5 text-sm font-semibold text-crimson hover:bg-blood-100 disabled:opacity-50 transition-colors"
        >
          <XCircle className="h-4 w-4" /> Reject
        </button>
      </div>
    </div>
  )
}
