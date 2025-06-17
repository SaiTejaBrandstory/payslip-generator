'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { FormData, Earning, Deduction } from '@/types/payslip';
import html2canvas from 'html2canvas';
import PayslipPreview from './PayslipPreview';

interface Props {
  onSubmit: (data: FormData) => void;
}

const PayslipForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyLogo: '',
    companyAddress: '',
    companyCity: '',
    companyPincode: '',
    employeeName: '',
    employeeId: '',
    dateOfBirth: '',
    panNumber: '',
    designation: '',
    dateOfJoining: '',
    payPeriod: '',
    payDate: '',
    pfNumber: '',
    uan: '',
    paidDays: 0,
    lopDays: 0,
    earnings: [
      { title: 'Basic', amount: 0 },
      { title: 'House Rent Allowance', amount: 0 },
      { title: 'Conveyance', amount: 0 },
      { title: 'Media Allowance', amount: 0 },
      { title: 'Special Allowance', amount: 0 },
      { title: 'Other Allowance', amount: 0 }
    ],
    deductions: [
      { title: 'Professional Tax', amount: 0 },
      { title: 'TDS', amount: 0 },
      { title: 'Leave Deduction', amount: 0 },
      { title: 'Provident Fund', amount: 0 }
    ],
    netPay: 0,
    amountInWords: ''
  });

  const [logo, setLogo] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const payslipRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'paidDays' || name === 'lopDays') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEarningChange = (index: number, field: string, value: string | number) => {
    const newEarnings = [...formData.earnings];
    newEarnings[index] = { ...newEarnings[index], [field]: value };
    setFormData(prev => ({ ...prev, earnings: newEarnings }));
  };

  const handleDeductionChange = (index: number, field: string, value: string | number) => {
    const newDeductions = [...formData.deductions];
    newDeductions[index] = { ...newDeductions[index], [field]: value };
    setFormData(prev => ({ ...prev, deductions: newDeductions }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB
        alert('File size should not exceed 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const logo = e.target?.result as string;
        setLogo(logo);
        setFormData(prev => ({ ...prev, companyLogo: logo }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateNetPay = () => {
    const totalEarnings = formData.earnings.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = formData.deductions.reduce((sum, item) => sum + item.amount, 0);
    return totalEarnings - totalDeductions;
  };

  const convertToWords = (amount: number) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertLessThanOneThousand = (n: number): string => {
      if (n === 0) return '';

      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanOneThousand(n % 100) : '');
    };

    if (amount === 0) return 'Zero Rupees';

    let words = '';
    if (amount >= 100000) {
      words += convertLessThanOneThousand(Math.floor(amount / 100000)) + ' Lakh ';
      amount %= 100000;
    }
    if (amount >= 1000) {
      words += convertLessThanOneThousand(Math.floor(amount / 1000)) + ' Thousand ';
      amount %= 1000;
    }
    if (amount > 0) {
      words += convertLessThanOneThousand(amount);
    }

    return words.trim() + ' Rupees Only';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate net pay
    const netPay = calculateNetPay();
    
    // Update form data with latest values
    const updatedFormData = {
      ...formData,
      netPay: netPay,
      amountInWords: convertToWords(netPay)
    };
    
    onSubmit(updatedFormData);
    setShowPreview(true);
  };

  const handleDownload = async () => {
    if (!payslipRef.current) return;

    try {
      const canvas = await html2canvas(payslipRef.current, {
        useCORS: true,
        logging: false,
        background: '#ffffff',
        width: payslipRef.current.offsetWidth * 2,
        height: payslipRef.current.offsetHeight * 2
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create blob');
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.download = `${formData.employeeName}_payslip.png`;
        link.href = url;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-[#E83A25] mb-6">Payslip Generator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Logo */}
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Company Logo</h2>
            <p className="text-sm text-gray-500">Upload your company logo (240 x 240 pixels @ 72 DPI, max 1MB)</p>
            <div className="flex items-center space-x-4">
              {logo && (
                <img src={logo} alt="Company Logo" className="w-24 h-24 object-contain" />
              )}
              <label className="bg-[#E83A25] text-white px-4 py-2 rounded cursor-pointer hover:bg-[#d33520] transition-colors">
                Upload Logo
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Company Details Section */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Company Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  name="companyCity"
                  value={formData.companyCity}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pincode</label>
                <input
                  type="text"
                  name="companyPincode"
                  value={formData.companyPincode}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Employee Details Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Employee Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee Name</label>
                <input
                  type="text"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Joining</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pay Period</label>
                <input
                  type="month"
                  name="payPeriod"
                  value={formData.payPeriod}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pay Date</label>
                <input
                  type="date"
                  name="payDate"
                  value={formData.payDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Paid Days</label>
                <input
                  type="number"
                  name="paidDays"
                  value={formData.paidDays}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Loss of Pay Days</label>
                <input
                  type="number"
                  name="lopDays"
                  value={formData.lopDays}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">PF Number</label>
                <input
                  type="text"
                  name="pfNumber"
                  value={formData.pfNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">UAN</label>
                <input
                  type="text"
                  name="uan"
                  value={formData.uan}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Earnings Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Earnings</h2>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    earnings: [...prev.earnings, { title: '', amount: 0 }]
                  }));
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Add Earning
              </button>
            </div>
            {formData.earnings.map((earning, index) => (
              <div key={index} className="flex gap-4 mb-4">
                <input
                  type="text"
                  value={earning.title}
                  onChange={(e) => handleEarningChange(index, 'title', e.target.value)}
                  placeholder="Title"
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
                <input
                  type="number"
                  value={earning.amount}
                  onChange={(e) => handleEarningChange(index, 'amount', e.target.value)}
                  placeholder="Amount"
                  className="w-32 p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                  min="0"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      earnings: prev.earnings.filter((_, i) => i !== index)
                    }));
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Deductions Section */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Deductions</h2>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    deductions: [...prev.deductions, { title: '', amount: 0 }]
                  }));
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Add Deduction
              </button>
            </div>
            {formData.deductions.map((deduction, index) => (
              <div key={index} className="flex gap-4 mb-4">
                <input
                  type="text"
                  value={deduction.title}
                  onChange={(e) => handleDeductionChange(index, 'title', e.target.value)}
                  placeholder="Title"
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                />
                <input
                  type="number"
                  value={deduction.amount}
                  onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)}
                  placeholder="Amount"
                  className="w-32 p-2 border rounded focus:ring-2 focus:ring-[#E83A25] focus:border-transparent"
                  required
                  min="0"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      deductions: prev.deductions.filter((_, i) => i !== index)
                    }));
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="bg-[#E83A25] text-white px-6 py-3 rounded-lg hover:bg-[#D32F1D] transition-colors"
            >
              Preview Payslip
            </button>
            {showPreview && (
              <button
                type="button"
                onClick={handleDownload}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Download Image
              </button>
            )}
          </div>
        </form>
      </div>

      {showPreview && (
        <div className="mt-8">
          <div ref={payslipRef}>
            <PayslipPreview payslip={formData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipForm; 