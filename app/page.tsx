import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getCurrentUser } from '@/lib/supabase-server'
import { db } from '@/lib/db'
import {
  Droplets, Search, Shield, Award, Heart, ArrowRight,
  CheckCircle2, Clock, Users, Activity, Star, ChevronRight,
  MessageSquare,
} from 'lucide-react'

export default async function HomePage() {
  const user = await getCurrentUser()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  let stats = { donors: 0, donationsThisMonth: 0, districts: 0, livesImpacted: 0 }
  try {
    const [donorCount, donationsThisMonth, districtList, livesImpacted] = await Promise.all([
      db.donorProfile.count(),
      db.donationEvent.count({ where: { status: 'APPROVED', donationDate: { gte: startOfMonth } } }),
      db.donorProfile.groupBy({ by: ['district'] }),
      db.donationEvent.count({ where: { status: 'APPROVED' } }),
    ])
    stats = { donors: donorCount, donationsThisMonth, districts: districtList.length, livesImpacted }
  } catch {
    // keep zero defaults if DB unavailable
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar stats={stats} />
        <SearchSection />
        <HowItWorks />
        <WhySection />
        <DonorBenefits />
        {user && <SupportSection />}
        <ThoughtsCTASection />
        <CtaSection donorCount={stats.donors} />
      </main>
      <Footer />
    </div>
  )
}

/* ------------------------------------------------------------------ HERO */
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-hero text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
      </div>

      <div className="container-site relative px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 mb-7 backdrop-blur-sm">
            <Heart className="h-3.5 w-3.5 fill-white" />
            <span>In honour of Fowzia, a mother, a beacon of love</span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Every Drop Counts.<br />
            <span className="text-white/80">Every Life Matters.</span>
          </h1>

          <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-xl mx-auto">
            Connect with verified blood donors in your area. Fast, trusted, and built for moments when every second counts.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register/donor"
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-bold text-crimson shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
              <Droplets className="h-5 w-5" />
              Become a Donor
            </Link>
            <Link
              href="/search"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-7 py-4 text-base font-bold text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/60 transition-all duration-200"
            >
              <Search className="h-5 w-5" />
              Find Blood Now
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/60">
            {[
              'Verified Donors',
              'Privacy Protected',
              'Admin Moderated',
              'Free to Use',
            ].map(t => <span key={t}>{t}</span>)}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" className="w-full" fill="none">
          <path d="M0 60L1440 60L1440 20C1200 60 720 0 480 20C240 40 0 20 0 20L0 60Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ STATS */
