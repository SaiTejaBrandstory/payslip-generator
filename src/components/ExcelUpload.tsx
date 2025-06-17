'use client';

import React, { useState, useRef } from 'react';
import { FormData, Earning, Deduction } from '@/types/payslip';
import { generateTemplate, parseExcelFile } from '@/services/excelService';
import { numberToWords } from '@/utils/numberToWords';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatMonth = (date: string): string => {
  if (!date) return '';
  const [month, year] = date.split(' ');
  return `${month} ${year}`;
};

const ExcelUpload: React.FC = () => {
  const [payslips, setPayslips] = useState<FormData[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const payslipRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (1MB = 1024 * 1024 bytes)
    if (file.size > 1024 * 1024) {
      alert('File size must be less than 1MB');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      if (base64String) {
        setCompanyLogo(base64String);
        setPayslips(prevPayslips =>
          prevPayslips.map(payslip => ({
            ...payslip,
            companyLogo: base64String
          }))
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadTemplate = () => {
    generateTemplate();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedPayslips = await parseExcelFile(file);
      // Ensure the uploaded logo is applied to all payslips
      const updatedPayslips = parsedPayslips.map(payslip => ({
        ...payslip,
        companyLogo: companyLogo || payslip.companyLogo
      }));
      setPayslips(updatedPayslips);
      setShowPreview(true);
      setSelectedPayslip(0); // Select first payslip by default
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      alert('Error parsing Excel file. Please check the format and try again.');
    }
  };

  const getFileName = (payPeriod: string, employeeName: string) => {
    if (!payPeriod || !employeeName) return 'payslip';
    // Try to parse payPeriod as either 'June 2023' or '2023-06'
    let year = '', month = '';
    if (/\d{4}-\d{2}/.test(payPeriod)) {
      // Format: 2023-06
      [year, month] = payPeriod.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      month = date.toLocaleString('default', { month: 'long' });
    } else if (/^[A-Za-z]+ \d{4}$/.test(payPeriod)) {
      // Format: June 2023
      [month, year] = payPeriod.split(' ');
    } else {
      // Fallback: use as is
      month = payPeriod;
    }
    return `${employeeName.replace(/\s+/g, '-').toLowerCase()}-${month.toLowerCase()}-${year}-payslip`;
  };

  const renderPayslipToCanvas = async (payslip: FormData) => {
    // Create a temporary container
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '800px';
    tempDiv.style.background = '#fff';
    document.body.appendChild(tempDiv);

    // Render payslip content into tempDiv
    tempDiv.innerHTML = `
      <div class="p-8 bg-white max-w-4xl mx-auto font-['system-ui']">
        <div class="flex justify-between items-start mb-8 font-['system-ui']">
          <div class="flex items-center space-x-6 mb-2 font-['system-ui']">
            ${payslip.companyLogo ? `<img src="${payslip.companyLogo}" alt="Logo" class="w-16 h-auto object-contain" />` : ''}
            <div class="font-['system-ui']">
              <h1 class="text-[#E83A25] font-bold text-base font-['system-ui']">${payslip.companyName}</h1>
              ${payslip.companyAddress ? `<p class="text-sm leading-5 font-['system-ui']">${payslip.companyAddress}</p>` : ''}
              ${payslip.companyCity ? `<p class="text-sm leading-5 font-['system-ui']">${payslip.companyCity}</p>` : ''}
              ${payslip.companyPincode ? `<p class="text-sm leading-5 font-['system-ui']">${payslip.companyPincode}</p>` : ''}
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-600 font-['system-ui']">Payslip For the Month</p>
            <p class="text-[#E83A25] font-medium font-['system-ui']">${formatMonth(payslip.payPeriod)}</p>
          </div>
        </div>
        <div class="bg-gray-50 p-6 rounded mb-8">
          <div class="grid grid-cols-2 gap-x-8 gap-y-3 font-['system-ui']">
            <p><span class="font-bold">Employee Name:</span> ${payslip.employeeName}</p>
            <p><span class="font-bold">Designation:</span> ${payslip.designation}</p>
            <p><span class="font-bold">Employee ID:</span> ${payslip.employeeId}</p>
            <p><span class="font-bold">Date of Birth:</span> ${payslip.dateOfBirth}</p>
            <p><span class="font-bold">PAN Number:</span> ${payslip.panNumber}</p>
            <p><span class="font-bold">Date of Joining:</span> ${payslip.dateOfJoining}</p>
            <p><span class="font-bold">Pay Period:</span> ${formatMonth(payslip.payPeriod)}</p>
            <p><span class="font-bold">Pay Date:</span> ${payslip.payDate}</p>
            <p><span class="font-bold">Paid Days:</span> ${payslip.paidDays}</p>
            <p><span class="font-bold">LOP Days:</span> ${payslip.lopDays}</p>
          </div>
        </div>
        <div class="flex justify-between text-sm mb-8 font-['system-ui']">
          <p><span class="font-bold">PF A/C Number:</span> ${payslip.pfNumber}</p>
          <p><span class="font-bold">UAN:</span> ${payslip.uan}</p>
        </div>
        <div class="grid grid-cols-2 gap-8 mt-8">
          <table class="w-full border text-left">
            <thead class="bg-[#E83A25] text-white">
              <tr><th class="px-4 py-2">EARNINGS</th><th class="px-4 py-2">AMOUNT</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${(payslip.earnings || []).map(item => `<tr><td class="px-4 py-2 leading-relaxed">${item.title}</td><td class="px-4 py-2 leading-relaxed">₹${item.amount.toLocaleString('en-IN')}</td></tr>`).join('')}
              <tr class="bg-gray-50 font-semibold"><td class="px-4 py-2 leading-relaxed">GROSS EARNINGS</td><td class="px-4 py-2 leading-relaxed">₹${(payslip.earnings || []).reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</td></tr>
            </tbody>
          </table>
          <table class="w-full border text-left">
            <thead class="bg-[#E83A25] text-white">
              <tr><th class="px-4 py-2">DEDUCTIONS</th><th class="px-4 py-2">AMOUNT</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${(payslip.deductions || []).map(item => `<tr><td class="px-4 py-2 leading-relaxed">${item.title}</td><td class="px-4 py-2 leading-relaxed">₹${item.amount.toLocaleString('en-IN')}</td></tr>`).join('')}
              <tr class="bg-gray-50 font-semibold"><td class="px-4 py-2 leading-relaxed">TOTAL DEDUCTIONS</td><td class="px-4 py-2 leading-relaxed">₹${(payslip.deductions || []).reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="mt-8 bg-gray-50 py-4 px-6">
          <div class="flex justify-between text-sm">
            <p class="font-medium">GROSS EARNINGS</p>
            <p class="font-medium">₹${(payslip.earnings || []).reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</p>
          </div>
          <div class="flex justify-between text-[#E83A25] text-sm mt-2">
            <p class="font-medium">TOTAL DEDUCTIONS</p>
            <p class="font-medium">₹${(payslip.deductions || []).reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</p>
          </div>
          <div class="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-200">
            <p>NET PAY</p>
            <p class="text-[#E83A25]">₹${((payslip.earnings || []).reduce((sum, item) => sum + item.amount, 0) - (payslip.deductions || []).reduce((sum, item) => sum + item.amount, 0)).toLocaleString('en-IN')}</p>
          </div>
          <div class="mt-2 text-sm">
            <span>Amount in Words: </span>
            <span class="font-bold italic">${payslip.amountInWords}</span>
          </div>
        </div>
        <p class="text-center text-gray-500 text-xs mt-8 italic">This is a computer-generated document. No signature is required.</p>
      </div>
    `;

    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(tempDiv, {
      useCORS: true,
      logging: false,
      background: '#ffffff'
    });
    document.body.removeChild(tempDiv);
    return canvas;
  };

  const handleDownloadPDF = async () => {
    if (!payslipRef.current || selectedPayslip === null) return;

    try {
      const canvas = await html2canvas(payslipRef.current!, {
        useCORS: true,
        logging: false,
        background: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const imgWidth = 595.28; // A4 width in points
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xOffset = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
      const yOffset = 0;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      const fileName = getFileName(payslips[selectedPayslip].payPeriod, payslips[selectedPayslip].employeeName);
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleDownloadPNG = async () => {
    if (!payslipRef.current || selectedPayslip === null) return;

    try {
      const canvas = await html2canvas(payslipRef.current!, {
        useCORS: true,
        logging: false,
        background: '#ffffff'
      });

      const link = document.createElement('a');
      const fileName = getFileName(payslips[selectedPayslip].payPeriod, payslips[selectedPayslip].employeeName);
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Error generating PNG. Please try again.');
    }
  };

  const handleDownloadAllPDF = async () => {
    if (!payslips.length) return;

    try {
      const zip = new JSZip();
      for (const payslip of payslips) {
        const canvas = await renderPayslipToCanvas(payslip);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4'
        });
        const imgWidth = 595.28;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const xOffset = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, 0, imgWidth, imgHeight);
        const pdfBlob = pdf.output('blob');
        const pdfFileName = `${getFileName(payslip.payPeriod, payslip.employeeName)}.pdf`;
        zip.file(pdfFileName, pdfBlob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = 'payslips-pdf.zip';
      link.click();
    } catch (error) {
      console.error('Error generating PDF zip:', error);
      alert('Error generating PDF zip file. Please try again.');
    }
  };

  const handleDownloadAllPNG = async () => {
    if (!payslips.length) return;

    try {
      const zip = new JSZip();
      for (const payslip of payslips) {
        const canvas = await renderPayslipToCanvas(payslip);
        const pngBlob = await new Promise<Blob>(resolve => {
          canvas.toBlob(blob => resolve(blob!), 'image/png');
        });
        const pngFileName = `${getFileName(payslip.payPeriod, payslip.employeeName)}.png`;
        zip.file(pngFileName, pngBlob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = 'payslips-png.zip';
      link.click();
    } catch (error) {
      console.error('Error generating PNG zip:', error);
      alert('Error generating PNG zip file. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent">
              Bulk Payslip Generator
            </h1>
            <p className="mt-2 text-gray-600">Generate multiple payslips easily using Excel</p>
          </div>

          <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent">
                  Step 1: Upload Company Logo
                </h2>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  ref={logoInputRef}
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] text-white px-6 py-3 rounded-lg hover:from-[#D32F1D] hover:to-[#E85F3D] transition-all duration-300"
                  type="button"
                >
                  Upload Logo
                </button>
                {companyLogo && (
                  <div className="mt-4">
                    <img src={companyLogo} alt="Company Logo" className="h-16 object-contain" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent">
                  Step 2: Download Template
                </h2>
                <button
                  onClick={handleDownloadTemplate}
                  className="bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] text-white px-6 py-3 rounded-lg hover:from-[#D32F1D] hover:to-[#E85F3D] transition-all duration-300"
                >
                  Download Excel Template
                </button>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent">
                  Step 3: Upload Filled Template
                </h2>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] text-white px-6 py-3 rounded-lg hover:from-[#D32F1D] hover:to-[#E85F3D] transition-all duration-300"
                >
                  Upload Excel File
                </button>
              </div>
            </div>
          </div>

          {showPreview && payslips.length > 0 && (
            <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent">
                Preview and Download
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                <select
                  value={selectedPayslip ?? 0}
                  onChange={(e) => setSelectedPayslip(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                >
                  {payslips.map((payslip, index) => (
                    <option key={index} value={index}>
                      {payslip.employeeName} - {formatMonth(payslip.payPeriod)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={handleDownloadPDF}
                    className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-300"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={handleDownloadPNG}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                  >
                    Download PNG
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleDownloadAllPDF}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
                  >
                    Download All PDFs
                  </button>
                  <button
                    onClick={handleDownloadAllPNG}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300"
                  >
                    Download All PNGs
                  </button>
                </div>
              </div>

              {selectedPayslip !== null && (
                <div ref={payslipRef} className="font-['system-ui']">
                  <div className="p-8 bg-white max-w-4xl mx-auto font-['system-ui']">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 font-['system-ui']">
                      <div className="flex items-center space-x-6 mb-2 font-['system-ui']">
                        {payslips[selectedPayslip]?.companyLogo && (
                          <img
                            src={payslips[selectedPayslip].companyLogo}
                            alt="Logo"
                            className="w-16 h-auto object-contain"
                          />
                        )}
                        <div className="font-['system-ui']">
                          <h1 className="text-[#E83A25] font-bold text-base font-['system-ui']">
                            {payslips[selectedPayslip]?.companyName}
                          </h1>
                          {payslips[selectedPayslip]?.companyAddress && (
                            <p className="text-sm leading-5 font-['system-ui']">{payslips[selectedPayslip].companyAddress}</p>
                          )}
                          {payslips[selectedPayslip]?.companyCity && (
                            <p className="text-sm leading-5 font-['system-ui']">{payslips[selectedPayslip].companyCity}</p>
                          )}
                          {payslips[selectedPayslip]?.companyPincode && (
                            <p className="text-sm leading-5 font-['system-ui']">{payslips[selectedPayslip].companyPincode}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-['system-ui']">Payslip For the Month</p>
                        <p className="text-[#E83A25] font-medium font-['system-ui']">{formatMonth(payslips[selectedPayslip]?.payPeriod)}</p>
                      </div>
                    </div>

                    {/* Employee Details */}
                    <div className="bg-gray-50 p-6 rounded mb-8">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3 font-['system-ui']">
                        <p><span className="font-bold">Employee Name:</span> {payslips[selectedPayslip]?.employeeName}</p>
                        <p><span className="font-bold">Designation:</span> {payslips[selectedPayslip]?.designation}</p>
                        <p><span className="font-bold">Employee ID:</span> {payslips[selectedPayslip]?.employeeId}</p>
                        <p><span className="font-bold">Date of Birth:</span> {payslips[selectedPayslip]?.dateOfBirth}</p>
                        <p><span className="font-bold">PAN Number:</span> {payslips[selectedPayslip]?.panNumber}</p>
                        <p><span className="font-bold">Date of Joining:</span> {payslips[selectedPayslip]?.dateOfJoining}</p>
                        <p><span className="font-bold">Pay Period:</span> {formatMonth(payslips[selectedPayslip]?.payPeriod)}</p>
                        <p><span className="font-bold">Pay Date:</span> {payslips[selectedPayslip]?.payDate}</p>
                        <p><span className="font-bold">Paid Days:</span> {payslips[selectedPayslip]?.paidDays}</p>
                        <p><span className="font-bold">LOP Days:</span> {payslips[selectedPayslip]?.lopDays}</p>
                      </div>
                    </div>

                    {/* PF and UAN */}
                    <div className="flex justify-between text-sm mb-8 font-['system-ui']">
                      <p><span className="font-bold">PF A/C Number:</span> {payslips[selectedPayslip]?.pfNumber}</p>
                      <p><span className="font-bold">UAN:</span> {payslips[selectedPayslip]?.uan}</p>
                    </div>

                    {/* Earnings and Deductions Tables */}
                    <div className="grid grid-cols-2 gap-8 mt-8">
                      {/* Earnings Table */}
                      <table className="w-full border text-left">
                        <thead className="bg-[#E83A25] text-white">
                          <tr>
                            <th className="px-4 py-2">EARNINGS</th>
                            <th className="px-4 py-2">AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {payslips[selectedPayslip]?.earnings.filter(item => item.title && item.amount > 0).map((item, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2 leading-relaxed">{item.title}</td>
                              <td className="px-4 py-2 leading-relaxed">₹{item.amount.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50 font-semibold">
                            <td className="px-4 py-2 leading-relaxed">GROSS EARNINGS</td>
                            <td className="px-4 py-2 leading-relaxed">₹{payslips[selectedPayslip]?.earnings.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</td>
                          </tr>
                        </tbody>
                      </table>
                      {/* Deductions Table */}
                      <table className="w-full border text-left">
                        <thead className="bg-[#E83A25] text-white">
                          <tr>
                            <th className="px-4 py-2">DEDUCTIONS</th>
                            <th className="px-4 py-2">AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {payslips[selectedPayslip]?.deductions.filter(item => item.title && item.amount > 0).map((item, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2 leading-relaxed">{item.title}</td>
                              <td className="px-4 py-2 leading-relaxed">₹{item.amount.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50 font-semibold">
                            <td className="px-4 py-2 leading-relaxed">TOTAL DEDUCTIONS</td>
                            <td className="px-4 py-2 leading-relaxed">₹{payslips[selectedPayslip]?.deductions.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Section */}
                    <div className="mt-8 bg-gray-50 py-4 px-6">
                      <div className="flex justify-between text-sm">
                        <p className="font-medium">GROSS EARNINGS</p>
                        <p className="font-medium">₹{payslips[selectedPayslip]?.earnings.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex justify-between text-[#E83A25] text-sm mt-2">
                        <p className="font-medium">TOTAL DEDUCTIONS</p>
                        <p className="font-medium">₹{payslips[selectedPayslip]?.deductions.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-200">
                        <p>NET PAY</p>
                        <p className="text-[#E83A25]">₹{(payslips[selectedPayslip]?.earnings.reduce((sum, item) => sum + item.amount, 0) - payslips[selectedPayslip]?.deductions.reduce((sum, item) => sum + item.amount, 0)).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="mt-2 text-sm">
                        <span>Amount in Words: </span>
                        <span className="font-bold italic">{payslips[selectedPayslip]?.amountInWords}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-gray-500 text-xs mt-8 italic">This is a computer-generated document. No signature is required.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelUpload; 