import Link from 'next/link'
import Image from 'next/image'
import { Droplets, Heart, ExternalLink, Mail, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="container-site px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-crimson">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-base leading-none">Fowzia Bloodline</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Trusted Donor Network</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Built in loving memory of Fowzia, a platform that carries her spirit of care and community.
            </p>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-500">
              <Heart className="h-3.5 w-3.5 text-crimson fill-crimson" />
              <span>Every drop is a gift of life</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['Find Donors',        '/search'],
                ['Become a Donor',     '/register/donor'],
                ['Recipient Register', '/register/recipient'],
                ['How It Works',       '/about#how-it-works'],
                ['Donor Dashboard',    '/donor/dashboard'],
                ['Support Us',         '/donate'],
                ['Donor Wall',         '/donors-wall'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['About Us',       '/about'],
                ['Contact',        '/contact'],
                ['Privacy Policy', '/privacy'],
                ['Terms of Use',   '/terms'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:minhaz@autolinium.com"
                  className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 text-crimson flex-shrink-0" />
                  minhaz@autolinium.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/mufah.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors"
                >
                  <Facebook className="h-4 w-4 text-[#1877F2] flex-shrink-0" />
                  facebook.com/mufah.me
                </a>
              </li>
              <li>
                <Link href="/about" className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors text-xs mt-1">
                  <span className="text-gray-600">Meet the founder</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="my-10 border-t border-white/10" />

        {/* Autolinium Promo Card */}
        <a
          href="https://autolinium.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 hover:border-white/20 transition-all duration-200 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-crimson/10 to-trust/10 opacity-50" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Logo */}
              <div className="flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden bg-white p-1.5 shadow-sm">
                <Image
                  src="/images/autolinium-logo.jpeg"
                  alt="Autolinium"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-1">Autolinium</h3>
                <p className="text-base font-medium text-gray-200">
                  Building the backbone of Modern Businesses
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Home of AI Automation and AI based Softwares
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white group-hover:bg-white/20 transition-all duration-200">
              Visit autolinium.com
              <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </a>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Fowzia Bloodline. All rights reserved.</p>
          <p>Developed with care by <span className="text-crimson font-medium">Autolinium</span></p>
        </div>
      </div>
    </footer>
  )
}
