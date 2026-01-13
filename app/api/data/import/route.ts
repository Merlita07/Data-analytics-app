import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'

interface CSVRow {
  timestamp?: string
  value: string | number
  category: string
  source: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({
        error: 'No file provided'
      }, { status: 400 })
    }

    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({
        error: 'File must be a CSV file'
      }, { status: 400 })
    }

    // Read file content
    const fileContent = await file.text()

    // Parse CSV
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.toLowerCase().trim(),
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json({
        error: 'CSV parsing error',
        details: parseResult.errors
      }, { status: 400 })
    }

    const rows: CSVRow[] = parseResult.data as CSVRow[]
    const validEntries: { timestamp: Date; value: number; category: string; source: string }[] = []
    const errors: string[] = []

    // Validate and process each row
    rows.forEach((row, index) => {
      const rowNumber = index + 2 // +2 because of header row and 0-based index

      // Check required fields
      if (!row.value || !row.category || !row.source) {
        errors.push(`Row ${rowNumber}: Missing required fields (value, category, source)`)
        return
      }

      // Parse value
      const numValue = typeof row.value === 'number' ? row.value : parseFloat(row.value.toString())
      if (isNaN(numValue) || numValue < 0) {
        errors.push(`Row ${rowNumber}: Invalid value '${row.value}' - must be a positive number`)
        return
      }

      if (numValue > 1000000) {
        errors.push(`Row ${rowNumber}: Value '${numValue}' exceeds maximum allowed value of 1,000,000`)
        return
      }

      // Parse timestamp
      let timestamp: Date
      if (row.timestamp) {
        timestamp = new Date(row.timestamp)
        if (isNaN(timestamp.getTime())) {
          errors.push(`Row ${rowNumber}: Invalid timestamp '${row.timestamp}'`)
          return
        }
      } else {
        timestamp = new Date()
      }

      // Validate string fields
      const category = row.category.toString().trim()
      const source = row.source.toString().trim()

      if (category.length > 100 || source.length > 100) {
        errors.push(`Row ${rowNumber}: Category and source must be less than 100 characters`)
        return
      }

      if (!category || !source) {
        errors.push(`Row ${rowNumber}: Category and source cannot be empty`)
        return
      }

      validEntries.push({
        timestamp,
        value: numValue,
        category,
        source,
      })
    })

    // If there are too many errors, don't proceed
    if (errors.length > 50) {
      return NextResponse.json({
        error: 'Too many validation errors',
        details: errors.slice(0, 50),
        totalErrors: errors.length
      }, { status: 400 })
    }

    // Check for duplicates and save valid entries
    const savedEntries = []
    const duplicateErrors = []

    for (const entry of validEntries) {
      try {
        // Check for duplicate entries (same value, category, source within last hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const existingEntry = await prisma.dataEntry.findFirst({
          where: {
            value: entry.value,
            category: entry.category,
            source: entry.source,
            timestamp: {
              gte: oneHourAgo
            }
          }
        })

        if (existingEntry) {
          duplicateErrors.push(`Duplicate entry found for value: ${entry.value}, category: ${entry.category}, source: ${entry.source}`)
          continue
        }

        const savedEntry = await prisma.dataEntry.create({
          data: entry,
        })
        savedEntries.push(savedEntry)
      } catch (error) {
        console.error('Error saving entry:', error)
        errors.push(`Failed to save entry: ${JSON.stringify(entry)}`)
      }
    }

    return NextResponse.json({
      success: true,
      imported: savedEntries.length,
      totalRows: rows.length,
      validRows: validEntries.length,
      errors: [...errors, ...duplicateErrors],
      data: savedEntries
    }, { status: 201 })

  } catch (error) {
    console.error('Error importing CSV:', error)
    return NextResponse.json({
      error: 'Internal server error during import'
    }, { status: 500 })
  }
}