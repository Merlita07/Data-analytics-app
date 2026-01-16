import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const category = searchParams.get('category')
    const source = searchParams.get('source')
    const format = searchParams.get('format') || 'csv' // csv or json

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

    let data: any[]
    try {
      data = await prisma.dataEntry.findMany({
        where,
        orderBy: { timestamp: 'desc' },
      })
    } catch (e: any) {
      const msg = (e && e.message) || ''
      if (msg.includes('DATABASE_URL') || e.name === 'PrismaClientInitializationError') {
        return NextResponse.json(
          {
            error: 'DATABASE_URL not configured',
            details: 'Set DATABASE_URL in your environment or Vercel project settings to enable data export. See SUPABASE_SETUP.md for configuration instructions.'
          },
          { status: 503 }
        )
      }
      throw e
    }

    if (format === 'json') {
      return NextResponse.json(data)
    }

    // Generate CSV
    const csvHeaders = 'ID,Timestamp,Value,Category,Source\n'
    const csvRows = data.map((entry: any) =>
      `${entry.id},"${entry.timestamp.toISOString()}","${entry.value}","${entry.category}","${entry.source}"`
    ).join('\n')

    const csv = csvHeaders + csvRows

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=data-export.csv',
      },
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}