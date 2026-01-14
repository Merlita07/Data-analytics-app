import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { value, category, source } = body

    // Enhanced validation
    if (!value || !category || !source) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: {
          value: !value ? 'Value is required' : null,
          category: !category ? 'Category is required' : null,
          source: !source ? 'Source is required' : null
        }
      }, { status: 400 })
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0) {
      return NextResponse.json({
        error: 'Invalid value',
        details: 'Value must be a positive number'
      }, { status: 400 })
    }

    if (numValue > 1000000) {
      return NextResponse.json({
        error: 'Value too large',
        details: 'Value cannot exceed 1,000,000'
      }, { status: 400 })
    }

    if (category.length > 100 || source.length > 100) {
      return NextResponse.json({
        error: 'Field too long',
        details: 'Category and source must be less than 100 characters'
      }, { status: 400 })
    }

    // Check for duplicate entries and create — handle missing DB gracefully
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const existingEntry = await prisma.dataEntry.findFirst({
        where: {
          value: numValue,
          category,
          source,
          timestamp: {
            gte: oneHourAgo
          }
        }
      })

      if (existingEntry) {
        return NextResponse.json({
          error: 'Duplicate entry',
          details: 'Similar entry exists within the last hour'
        }, { status: 409 })
      }

      const dataEntry = await prisma.dataEntry.create({
        data: {
          value: numValue,
          category: category.trim(),
          source: source.trim(),
        },
      })

      return NextResponse.json(dataEntry, { status: 201 })
    } catch (e: any) {
      const msg = (e && e.message) || ''
      if (msg.includes('DATABASE_URL') || e.name === 'PrismaClientInitializationError') {
        return NextResponse.json({
          error: 'DATABASE_URL not configured',
          details: 'Set DATABASE_URL in your environment (Vercel project settings) to enable writes.'
        }, { status: 503 })
      }
      throw e
    }
  } catch (error) {
    console.error('Error creating data entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const category = searchParams.get('category')
    const source = searchParams.get('source')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause for filtering
    const where: any = {}
    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }
    if (category) where.category = category
    if (source) where.source = source
    if (search) {
      const searchNum = parseFloat(search)
      if (!isNaN(searchNum)) {
        where.OR = [
          { value: searchNum },
          { category: { contains: search, mode: 'insensitive' } },
          { source: { contains: search, mode: 'insensitive' } },
        ]
      } else {
        where.OR = [
          { category: { contains: search, mode: 'insensitive' } },
          { source: { contains: search, mode: 'insensitive' } },
        ]
      }
    }

    // Get filtered and paginated data. Try Prisma first; if DATABASE_URL is missing, fall back to bundled sample CSV.
    let totalCount: number
    let data: any[]
    try {
      totalCount = await prisma.dataEntry.count({ where })
      data = await prisma.dataEntry.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      })
    } catch (e: any) {
      const msg = (e && e.message) || ''
      if (msg.includes('DATABASE_URL') || e.name === 'PrismaClientInitializationError') {
        // Read sample CSV bundled with the project
        const csvPath = path.resolve(process.cwd(), 'sample-data.csv')
        const csvContent = fs.readFileSync(csvPath, 'utf8')
        const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true }).data as any[]
        const entries = parsed.map((row, idx) => ({
          id: idx + 1,
          timestamp: new Date(row.timestamp),
          value: parseFloat(row.value),
          category: row.category,
          source: row.source,
        }))

        // Apply same filters as 'where'
        let filtered = entries
        if (where.timestamp) {
          const gte = where.timestamp.gte
          const lte = where.timestamp.lte
          filtered = filtered.filter(e => e.timestamp >= gte && e.timestamp <= lte)
        }
        if (where.category) filtered = filtered.filter(e => e.category === where.category)
        if (where.source) filtered = filtered.filter(e => e.source === where.source)
        if (where.OR) {
          // simple OR handling for search
          const or = where.OR
          filtered = filtered.filter(e => {
            return or.some((clause: any) => {
              if (clause.value !== undefined) return e.value === clause.value
              if (clause.category && clause.category.contains) return e.category.toLowerCase().includes(clause.category.contains.toLowerCase())
              if (clause.source && clause.source.contains) return e.source.toLowerCase().includes(clause.source.contains.toLowerCase())
              return false
            })
          })
        }

        totalCount = filtered.length
        // sort desc by timestamp
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        data = filtered.slice((page - 1) * limit, (page - 1) * limit + limit)
      } else {
        throw e
      }
    }

    // Enhanced analytics (on filtered data)
    const totalEntries = data.length
    const averageValue = data.length > 0 ? data.reduce((sum: number, entry: any) => sum + entry.value, 0) / data.length : 0
    const totalValue = data.reduce((sum: number, entry: any) => sum + entry.value, 0)
    const minValue = data.length > 0 ? Math.min(...data.map((d: any) => d.value)) : 0
    const maxValue = data.length > 0 ? Math.max(...data.map((d: any) => d.value)) : 0
    const categories = [...new Set(data.map((d: any) => d.category))]

    // Sum by category
    const sumByCategory = categories.map(cat => ({
      category: cat,
      sum: data.filter((d: any) => d.category === cat).reduce((sum: number, d: any) => sum + d.value, 0),
      count: data.filter((d: any) => d.category === cat).length,
    }))

    // Trends: group by date (YYYY-MM-DD)
    const trends = data.reduce((acc: Record<string, { date: string; total: number; count: number }>, entry: any) => {
      const date = entry.timestamp.toISOString().split('T')[0]
      if (!acc[date]) acc[date] = { date, total: 0, count: 0 }
      acc[date].total += entry.value
      acc[date].count += 1
      return acc
    }, {} as Record<string, { date: string; total: number; count: number }>)

    const trendsArray = (Object.values(trends).sort((a: any, b: any) => a.date.localeCompare(b.date)) as any[])

    // Calculate trend slope and intercept using simple linear regression
    let trendSlope = 0
    let trendIntercept = 0
    if (trendsArray.length >= 2) {
      const n = trendsArray.length
      const sumX = trendsArray.reduce((sum: number, _: any, i: number) => sum + i, 0)
      const sumY = trendsArray.reduce((sum: number, trend: any) => sum + trend.total, 0)
      const sumXY = trendsArray.reduce((sum: number, trend: any, i: number) => sum + i * trend.total, 0)
      const sumXX = trendsArray.reduce((sum: number, _: any, i: number) => sum + i * i, 0)

      trendSlope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      trendIntercept = (sumY - trendSlope * sumX) / n
    }

    // Simple forecasting based on trend (next 7 days)
    const forecast = []
    if (trendsArray.length >= 2) {
      for (let i = 1; i <= 7; i++) {
        const futureIndex = trendsArray.length + i - 1
        const predictedValue = Math.max(0, trendIntercept + trendSlope * futureIndex)
        const futureDate = new Date(trendsArray[trendsArray.length - 1].date)
        futureDate.setDate(futureDate.getDate() + i)

        forecast.push({
          date: futureDate.toISOString().split('T')[0],
          predictedValue: Math.round(predictedValue * 100) / 100,
          confidence: Math.max(0.1, Math.min(0.9, 1 - Math.abs(trendSlope) * 0.1)) // Simple confidence based on trend stability
        })
      }
    }

    return NextResponse.json({
      data,
      analytics: {
        totalEntries,
        averageValue,
        totalValue,
        minValue,
        maxValue,
        categories,
        sumByCategory,
        trends: trendsArray,
        trendAnalysis: {
          slope: trendSlope,
          intercept: trendIntercept,
          direction: trendSlope > 0 ? 'increasing' : trendSlope < 0 ? 'decreasing' : 'stable',
        },
        forecast,
      },
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      filters: {
        startDate,
        endDate,
        category,
        source,
        search,
      },
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, value, category, source } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    try {
      const updatedEntry = await prisma.dataEntry.update({
        where: { id: parseInt(id) },
        data: {
          ...(value !== undefined && { value: parseFloat(value) }),
          ...(category && { category }),
          ...(source && { source }),
        },
      })

      return NextResponse.json(updatedEntry)
    } catch (e: any) {
      const msg = (e && e.message) || ''
      if (msg.includes('DATABASE_URL') || e.name === 'PrismaClientInitializationError') {
        return NextResponse.json({ error: 'DATABASE_URL not configured', details: 'Set DATABASE_URL to enable updates.' }, { status: 503 })
      }
      throw e
    }
  } catch (error) {
    console.error('Error updating data entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    try {
      await prisma.dataEntry.delete({
        where: { id: parseInt(id) },
      })

      return NextResponse.json({ message: 'Data entry deleted successfully' })
    } catch (e: any) {
      const msg = (e && e.message) || ''
      if (msg.includes('DATABASE_URL') || e.name === 'PrismaClientInitializationError') {
        return NextResponse.json({ error: 'DATABASE_URL not configured', details: 'Set DATABASE_URL to enable deletes.' }, { status: 503 })
      }
      throw e
    }
  } catch (error) {
    console.error('Error deleting data entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}