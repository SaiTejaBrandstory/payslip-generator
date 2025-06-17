import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { PayslipData } from '@/types/payslip';
import { generatePayslipHTML } from '@/services/pdfService';

export async function POST(request: Request) {
  try {
    const payslip: PayslipData = await request.json();
    const html = generatePayslipHTML(payslip);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      height: '1200px',
      preferCSSPageSize: false
    });

    await browser.close();

    // Convert Buffer to Uint8Array for Edge Runtime
    const uint8Array = new Uint8Array(pdf);

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=payslip.pdf'
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 