function StatsBar({ stats }: { stats: { donors: number; donationsThisMonth: number; districts: number; livesImpacted: number } }) {
  const items = [
    { label: 'Registered Donors',    value: stats.donors.toLocaleString(),            icon: Users    },
    { label: 'Donations This Month', value: stats.donationsThisMonth.toLocaleString(), icon: Droplets },
    { label: 'Districts Covered',    value: stats.districts.toLocaleString(),          icon: Activity },
    { label: 'Lives Impacted',       value: stats.livesImpacted.toLocaleString(),      icon: Heart    },
  ]

  return (
    <div className="bg-white border-y border-gray-100 shadow-sm">
      <div className="container-site px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
          {items.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blood-50">
                <Icon className="h-5 w-5 text-crimson" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-ink">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ QUICK SEARCH */
function SearchSection() {
  return (
    <section className="section bg-surface">
      <div className="container-site">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h2 className="section-title">Find Blood Right Now</h2>
          <p className="section-subtitle">Search our network of verified donors by blood group and location.</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="card p-6 shadow-hover">
            <form action="/search" method="GET">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label">Blood Group</label>
                  <select name="blood" className="input">
                    <option value="">Any</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">District</label>
                  <select name="district" className="input">
                    <option value="">All Districts</option>
                    {['Dhaka','Chittagong','Rajshahi','Sylhet','Khulna','Barisal','Rangpur','Mymensingh'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <button type="submit" className="btn-primary w-full">
                    <Search className="h-4 w-4" /> Search Donors
                  </button>
                </div>
              </div>
            </form>
          </div>
          <p className="text-center text-sm text-gray-400 mt-4">
            No account required to search.{' '}
            <Link href="/register/recipient" className="text-crimson font-medium hover:underline">
              Register to contact donors.
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ HOW IT WORKS */
function HowItWorks() {
  const steps = [
    {
      number: '01',
      title:  'Create Your Account',
      body:   'Register as a donor or recipient in under 2 minutes. Verify your phone number and complete your profile.',
      icon:   Users,
      color:  'bg-trust-pale text-trust',
    },
    {
      number: '02',
      title:  'Find or Donate Blood',
      body:   'Recipients search verified donors by blood group and location. Donors log events with proof for verification.',
      icon:   Droplets,
      color:  'bg-blood-50 text-crimson',
    },
    {
      number: '03',
      title:  'Save a Life',
      body:   'A real person gets the blood they need. Donors earn a small appreciation reward and build their reputation.',
      icon:   Heart,
      color:  'bg-emerald-50 text-emerald-600',
    },
  ]

  return (
    <section id="how-it-works" className="section bg-white">
      <div className="container-site">
        <div className="text-center mb-12">
          <h2 className="section-title">How Fowzia Bloodline Works</h2>
          <p className="section-subtitle">Simple steps that connect lives</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative card-hover p-8 text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-crimson text-xs font-bold text-white shadow-sm">
                {step.number}
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-4 z-10">
                  <ChevronRight className="h-6 w-6 text-gray-200" />
                </div>
              )}
              <div className={`mx-auto mb-5 mt-2 flex h-16 w-16 items-center justify-center rounded-2xl ${step.color}`}>
                <step.icon className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold text-ink mb-3">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ WHY */
function WhySection() {
  return (
    <section className="section bg-surface">
      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blood-50 px-4 py-1.5 text-xs font-semibold text-crimson mb-5">
              <Heart className="h-3.5 w-3.5 fill-crimson" /> Our Story
            </div>
            <h2 className="section-title mb-5">
              Born from Love.<br />
              <span className="text-gradient">Built for Life.</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Fowzia Bloodline is dedicated to a mother, a woman whose warmth and care continues to touch everyone around her. This platform carries her name forward in one of the most powerful ways possible: by helping save lives.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              In Bangladesh, finding compatible blood in an emergency is a race against time. We built this platform to make that search faster, safer, and more trustworthy, connecting verified donors with families who need them most.
            </p>
            <div className="space-y-3">
              {[
                'No middlemen, direct donor-to-family connection',
                'Admin-verified donors you can trust',
                'Privacy-first, phone numbers protected',
                'Free for everyone, always',
              ].map(pt => (
                <div key={pt} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Verified Donors',   sub: 'ID-checked profiles',      icon: Shield,   bg: 'bg-trust-pale', ic: 'text-trust'       },
              { label: 'Quick Contact',      sub: 'Connect in minutes',       icon: Activity, bg: 'bg-blood-50',   ic: 'text-crimson'     },
              { label: 'Reward Program',     sub: 'Appreciation for donors',  icon: Award,    bg: 'bg-gold-pale',  ic: 'text-gold'        },
              { label: 'Reputation System', sub: 'Community trust scores',   icon: Star,     bg: 'bg-emerald-50', ic: 'text-emerald-600' },
            ].map(({ label, sub, icon: Icon, bg, ic }) => (
              <div key={label} className="card-hover p-6">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-6 w-6 ${ic}`} />
                </div>
                <h4 className="font-display font-semibold text-ink text-sm mb-1">{label}</h4>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ DONOR BENEFITS */
function DonorBenefits() {
  return (
    <section className="section bg-white">
      <div className="container-site">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="section-title">Why Donate Through Fowzia Bloodline?</h2>
          <p className="section-subtitle">
            Beyond saving a life, we celebrate and reward every verified donor.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Award,
              color: 'text-gold bg-gold-pale',
              title: 'Coconut Reward',
              body: 'Every verified donation earns you a small appreciation reward sent directly to your bKash, the cost of one coconut, as a warm thank-you from the community.',
            },
            {
              icon: Star,
              color: 'text-trust bg-trust-pale',
              title: 'Reputation Score',
              body: 'Build your reputation through successful donations and positive feedback from recipient families. High-reputation donors are shown first in search results.',
            },
            {
              icon: Shield,
              color: 'text-emerald-600 bg-emerald-50',
              title: 'Verified Badge',
              body: 'Complete your profile and earn the Verified badge. It signals to recipients that your information has been checked and you are trustworthy.',
            },
            {
              icon: Users,
              color: 'text-crimson bg-blood-50',
              title: 'Community Impact',
              body: 'See the real number of lives you have helped. Every approved donation adds to your impact counter, a lasting record of your generosity.',
            },
            {
              icon: Clock,
              color: 'text-purple-600 bg-purple-50',
              title: 'Eligibility Tracker',
              body: 'Your dashboard automatically tracks when you can donate next. No guessing, a clear countdown so you are always ready when someone needs you.',
            },
            {
              icon: Heart,
              color: 'text-rose-600 bg-rose-50',
              title: 'Heartfelt Feedback',
              body: 'Receive written thank-you messages from the families you helped. These are moderated and displayed on your profile, a legacy of kindness.',
            },
          ].map(({ icon: Icon, color, title, body }) => (
            <div key={title} className="card-hover p-6">
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-ink mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ SUPPORT / DONATE (logged-in only) */
function SupportSection() {
  return (
    <section className="section bg-surface">
      <div className="container-site">
        <div className="rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-hover">
          {/* Left */}
          <div className="bg-hero p-10 text-white">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Heart className="h-6 w-6 fill-white text-white" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Keep This Platform Alive</h2>
                <p className="text-white/60 text-xs mt-0.5">Only visible to registered members</p>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed mb-4">
              Fowzia Bloodline is free for every donor and recipient. To keep it running and to fund the coconut reward
              (<strong className="text-white">ডাব, Daab</strong>) we give to every verified blood donor, we need your support.
            </p>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Minimum donation: <strong className="text-white">tk 120</strong>, the current cost of one Daab (ডাব). Each tk 120 you give means one blood donor receives a heartfelt thank-you reward.
            </p>
            <div className="rounded-xl bg-white/10 border border-white/20 p-4 mb-6">
              <p className="text-xs text-white/60 uppercase tracking-wider mb-1 font-semibold">bKash Send Money</p>
              <p className="font-display text-2xl font-bold tracking-wide">+8801533633084</p>
              <p className="text-xs text-white/60 mt-1">Reference: <strong className="text-white">Bloodline</strong></p>
            </div>
            <div className="flex gap-3">
              <Link href="/donate" className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-crimson hover:shadow-lg transition-all">
                <Heart className="h-4 w-4" /> Donate Now
              </Link>
              <Link href="/donors-wall" className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all">
                View Donor Wall
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="bg-[#2D0401] p-10 text-white flex flex-col">
            <div className="flex items-start gap-5 mb-6">
              <div className="flex-shrink-0">
                <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-2 border-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/green-coconut.jpg"
                    alt="Green coconut (ডাব / Daab)"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold mb-1">100% Transparent</h3>
                <p className="text-white/60 text-sm leading-relaxed">Every donation is publicly recorded. No hidden names. No hidden numbers.</p>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              {[
                { icon: Users,  text: 'Every donor listed on the public Donor Wall'   },
                { icon: Heart,  text: 'Name, profession and amount shown for all to see' },
                { icon: Award,  text: 'Funds go directly to Daab (দাব) rewards for donors'  },
                { icon: Shield, text: 'Admin verifies each donation before publishing'   },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-4 w-4 text-crimson" />
                  </div>
                  <span className="text-white/80">{text}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/60 mt-auto">
              <p className="font-semibold text-white mb-1">How to donate:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Send money to <span className="font-mono text-white">+8801533633084</span> via bKash (Send Money, not Payment)</li>
                <li>Write <strong className="text-white">"Bloodline"</strong> in the reference field</li>
                <li>Register on the <Link href="/donate" className="text-crimson underline">Donate page</Link> with your name and bKash number</li>
                <li>Admin verifies and your name appears on the Donor Wall</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ THOUGHTS CTA */
function ThoughtsCTASection() {
  return (
    <section className="section bg-white">
      <div className="container-site">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blood-50">
            <MessageSquare className="h-7 w-7 text-crimson" />
          </div>
          <h2 className="section-title mb-3">What Do People Think?</h2>
          <p className="section-subtitle mb-8">
            Real thoughts from real people, donors, recipients, and well-wishers who believe in this platform.
          </p>
          <Link
            href="/thoughts"
            className="inline-flex items-center gap-3 rounded-2xl bg-crimson px-8 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            <MessageSquare className="h-5 w-5" />
            Add your thought about this platform
          </Link>
          <p className="mt-4 text-sm text-gray-400">All thoughts are reviewed before appearing publicly.</p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ CTA */
function CtaSection({ donorCount }: { donorCount: number }) {
  const donorLine = donorCount > 0
    ? `Join ${donorCount.toLocaleString()}+ verified donors. Your blood could save a life today.`
    : 'Be one of the first verified donors. Your blood could save a life today.'

  return (
    <section className="section bg-surface">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-hero p-10 text-white">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-black/10" />
            <div className="relative">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">Ready to Donate?</h3>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">{donorLine}</p>
              <Link href="/register/donor" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-crimson hover:shadow-lg transition-all">
                Register as Donor <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-trust p-10 text-white">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-black/10" />
            <div className="relative">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">Need Blood Urgently?</h3>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Search verified donors in your district right now. Fast and free.
              </p>
              <Link href="/search" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-trust hover:shadow-lg transition-all">
                Find Donors Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
