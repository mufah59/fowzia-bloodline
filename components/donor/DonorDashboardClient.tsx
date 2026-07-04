'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Droplets, Shield, Award, Clock, Star, PlusCircle,
  CheckCircle2, XCircle, AlertCircle, ArrowRight, Wallet,
} from 'lucide-react'
import { BLOOD_GROUP_LABELS, computeEligibility, formatDate } from '@/lib/utils'

interface Props { profile: any }

export default function DonorDashboardClient({ profile }: Props) {
  const { isEligible, daysUntilEligible, eligibleDate } = computeEligibility(
    profile.lastDonationDate ? new Date(profile.lastDonationDate) : null
  )

  const approvedRewards  = profile.rewardLedger.filter((r: any) => r.status === 'SENT').length
  const pendingDonations = profile.donationEvents.filter((e: any) => e.status === 'PENDING').length

  return (
    <main className="flex-1 bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="container-site">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">
                Welcome, {profile.user.name.split(' ')[0]}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Your donor dashboard, manage your profile and donations</p>
            </div>
            <Link href="/donor/donation-events/new" className="btn-primary">
              <PlusCircle className="h-4 w-4" /> Add Donation Event
            </Link>
          </div>
        </div>

        {/* Eligibility Banner */}
        <div className={`mb-6 rounded-xl p-5 flex items-center gap-4 ${
          isEligible
            ? 'bg-emerald-50 border border-emerald-200'
            : 'bg-amber-50 border border-amber-200'
        }`}>
          {isEligible
            ? <CheckCircle2 className="h-8 w-8 text-emerald-500 flex-shrink-0" />
            : <Clock className="h-8 w-8 text-amber-500 flex-shrink-0" />
          }
          <div>
            <p className={`font-semibold ${isEligible ? 'text-emerald-800' : 'text-amber-800'}`}>
              {isEligible
                ? 'You are eligible to donate blood!'
                : `Eligible to donate again in ${daysUntilEligible} days`
              }
            </p>
            <p className={`text-sm mt-0.5 ${isEligible ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isEligible
                ? 'You can accept donation requests right now. Stay active!'
                : eligibleDate ? `Next eligible date: ${formatDate(eligibleDate)}` : ''
              }
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Donations',
              value: profile.donationCount,
              icon:  Droplets,
              color: 'bg-blood-50 text-crimson',
            },
            {
              label: 'Blood Group',
              value: BLOOD_GROUP_LABELS[profile.bloodGroup] ?? profile.bloodGroup,
              icon:  Droplets,
              color: 'bg-blood-50 text-crimson',
            },
            {
              label: 'Reputation Score',
              value: `${profile.reputationScore} / 5`,
              icon:  Star,
              color: 'bg-gold-pale text-gold',
            },
            {
              label: 'Rewards Earned',
              value: approvedRewards,
              icon:  Award,
              color: 'bg-emerald-50 text-emerald-600',
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-display text-2xl font-bold text-ink">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donation Events */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold text-ink">Recent Donation Events</h2>
              <Link href="/donor/donation-events" className="text-sm text-crimson font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {pendingDonations > 0 && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {pendingDonations} donation event{pendingDonations > 1 ? 's' : ''} pending admin review
              </div>
            )}

            <div className="space-y-3">
              {profile.donationEvents.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Droplets className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No donation events yet.</p>
                  <Link href="/donor/donation-events/new" className="btn-primary mt-4 inline-flex text-sm">
                    <PlusCircle className="h-4 w-4" /> Log First Donation
                  </Link>
                </div>
              ) : profile.donationEvents.map((event: any) => (
                <DonationEventRow key={event.id} event={event} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Profile card */}
            <div className="card p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-crimson text-white font-bold text-lg">
                  {profile.user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-ink">{profile.user.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="badge-blood">{BLOOD_GROUP_LABELS[profile.bloodGroup]}</span>
                    {profile.isProfileVerified && (
                      <span className="badge-verified">
                        <Shield className="h-3 w-3 mr-1" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">District</span>
                  <span className="font-medium text-ink">{profile.district}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Area</span>
                  <span className="font-medium text-ink">{profile.area}</span>
                </div>
              </div>
            </div>

            {/* Rewards summary */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="h-5 w-5 text-gold" />
                <h3 className="font-display font-semibold text-ink">Reward History</h3>
              </div>
              {profile.rewardLedger.length === 0 ? (
                <p className="text-sm text-gray-400">No rewards yet. Log a donation to earn one!</p>
              ) : (
                <div className="space-y-2">
                  {profile.rewardLedger.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">৳ {parseFloat(r.amount).toFixed(0)}</span>
                      <span className={`badge-${r.status === 'SENT' ? 'eligible' : 'ineligible'}`}>
                        {r.status === 'SENT' ? 'Paid' : r.status === 'FAILED' ? 'Failed' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent feedback */}
            {profile.feedbackReceived.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-gold fill-gold-light" />
                  <h3 className="font-display font-semibold text-ink">Recent Feedback</h3>
                </div>
                <div className="space-y-3">
                  {profile.feedbackReceived.map((fb: any) => (
                    <div key={fb.id} className="border-t border-gray-100 pt-3 first:border-0 first:pt-0">
                      <div className="flex gap-0.5 mb-1">
                        {Array.from({ length: fb.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-gold-light text-gold-light" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 italic">"{fb.message.slice(0, 80)}{fb.message.length > 80 ? '...' : ''}"</p>
                      <p className="text-[10px] text-gray-400 mt-1">- {fb.recipient.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function DonationEventRow({ event }: { event: any }) {
  const statusConfig = {
    PENDING:  { color: 'badge-ineligible', icon: AlertCircle, label: 'Pending Review' },
    APPROVED: { color: 'badge-eligible',   icon: CheckCircle2, label: 'Approved'       },
    REJECTED: { color: 'text-blood-600 bg-blood-50 border-blood-200 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border',
                icon: XCircle, label: 'Rejected' },
  }

  const cfg = statusConfig[event.status as keyof typeof statusConfig] ?? statusConfig.PENDING

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink">{event.hospitalName}</p>
        <p className="text-xs text-gray-400 mt-0.5">{formatDate(event.donationDate)}</p>
      </div>
      <span className={cfg.color}>{cfg.label}</span>
    </div>
  )
}
