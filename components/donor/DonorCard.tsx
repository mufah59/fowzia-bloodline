import { Shield, Star, Phone, Clock, MapPin, Droplets } from 'lucide-react'
import { BLOOD_GROUP_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

interface Props {
  donor:     any
  user:      User | null
  onContact: () => void
}

export default function DonorCard({ donor, user, onContact }: Props) {
  const stars = Array.from({ length: 5 })
  const role  = user?.user_metadata?.role

  return (
    <div className="card-hover p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative flex-shrink-0">
          {donor.profilePhoto ? (
            <img src={donor.profilePhoto} alt="" className="h-12 w-12 rounded-xl object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blood-50 text-crimson font-bold text-lg">
              {donor.name.charAt(0)}
            </div>
          )}
          <div className="absolute -bottom-1.5 -right-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-crimson text-white text-[10px] font-bold px-1.5">
            {BLOOD_GROUP_LABELS[donor.bloodGroup] ?? donor.bloodGroup}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display font-semibold text-ink truncate">{donor.name}</h3>
            {donor.isProfileVerified && (
              <Shield className="h-3.5 w-3.5 text-trust flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{donor.area}, {donor.district}</span>
          </div>
        </div>
      </div>

      {/* Eligibility */}
      <div className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium mb-4',
        donor.isEligible
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      )}>
        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
        {donor.isEligible
          ? 'Eligible to donate now'
          : `Eligible in ${donor.daysUntilEligible} days`
        }
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-5">
        <div className="flex items-center gap-1">
          <Droplets className="h-3.5 w-3.5 text-crimson" />
          <span><strong className="text-ink">{donor.donationCount}</strong> donations</span>
        </div>
        <div className="flex items-center gap-0.5">
          {stars.map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-3 w-3',
                i < Math.round(donor.avgRating)
                  ? 'fill-gold-light text-gold-light'
                  : 'text-gray-200 fill-gray-200'
              )}
            />
          ))}
          <span className="ml-1 text-gray-400">{donor.avgRating > 0 ? donor.avgRating.toFixed(1) : '—'}</span>
        </div>
      </div>

      {/* Contact button */}
      <div className="mt-auto">
        {!user ? (
          <a href="/login" className="btn-outline w-full text-sm text-center">
            Sign in to contact
          </a>
        ) : role === 'RECIPIENT' ? (
          <button
            onClick={onContact}
            disabled={!donor.isEligible}
            className={cn(
              'w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
              donor.isEligible
                ? 'btn-primary'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <Phone className="h-4 w-4 inline mr-2" />
            {donor.isEligible ? 'Request Contact' : 'Not Eligible Yet'}
          </button>
        ) : (
          <div className="rounded-lg bg-gray-50 px-4 py-3 text-center text-xs text-gray-400">
            Only recipients can contact donors
          </div>
        )}
      </div>
    </div>
  )
}
