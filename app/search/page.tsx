import Navbar  from '@/components/Navbar'
import Footer  from '@/components/Footer'
import SearchClient from '@/components/SearchClient'

export const metadata = { title: 'Find Blood Donors' }

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <SearchClient />
      <Footer />
    </div>
  )
}
