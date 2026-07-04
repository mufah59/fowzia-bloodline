import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { computeEligibility } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const bloodGroup = searchParams.get('blood')   ?? undefined
  const district   = searchParams.get('district')  ?? undefined
  const eligible   = searchParams.get('eligible')
  const verified   = searchParams.get('verified')
  const page       = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit      = 12

  try {
    const where: Record<string, any> = {}
    if (bloodGroup) where.bloodGroup = bloodGroup
    if (district)   where.district   = { contains: district, mode: 'insensitive' }
    if (eligible === 'true')  where.isEligible        = true
    if (verified === 'true')  where.isProfileVerified = true

    const [profiles, total] = await Promise.all([
      db.donorProfile.findMany({
        where,
        select: {
          id:                true,
          bloodGroup:        true,
          district:          true,
          area:              true,
          lastDonationDate:  true,
          donationCount:     true,
          reputationScore:   true,
          isEligible:        true,
          isProfileVerified: true,
          profilePhoto:      true,
          user: { select: { name: true } },
          feedbackReceived: {
            where: { status: 'APPROVED' },
            select: { rating: true },
            take: 20,
          },
        },
        orderBy: [{ isEligible: 'desc' }, { reputationScore: 'desc' }],
        skip:  (page - 1) * limit,
        take:  limit,
      }),
      db.donorProfile.count({ where }),
    ])

    const donors = profiles.map(p => {
      const { isEligible, daysUntilEligible } = computeEligibility(p.lastDonationDate)
      const avgRating = p.feedbackReceived.length
        ? p.feedbackReceived.reduce((s, f) => s + f.rating, 0) / p.feedbackReceived.length
        : 0

      return {
        id:                p.id,
        name:              p.user.name,
        bloodGroup:        p.bloodGroup,
        district:          p.district,
        area:              p.area,
        donationCount:     p.donationCount,
        reputationScore:   Math.round(p.reputationScore * 10) / 10,
        avgRating:         Math.round(avgRating * 10) / 10,
        isEligible,
        daysUntilEligible,
        isProfileVerified: p.isProfileVerified,
        profilePhoto:      p.profilePhoto,
      }
    })

    return NextResponse.json({ donors, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[DONORS_GET]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
