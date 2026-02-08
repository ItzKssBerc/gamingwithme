import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (id) {
      const s = await prisma.fixedService.findFirst({
        where: { id, providerId: user.id },
        include: { serviceSlots: true, weeklyServiceSlots: true, game: { select: { id: true, name: true, platform: true } }, platform: { select: { id: true, name: true } } }
      })
      if (!s) return NextResponse.json({ service: null })
      const single = {
        ...s,
        gameName: s.game?.name ?? null,
        gamePlatform: (s as any).game?.platform ?? null,
        platformName: s.platform?.name ?? null,
      }
      return NextResponse.json({ service: single })
    }

    const servicesRaw = await prisma.fixedService.findMany({
      where: { providerId: user.id },
      include: { serviceSlots: true, weeklyServiceSlots: true, game: { select: { id: true, name: true, platform: true } }, platform: { select: { id: true, name: true } } }
    })

    // map to a simpler shape including explicit platform/game strings
    const services = servicesRaw.map(s => ({
      ...s,
      gameName: s.game?.name ?? null,
      gamePlatform: (s as any).game?.platform ?? null,
      platformName: s.platform?.name ?? null,
    }))

    return NextResponse.json({ services })
  } catch (err) {
    console.error('GET /api/user/services error', err)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    let body: any
    try {
      body = await req.json()
    } catch (e) {
      console.error('POST /api/user/services - invalid JSON', e)
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { title, description, gameId, platform, price, slots, weeklySlots } = body || {}

    const errors: string[] = []
    if (!title || typeof title !== 'string') errors.push('title is required and must be a string')
    if (price === undefined || typeof price !== 'number' || Number.isNaN(price)) errors.push('price is required and must be a number')

    // validate slots if provided
    const validatedSlots: Array<{ date: string; time: string; capacity: number }> = []
    const validatedWeekly: Array<{ dayOfWeek: number; time: string; capacity: number }> = []
    if (slots !== undefined) {
      if (!Array.isArray(slots)) {
        errors.push('slots must be an array')
      } else {
        slots.forEach((s: any, idx: number) => {
          if (!s || typeof s !== 'object') {
            errors.push(`slots[${idx}] must be an object`)
            return
          }
          const { date, time, capacity } = s
          if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push(`slots[${idx}].date must be YYYY-MM-DD`)
          if (!time || typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time)) errors.push(`slots[${idx}].time must be HH:mm`)
          const capNum = Number(capacity ?? 1)
          if (!Number.isFinite(capNum) || capNum <= 0) errors.push(`slots[${idx}].capacity must be a positive number`)
          validatedSlots.push({ date, time, capacity: capNum })
        })
      }
    }

    // validate weeklySlots if provided
    if (weeklySlots !== undefined) {
      if (!Array.isArray(weeklySlots)) {
        errors.push('weeklySlots must be an array')
      } else {
        weeklySlots.forEach((s: any, idx: number) => {
          if (!s || typeof s !== 'object') { errors.push(`weeklySlots[${idx}] must be an object`); return }
          const dow = Number(s.dayOfWeek)
          const time = s.time
          const capNum = Number(s.capacity ?? 1)
          if (!Number.isFinite(dow) || dow < 0 || dow > 6) errors.push(`weeklySlots[${idx}].dayOfWeek must be 0-6`)
          if (!time || typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time)) errors.push(`weeklySlots[${idx}].time must be HH:mm`)
          if (!Number.isFinite(capNum) || capNum <= 0) errors.push(`weeklySlots[${idx}].capacity must be a positive number`)
          validatedWeekly.push({ dayOfWeek: dow, time, capacity: capNum })
        })
      }
    }

    if (errors.length > 0) {
      console.warn('POST /api/user/services validation failed', { userEmail: session.user.email, errors })
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 })
    }

    // Resolve platform -> platformId (FixedService expects platformId)
    let platformId: string | null = null
    if (platform) {
      console.log('POST /api/user/services - incoming platform value:', platform)
      try {
        // try by id first
        const byId = await prisma.platform.findUnique({ where: { id: String(platform) } })
        if (byId) {
          platformId = byId.id
          console.log('Resolved platform by id', platformId)
        } else {
          // fallback: lookup by name (case-insensitive)
          const byName = await prisma.platform.findFirst({ where: { name: { equals: String(platform), mode: 'insensitive' } } })
          if (byName) {
            platformId = byName.id
            console.log('Resolved platform by name', platformId)
          } else {
            // create a platform row for the provided name so it's persisted
            const slug = String(platform).toLowerCase().replace(/[^a-z0-9]+/g, '-')
            try {
              // schema requires igdbId Int @unique; generate a negative placeholder id to avoid collisions
              const placeholderIgdbId = -Math.floor(Date.now() / 1000)
              const createdPlat = await prisma.platform.create({ data: { name: String(platform), slug, igdbId: placeholderIgdbId } })
              platformId = createdPlat.id
              console.log('Created new Platform (placeholder igdbId)', { id: platformId, name: createdPlat.name, igdbId: placeholderIgdbId })
            } catch (createErr) {
              console.warn('Failed to create platform, continuing with null platformId', createErr)
            }
          }
        }
      } catch (platErr) {
        console.warn('Error resolving platform', platErr)
      }
    }

    // create service with validated slots
    let service
    try {
      service = await prisma.fixedService.create({
        data: {
          providerId: user.id,
          title: String(title),
          description: String(description || ''),
          price: Number(price) || 0,
          duration: 60,
          capacity: 1,
          gameId: gameId || null,
          platformId: platformId,
          serviceSlots: {
            create: validatedSlots
          },
          weeklyServiceSlots: {
            create: validatedWeekly
          }
        },
        include: { serviceSlots: true, platform: { select: { id: true, name: true } }, game: { select: { id: true, name: true, platform: true } } }
      })
    } catch (dbErr) {
      console.error('DB error creating FixedService', dbErr)
      const devDetail = process.env.NODE_ENV !== 'production' ? ((dbErr as any)?.message || String(dbErr)) : undefined
      return NextResponse.json({ error: 'Database error', detail: devDetail }, { status: 500 })
    }

    console.log('Created FixedService', { id: service.id, providerId: user.id, slotsCreated: service.serviceSlots.length })
    return NextResponse.json({ service }, { status: 201 })
  } catch (err) {
    console.error('POST /api/user/services error', err)
    const devDetail = process.env.NODE_ENV !== 'production' ? ((err as any)?.message || String(err)) : undefined
    return NextResponse.json({ error: 'Failed to create', detail: devDetail }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    let body: any
    try {
      body = await req.json()
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { id } = body || {}
    if (!id || typeof id !== 'string') return NextResponse.json({ error: 'id is required' }, { status: 400 })

    // ensure the service belongs to the requesting user
    const svc = await prisma.fixedService.findUnique({ where: { id } })
    if (!svc) return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    if (svc.providerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.fixedService.delete({ where: { id } })
    console.log('Deleted FixedService', { id, providerId: user.id })
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('DELETE /api/user/services error', err)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    let body: any
    try {
      body = await req.json()
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { id, isActive, slots, weeklySlots } = body || {}
    if (!id || typeof id !== 'string') return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const svc = await prisma.fixedService.findUnique({ where: { id }, include: { serviceSlots: true } })
    if (!svc) return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    if (svc.providerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Build update data
    const data: any = {}
    if (typeof isActive === 'boolean') data.isActive = isActive

    // Validate slots/weeklySlots if provided
    const validatedSlots: Array<{ date: string; time: string; capacity: number }> = []
    const validatedWeekly: Array<{ dayOfWeek: number; time: string; capacity: number }> = []

    if (slots !== undefined && Array.isArray(slots)) {
      slots.forEach((s: any) => {
        if (s && typeof s === 'object') {
          const capNum = Number(s.capacity ?? 1)
          if (s.date && s.time && Number.isFinite(capNum)) {
            validatedSlots.push({ date: s.date, time: s.time, capacity: capNum })
          }
        }
      })
    }

    if (weeklySlots !== undefined && Array.isArray(weeklySlots)) {
      weeklySlots.forEach((s: any) => {
        if (s && typeof s === 'object') {
          const dow = Number(s.dayOfWeek)
          const capNum = Number(s.capacity ?? 1)
          if (Number.isFinite(dow) && s.time && Number.isFinite(capNum)) {
            validatedWeekly.push({ dayOfWeek: dow, time: s.time, capacity: capNum })
          }
        }
      })
    }

    // If slots provided, we'll replace existing slots with provided list (simple approach)
    try {
      let result
      const hasSlotsUpdate = (Array.isArray(slots) || Array.isArray(weeklySlots))

      if (hasSlotsUpdate) {
        // performs transaction: delete old slots, create new
        result = await prisma.$transaction(async (tx) => {
          if (Array.isArray(slots)) {
            await tx.serviceSlot.deleteMany({ where: { serviceId: id } })
            if (validatedSlots.length > 0) {
              await tx.serviceSlot.createMany({ data: validatedSlots.map(s => ({ ...s, serviceId: id })) })
            }
          }

          if (Array.isArray(weeklySlots)) {
            await tx.weeklyServiceSlot.deleteMany({ where: { serviceId: id } })
            if (validatedWeekly.length > 0) {
              await tx.weeklyServiceSlot.createMany({ data: validatedWeekly.map(w => ({ ...w, serviceId: id })) })
            }
          }

          if (Object.keys(data).length > 0) {
            return tx.fixedService.update({ where: { id }, data: data, include: { serviceSlots: true } })
          }
          return tx.fixedService.findUnique({ where: { id }, include: { serviceSlots: true } })
        })
      } else {
        if (Object.keys(data).length > 0) {
          result = await prisma.fixedService.update({ where: { id }, data, include: { serviceSlots: true } })
        } else {
          return NextResponse.json({ ok: true }, { status: 200 })
        }
      }

      return NextResponse.json({ service: result }, { status: 200 })
    } catch (e) {
      console.error('PATCH /api/user/services error', e)
      return NextResponse.json({ error: 'Failed to update', detail: (e as any)?.message ?? String(e) }, { status: 500 })
    }
  } catch (err) {
    console.error('PATCH /api/user/services outer error', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
