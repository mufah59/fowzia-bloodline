import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { addDays, differenceInDays, isPast, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const BLOOD_GROUP_LABELS: Record<string, string> = {
  A_POS: 'A+', A_NEG: 'A−',
  B_POS: 'B+', B_NEG: 'B−',
  AB_POS: 'AB+', AB_NEG: 'AB−',
  O_POS: 'O+', O_NEG: 'O−',
}

export const BLOOD_GROUPS = Object.keys(BLOOD_GROUP_LABELS)

export const DISTRICTS = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal',
  'Sylhet', 'Rangpur', 'Mymensingh', 'Comilla', 'Gazipur',
  'Narayanganj', 'Tangail', 'Jessore', 'Bogra', 'Dinajpur',
  'Faridpur', 'Cox\'s Bazar', 'Noakhali', 'Brahmanbaria', 'Pabna',
]

export const DONATION_COOLDOWN_DAYS = 90

export function computeEligibility(lastDonationDate: Date | null): {
  isEligible: boolean
  daysUntilEligible: number
  eligibleDate: Date | null
} {
  if (!lastDonationDate) return { isEligible: true, daysUntilEligible: 0, eligibleDate: null }

  const eligibleDate    = addDays(lastDonationDate, DONATION_COOLDOWN_DAYS)
  const isEligible      = isPast(eligibleDate)
  const daysUntilEligible = isEligible ? 0 : differenceInDays(eligibleDate, new Date())

  return { isEligible, daysUntilEligible, eligibleDate }
}

export function formatDate(date: Date | string) {
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), 'dd MMM yyyy, hh:mm a')
}

export function maskPhone(phone: string) {
  if (phone.length < 7) return '***'
  return phone.slice(0, 3) + '****' + phone.slice(-3)
}

export function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
