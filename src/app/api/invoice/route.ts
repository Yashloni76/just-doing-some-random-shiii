/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// Force the Edge Server Action to compile seamlessly
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get('id')

  if (!bookingId) {
    return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 })
  }

  const supabase = createClient()
  
    // Deep join bookings -> businesses & booking_items -> inventory_items
    const { data: booking, error }: any = await supabase
      .from('bookings')
      .select(`
        *,
        businesses ( * ),
        booking_items (
          quantity_booked,
          returned_quantity,
          inventory_items ( name, price_per_day, gst_rate, hsn_code )
        )
      `)
      .eq('id', bookingId)
      .single()

  if (error || !booking) {
    console.error("SUPABASE API ROUTE FETCH ERROR ->", error)
    return NextResponse.json({ error: 'Booking not found', details: error?.message || error }, { status: 404 })
  }

  try {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // Standard A4 Resolution
    
    // Embed standardized lightweight typography
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    const { width, height } = page.getSize()

    let y = height - 50

    // Master Header (Dynamic Business Details)
    const biz = booking.businesses
    const businessName = biz?.business_name || 'Rentpe Demo Business'
    page.drawText(businessName, { x: 50, y, size: 24, font: boldFont, color: rgb(0.1, 0.2, 0.5) })
    
    y -= 25
    page.drawText(`GSTIN: ${biz?.gstin || 'N/A'}`, { x: 50, y, size: 10, font: boldFont })
    
    if (biz?.business_address) {
      const addressLines = biz.business_address.split('\n')
      addressLines.forEach((line: string) => {
        y -= 15
        page.drawText(line, { x: 50, y, size: 9, font: timesRomanFont })
      })
    } else {
      page.drawText(`City: ${biz?.city || 'Mumbai, Maharashtra'}`, { x: 50, y: y - 15, size: 10, font: timesRomanFont })
      y -= 15
    }
    
    y -= 50
    page.drawText('TAX INVOICE', { x: width / 2 - 55, y, size: 16, font: boldFont })
    
    y -= 40
    page.drawText(`Billed To: ${booking.customer_name}`, { x: 50, y, size: 12, font: boldFont })
    page.drawText(`Phone: ${booking.customer_phone}`, { x: 50, y: y - 15, size: 10, font: timesRomanFont })
    
    page.drawText(`Invoice Date: ${new Date().toLocaleDateString()}`, { x: width - 200, y, size: 10, font: timesRomanFont })
    page.drawText(`Rental Period: ${new Date(booking.start_date).toLocaleDateString()} to ${new Date(booking.end_date).toLocaleDateString()}`, { x: width - 200, y: y - 15, size: 10, font: timesRomanFont })

    y -= 50

    // Table Array Structuring
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) })
    y -= 15
    page.drawText('Item Description', { x: 50, y, size: 9, font: boldFont })
    page.drawText('HSN', { x: 230, y, size: 9, font: boldFont })
    page.drawText('Qty/Days', { x: 280, y, size: 9, font: boldFont })
    page.drawText('Rate', { x: 335, y, size: 9, font: boldFont })
    page.drawText('CGST', { x: 385, y, size: 9, font: boldFont })
    page.drawText('SGST', { x: 435, y, size: 9, font: boldFont })
    page.drawText('Total', { x: 490, y, size: 9, font: boldFont })
    y -= 10
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) })
    y -= 20

    let totalCGST = 0
    let totalSGST = 0
    let totalTaxable = 0

    // Auto calculate accurate Date diffs for Rentals
    const startMili = new Date(booking.start_date).getTime()
    const endMili = new Date(booking.end_date).getTime()
    const diffDays = Math.max(1, Math.ceil((endMili - startMili) / (1000 * 60 * 60 * 24)))

    // Render Database Array natively
    booking.booking_items?.forEach((bi: any) => {
      const item = bi.inventory_items
      if (!item) return

      const qty = bi.quantity_booked
      const rate = item.price_per_day
      
      const itemTaxable = qty * rate * diffDays
      
      // Auto GST Intelligence Fallbacks
      const gstRate = item.gst_rate || 18.00 
      const cgstAmt = (itemTaxable * (gstRate / 2)) / 100
      const sgstAmt = (itemTaxable * (gstRate / 2)) / 100
      const rowTotal = itemTaxable + cgstAmt + sgstAmt

      totalTaxable += itemTaxable
      totalCGST += cgstAmt
      totalSGST += sgstAmt

      page.drawText(item.name.substring(0, 35), { x: 50, y, size: 9, font: timesRomanFont })
      page.drawText(item.hsn_code || '9973', { x: 230, y, size: 9, font: timesRomanFont })
      page.drawText(`${qty}x / ${diffDays}d`, { x: 280, y, size: 9, font: timesRomanFont })
      page.drawText(`Rs.${rate}`, { x: 335, y, size: 9, font: timesRomanFont })
      page.drawText(`${(gstRate/2)}%`, { x: 385, y, size: 8, font: timesRomanFont, color: rgb(0.4, 0.4, 0.4) })
      page.drawText(`${(gstRate/2)}%`, { x: 435, y, size: 8, font: timesRomanFont, color: rgb(0.4, 0.4, 0.4) })
      page.drawText(`Rs.${rowTotal.toFixed(2)}`, { x: 490, y, size: 9, font: boldFont })
      y -= 25
    })

    y -= 10
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) })
    y -= 25

    // Total Aggegration Visuals
    const rightAlign = 360
    page.drawText(`Taxable Base Value: Rs. ${totalTaxable.toFixed(2)}`, { x: rightAlign, y, size: 10, font: timesRomanFont })
    y -= 18
    page.drawText(`Add CGST Amount: Rs. ${totalCGST.toFixed(2)}`, { x: rightAlign, y, size: 10, font: timesRomanFont })
    y -= 18
    page.drawText(`Add SGST Amount: Rs. ${totalSGST.toFixed(2)}`, { x: rightAlign, y, size: 10, font: timesRomanFont })
    y -= 25
    
    // Grand Total utilizing the mathematically verified PDF sequence incl. Taxes
    const finalGrandTotal = totalTaxable + totalCGST + totalSGST
    page.drawText(`GRAND TOTAL: Rs. ${finalGrandTotal.toFixed(2)}`, { x: rightAlign, y, size: 13, font: boldFont, color: rgb(0.1, 0.2, 0.5) })

    // Footer
    y -= 60
    if (biz?.terms_conditions) {
      page.drawText('Terms & Conditions:', { x: 50, y, size: 10, font: boldFont })
      const termsLines = biz.terms_conditions.split('\n').slice(0, 5) // Cap to 5 lines for now
      termsLines.forEach((line: string) => {
        y -= 12
        page.drawText(line, { x: 50, y, size: 8, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) })
      })
      y -= 20
    }
    
    page.drawText('Thank you for renting with us!', { x: 50, y, size: 10, font: boldFont })
    page.drawText('This is a computer-generated invoice and requires no physical signature.', { x: 50, y: y - 15, size: 8, font: timesRomanFont, color: rgb(0.5, 0.5, 0.5) })

    // Finalize Array Buffer
    const pdfBytes = await pdfDoc.save()

    // Send HTTP PDF Stream payload
    return new Response(pdfBytes as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice_${booking.customer_name.replace(/\s+/g, '_')}.pdf"`
      }
    })

  } catch (err: any) {
    console.error("PDF-Lib Core Engine Error:", err)
    return NextResponse.json({ error: 'Failed to compile secure PDF array' }, { status: 500 })
  }
}
