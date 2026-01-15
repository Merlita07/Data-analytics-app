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
        // Try to fetch public sample CSV (works on Vercel). Fallback to local file read.
        let csvContent = ''
        try {
          const origin = new URL(request.url).origin
          const res = await fetch(`${origin}/sample-data.csv`)
          if (res.ok) {
            csvContent = await res.text()
          } else {
            const csvPath = path.resolve(process.cwd(), 'sample-data.csv')
            csvContent = fs.readFileSync(csvPath, 'utf8')
          }
        } catch (fetchErr) {
          const csvPath = path.resolve(process.cwd(), 'sample-data.csv')
          csvContent = fs.readFileSync(csvPath, 'utf8')
        }
        const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true }).data as any[]
        data = parsed.map((row, idx) => ({
          id: idx + 1,
          timestamp: new Date(row.timestamp),
          value: parseFloat(row.value),
          category: row.category,
          source: row.source,
        }))
        // apply basic where filters
        if (where.timestamp) {
          const gte = where.timestamp.gte
          const lte = where.timestamp.lte
          data = data.filter(e => e.timestamp >= gte && e.timestamp <= lte)
        }
        if (where.category) data = data.filter(e => e.category === where.category)
        if (where.source) data = data.filter(e => e.source === where.source)
      } else {
        throw e
      }
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