import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PayslipData } from '@/types/payslip';
import puppeteer from 'puppeteer';

export const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanThousand(n % 100) : '');
  };

  const convert = (n: number): string => {
    if (n === 0) return 'Zero';
    if (n < 1000) return convertLessThanThousand(n);
    if (n < 100000) return convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convertLessThanThousand(n % 1000) : '');
    if (n < 10000000) return convertLessThanThousand(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convertLessThanThousand(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  };

  return convert(num) + ' Rupees Only';
};

export const generatePayslipHTML = (payslip: PayslipData): string => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.2; max-width: 100%; padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          ${payslip.companyLogo ? `<img src="${payslip.companyLogo}" alt="Company Logo" style="height: 35px; width: auto;" />` : ''}
          <div>
            <h1 style="margin: 0; font-size: 16px; color: #333;">${payslip.companyName}</h1>
            <p style="margin: 0; color: #666; font-size: 11px;">Payslip for ${payslip.payPeriod}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 8px; font-size: 11px;">
        <div style="background: #f8f8f8; padding: 6px; border-radius: 3px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div style="display: flex; gap: 4px;">
              <strong style="width: 100px;">Employee Name:</strong>
              <span>${payslip.employeeName}</span>
            </div>
            <div style="display: flex; gap: 4px;">
              <strong style="width: 100px;">Employee ID:</strong>
              <span>${payslip.employeeId}</span>
            </div>
            <div style="display: flex; gap: 4px;">
              <strong style="width: 100px;">Designation:</strong>
              <span>${payslip.designation}</span>
            </div>
            <div style="display: flex; gap: 4px;">
              <strong style="width: 100px;">Department:</strong>
              <span>${payslip.department}</span>
            </div>
            <div style="display: flex; gap: 4px;">
              <strong style="width: 100px;">Pay Period:</strong>
              <span>${payslip.payPeriod}</span>
            </div>
            <div style="display: flex; gap: 4px;">
              <strong style="width: 100px;">Days:</strong>
              <span>Paid: ${payslip.paidDays} | LOP: ${payslip.lopDays}</span>
            </div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-bottom: 8px; font-size: 11px;">
        <div style="flex: 1;">
          <h2 style="margin: 0 0 3px; font-size: 12px;">Earnings</h2>
          <table style="width: 100%; border-collapse: collapse; line-height: 1;">
            <tbody>
              ${Object.entries(payslip.earnings || {}).map(([key, value]) => `
                <tr>
                  <td style="padding: 1px 0; border-bottom: 1px solid #eee;">${key}</td>
                  <td style="padding: 1px 0; border-bottom: 1px solid #eee; text-align: right;">₹${value.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              <tr style="font-weight: bold;">
                <td style="padding: 2px 0;">Gross Earnings</td>
                <td style="padding: 2px 0; text-align: right;">₹${payslip.totals?.grossEarnings.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="flex: 1;">
          <h2 style="margin: 0 0 3px; font-size: 12px;">Deductions</h2>
          <table style="width: 100%; border-collapse: collapse; line-height: 1;">
            <tbody>
              ${Object.entries(payslip.deductions || {}).map(([key, value]) => `
                <tr>
                  <td style="padding: 1px 0; border-bottom: 1px solid #eee;">${key}</td>
                  <td style="padding: 1px 0; border-bottom: 1px solid #eee; text-align: right;">₹${value.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              <tr style="font-weight: bold;">
                <td style="padding: 2px 0;">Total Deductions</td>
                <td style="padding: 2px 0; text-align: right;">₹${payslip.totals?.totalDeductions.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style="border-top: 1px solid #eee; padding-top: 6px; font-size: 11px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
          <span style="font-weight: bold; font-size: 13px;">Net Payable</span>
          <span style="font-weight: bold; font-size: 13px;">₹${payslip.totals?.netPayable.toLocaleString('en-IN')}</span>
        </div>
        <p style="margin: 1px 0; color: #666; font-style: italic; font-size: 10px;">${payslip.amountInWords}</p>
      </div>
    </div>
  `;
};

export const generatePDF = async (payslip: PayslipData): Promise<Blob> => {
  try {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payslip),
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const generatePNG = async (payslip: PayslipData): Promise<HTMLCanvasElement> => {
  const element = document.createElement('div');
  element.innerHTML = generatePayslipHTML(payslip);
  
  // Set styles for proper rendering
  element.style.padding = '40px';
  element.style.width = '1190px'; // Double A4 width for higher resolution
  element.style.backgroundColor = '#ffffff';
  element.style.position = 'absolute';
  element.style.left = '0';
  element.style.top = '0';
  document.body.appendChild(element);

  // Wait for any fonts to load
  await document.fonts.ready;

  const canvas = await html2canvas(element, {
    useCORS: true,
    logging: false,
    background: '#ffffff',
    width: element.offsetWidth,
    height: element.offsetHeight
  });

  document.body.removeChild(element);
  return canvas;
}; 