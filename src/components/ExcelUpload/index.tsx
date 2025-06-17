'use client';

import { useState, useRef } from 'react';
import { FormData } from '@/types/payslip';
import { generateTemplate, parseExcelFile } from '@/services/excelService';
import PayslipPreview from '../PayslipPreview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ExcelUpload = () => {
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

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      if (base64String) {
        // Create an image element to check dimensions
        const img = new Image();
        img.onload = () => {
          // Store the logo in state and update all payslips
          setCompanyLogo(base64String);
          setPayslips(prevPayslips => 
            prevPayslips.map(payslip => ({
              ...payslip,
              companyLogo: base64String
            }))
          );
        };
        img.onerror = () => {
          alert('Error loading image. Please try another file.');
          e.target.value = '';
        };
        img.src = base64String;
      }
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      e.target.value = '';
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
      // Apply the current logo to all payslips if one exists
      const updatedPayslips = parsedPayslips.map(payslip => ({
        ...payslip,
        companyLogo: companyLogo || payslip.companyLogo
      }));
      setPayslips(updatedPayslips);
      setShowPreview(true);
      setSelectedPayslip(0);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      alert('Error parsing Excel file. Please check the format and try again.');
    }
  };

  const handleDownload = async () => {
    if (!payslipRef.current || selectedPayslip === null) return;

    try {
      const canvas = await html2canvas(payslipRef.current, {
        useCORS: true,
        logging: false,
        background: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `payslip-${selectedPayslip + 1}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Error generating PNG. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!payslipRef.current || selectedPayslip === null) return;

    try {
      const canvas = await html2canvas(payslipRef.current, {
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

      const imgWidth = 595.28;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`payslip-${selectedPayslip + 1}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleDownloadAll = async () => {
    if (!payslips.length) return;

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      for (let i = 0; i < payslips.length; i++) {
        setSelectedPayslip(i);
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for render

        if (!payslipRef.current) continue;

        const canvas = await html2canvas(payslipRef.current, {
          useCORS: true,
          logging: false,
          background: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 595.28;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save('all-payslips.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-['system-ui']">
      <div className="p-4 max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent font-['system-ui']">
              Bulk Payslip Generator
            </h1>
            <p className="mt-2 text-gray-600 font-['system-ui']">Generate multiple payslips easily using Excel</p>
          </div>

          <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-lg font-['system-ui']">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent font-['system-ui']">
                  Step 1: Upload Company Logo
                </h2>
                <p className="text-sm text-gray-600 mb-4 font-['system-ui']">Upload your company logo (240 x 240 pixels @ 72 DPI, max 1MB)</p>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    ref={logoInputRef}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] text-white px-4 py-2 rounded cursor-pointer hover:from-[#D32F1D] hover:to-[#E85F3D] transition-all duration-300 font-['system-ui']"
                  >
                    Upload Logo
                  </label>
                  {companyLogo && (
                    <div className="w-16 h-16 relative">
                      <img
                        src={companyLogo}
                        alt="Company Logo"
                        className="w-full h-full object-contain"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent font-['system-ui']">
                  Step 2: Download Template
                </h2>
                <button
                  onClick={handleDownloadTemplate}
                  className="bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] text-white px-6 py-3 rounded-lg hover:from-[#D32F1D] hover:to-[#E85F3D] transition-all duration-300 font-['system-ui']"
                >
                  Download Excel Template
                </button>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent font-['system-ui']">
                  Step 3: Upload Filled Template
                </h2>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] text-white px-6 py-3 rounded-lg hover:from-[#D32F1D] hover:to-[#E85F3D] transition-all duration-300 font-['system-ui'] inline-block cursor-pointer"
                >
                  Upload Excel File
                </label>
              </div>
            </div>
          </div>

          {showPreview && (
            <div className="mt-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent">
                  Preview Payslips
                </h2>
                <div className="flex gap-4">
                  <button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                  >
                    Download Current (PNG)
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded hover:from-red-600 hover:to-rose-600 transition-all duration-300"
                  >
                    Download Current (PDF)
                  </button>
                  <button
                    onClick={handleDownloadAll}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
                  >
                    Download All (PDF)
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
                {payslips.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPayslip(index)}
                    className={`px-4 py-2 rounded ${
                      selectedPayslip === index
                        ? 'bg-[#E83A25] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Payslip {index + 1}
                  </button>
                ))}
              </div>

              {selectedPayslip !== null && (
                <div ref={payslipRef}>
                  <PayslipPreview payslip={payslips[selectedPayslip]} />
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