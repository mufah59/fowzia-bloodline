import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  name:       z.string().min(2).max(100),
  profession: z.string().min(2).max(100),
  location:   z.string().min(2).max(100),
  comment:    z.string().min(10).max(1000),
})

export async function GET() {
  const thoughts = await db.platformThought.findMany({
    where:   { isApproved: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(thoughts)
}

export async function POST(req: Request) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input. Please fill all fields correctly.' }, { status: 400 })
    }
    await db.platformThought.create({ data: parsed.data })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[thoughts]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
