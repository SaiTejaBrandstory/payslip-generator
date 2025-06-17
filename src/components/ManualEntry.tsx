'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { FormData, Earning, Deduction } from '@/types/payslip';
import Image from 'next/image';
import { numberToWords } from '@/utils/numberToWords';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PayslipPreview from './PayslipPreview';

interface PayslipData {
  companyLogo?: string;
  companyName: string;
  companyAddress: string;
  employeeName: string;
  designation: string;
  employeeId: string;
  dateOfBirth: string;
  panNumber: string;
  dateOfJoining: string;
  payPeriod: string;
  payDate: string;
  paidDays: number;
  lopDays: number;
  pfNumber: string;
  uan: string;
  earnings: Array<{ title: string; amount: number }>;
  deductions: Array<{ title: string; amount: number }>;
  netPay: number;
  amountInWords: string;
}

interface PayslipProps {
  data: PayslipData;
}

const Payslip: React.FC<PayslipProps> = ({ data }) => {
  const {
    companyLogo,
    companyName,
    companyAddress,
    employeeName,
    designation,
    employeeId,
    dateOfBirth,
    panNumber,
    dateOfJoining,
    payPeriod,
    payDate,
    paidDays,
    lopDays,
    pfNumber,
    uan,
    earnings = [],
    deductions = [],
    netPay = 0,
    amountInWords = ''
  } = data;

  const formatAmount = (num: number) => `₹${num}`;
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="p-8 bg-white max-w-4xl mx-auto text-sm font-sans leading-relaxed">
      {/* Header with Logo and Company Info */}
      <div className="flex items-start mb-8">
        {/* Logo on the left */}
        <div className="w-24 flex-shrink-0">
          {companyLogo && <img src={companyLogo} alt="Logo" className="w-full object-contain" />}
        </div>
        {/* Company Info */}
        <div className="ml-6">
          <h1 className="text-xl font-bold text-[#E83A25]">{companyName}</h1>
          <p className="text-gray-600">{companyAddress}</p>
        </div>
        {/* Pay Period on the right */}
        <div className="ml-auto text-right">
          <p className="text-gray-600">Payslip For the Month</p>
          <p className="text-[#E83A25] font-semibold">{payPeriod}</p>
        </div>
      </div>

      {/* Employee Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-x-32 gap-y-2">
          <p><span className="font-semibold">Employee Name:</span> {employeeName}</p>
          <p><span className="font-semibold">Designation:</span> {designation}</p>
          <p><span className="font-semibold">Employee ID:</span> {employeeId}</p>
          <p><span className="font-semibold">Date of Birth:</span> {dateOfBirth}</p>
          <p><span className="font-semibold">PAN Number:</span> {panNumber}</p>
          <p><span className="font-semibold">Date of Joining:</span> {dateOfJoining}</p>
          <p><span className="font-semibold">Pay Period:</span> {payPeriod}</p>
          <p><span className="font-semibold">Pay Date:</span> {payDate}</p>
          <p><span className="font-semibold">Paid Days:</span> {paidDays}</p>
          <p><span className="font-semibold">LOP Days:</span> {lopDays}</p>
        </div>

        <div className="flex justify-between text-sm mt-4">
          <p><span className="font-semibold">PF A/C Number:</span> {pfNumber}</p>
          <p><span className="font-semibold">UAN:</span> {uan}</p>
        </div>
      </div>

      {/* Earnings and Deductions Tables */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        {/* Earnings Table */}
        <div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#E83A25] text-white">
                <th className="text-left p-2">EARNINGS</th>
                <th className="text-right p-2">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((item, i) => (
                <tr key={i}>
                  <td className="p-2">{item.title}</td>
                  <td className="p-2 text-right">{formatAmount(item.amount)}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="p-2">GROSS EARNINGS</td>
                <td className="p-2 text-right">{formatAmount(totalEarnings)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deductions Table */}
        <div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#E83A25] text-white">
                <th className="text-left p-2">DEDUCTIONS</th>
                <th className="text-right p-2">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {deductions.map((item, i) => (
                <tr key={i}>
                  <td className="p-2">{item.title}</td>
                  <td className="p-2 text-right">{formatAmount(item.amount)}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="p-2">TOTAL DEDUCTIONS</td>
                <td className="p-2 text-right">{formatAmount(totalDeductions)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mt-8">
        <div className="flex justify-between font-bold">
          <p>GROSS EARNINGS</p>
          <p>{formatAmount(totalEarnings)}</p>
        </div>
        <div className="flex justify-between font-bold text-[#E83A25] mt-2">
          <p>TOTAL DEDUCTIONS</p>
          <p>{formatAmount(totalDeductions)}</p>
        </div>
        <div className="flex justify-between font-bold mt-4 pt-4 border-t border-gray-300">
          <p>NET PAY</p>
          <p className="text-[#E83A25]">{formatAmount(netPay)}</p>
        </div>
        <p className="mt-2 text-sm">Amount in Words: {amountInWords}</p>
      </div>

      <p className="text-center text-xs mt-8 italic">
        This is a computer-generated document. No signature is required.
      </p>
    </div>
  );
};

const formatMonth = (value: string) => {
  if (!value) return '';
  const [year, month] = value.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

const ManualEntry: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyLogo: '',
    companyAddress: '',
    companyCity: '',
    companyPincode: '',
    employeeName: '',
    designation: '',
    employeeId: '',
    dateOfBirth: '',
    panNumber: '',
    dateOfJoining: '',
    payPeriod: '',
    payDate: '',
    paidDays: 0,
    lopDays: 0,
    pfNumber: '',
    uan: '',
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

  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const payslipRef = useRef<HTMLDivElement>(null);
  const [customEmployeeFields, setCustomEmployeeFields] = useState<{ label: string; value: string }[]>([]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (1MB = 1024 * 1024 bytes)
    if (file.size > 1024 * 1024) {
      alert('File size must be less than 1MB');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData(prev => ({
        ...prev,
        companyLogo: result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEarningChange = (index: number, field: keyof Earning, value: string) => {
    setFormData(prev => {
      const newEarnings = [...prev.earnings];
      newEarnings[index] = {
        ...newEarnings[index],
        [field]: field === 'amount' ? Number(value) || 0 : value
      };
      return { ...prev, earnings: newEarnings };
    });
  };

  const handleDeductionChange = (index: number, field: keyof Deduction, value: string) => {
    setFormData(prev => {
      const newDeductions = [...prev.deductions];
      newDeductions[index] = {
        ...newDeductions[index],
        [field]: field === 'amount' ? Number(value) || 0 : value
      };
      return { ...prev, deductions: newDeductions };
    });
  };

  const calculateTotals = () => {
    const grossEarnings = formData.earnings.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = formData.deductions.reduce((sum, item) => sum + item.amount, 0);
    const netPay = grossEarnings - totalDeductions;
    return { grossEarnings, totalDeductions, netPay };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { grossEarnings, totalDeductions, netPay } = calculateTotals();
    setFormData(prevData => ({
      ...prevData,
      netPay,
      amountInWords: numberToWords(netPay)
    }));
    setShowPreview(true);
  };

  const getFileName = (payPeriod: string) => {
    if (!payPeriod || !formData.employeeName) return 'payslip';
    const [year, month] = payPeriod.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = date.toLocaleString('default', { month: 'long' }).toLowerCase();
    // Use hyphens and all lowercase, remove spaces in name
    return `${formData.employeeName.replace(/\s+/g, '-')}-${monthName}-${year}-payslip`.toLowerCase();
  };

  const handleDownload = async () => {
    if (!payslipRef.current) return;

    try {
      const canvas = await html2canvas(payslipRef.current, {
        useCORS: true,
        logging: false,
        background: '#ffffff',
        width: payslipRef.current.offsetWidth,
        height: payslipRef.current.offsetHeight,
        scale: 3
      } as any);

      const link = document.createElement('a');
      link.download = `${getFileName(formData.payPeriod)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Error generating PNG. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!payslipRef.current) return;

    try {
      const canvas = await html2canvas(payslipRef.current, {
        useCORS: true,
        logging: false,
        background: '#ffffff',
        width: payslipRef.current.offsetWidth,
        height: payslipRef.current.offsetHeight,
        scale: 3
      } as any);

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to maintain aspect ratio
      const imgWidth = 595.28; // A4 width in points
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      // Center horizontally only, start from top
      const xOffset = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
      const yOffset = 0; // Start from top of page

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      pdf.save(`${getFileName(formData.payPeriod)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleReset = () => {
    setFormData({
      companyName: '',
      companyLogo: '',
      companyAddress: '',
      companyCity: '',
      companyPincode: '',
      employeeName: '',
      designation: '',
      employeeId: '',
      dateOfBirth: '',
      panNumber: '',
      dateOfJoining: '',
      payPeriod: '',
      payDate: '',
      paidDays: 0,
      lopDays: 0,
      pfNumber: '',
      uan: '',
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
    setShowPreview(false);
  };

  const handleAddEarning = () => {
    setFormData(prev => ({
      ...prev,
      earnings: [...prev.earnings, { title: '', amount: 0 }]
    }));
  };

  const handleDeleteEarning = (index: number) => {
    setFormData(prev => ({
      ...prev,
      earnings: prev.earnings.filter((_, i) => i !== index)
    }));
  };

  const handleAddDeduction = () => {
    setFormData(prev => ({
      ...prev,
      deductions: [...prev.deductions, { title: '', amount: 0 }]
    }));
  };

  const handleDeleteDeduction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index)
    }));
  };

  const handleAddCustomEmployeeField = () => {
    setCustomEmployeeFields([...customEmployeeFields, { label: '', value: '' }]);
  };

  const handleCustomEmployeeFieldChange = (index: number, key: 'label' | 'value', val: string) => {
    setCustomEmployeeFields(fields => fields.map((f, i) => i === index ? { ...f, [key]: val } : f));
  };

  const handleRemoveCustomEmployeeField = (index: number) => {
    setCustomEmployeeFields(fields => fields.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent">
              Payslip Generator
            </h1>
            <p className="mt-2 text-gray-600">Generate professional payslips with ease</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Logo */}
            <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent">
                Company Logo
              </h2>
              <p className="text-sm text-gray-600 mb-4">Upload your company logo (240 x 240 pixels @ 72 DPI, max 1MB)</p>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  ref={fileInputRef}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] text-white px-4 py-2 rounded cursor-pointer hover:from-[#D32F1D] hover:to-[#E85F3D] transition-all duration-300"
                >
                  Upload Logo
                </label>
                {formData.companyLogo && (
                  <img src={formData.companyLogo} alt="Preview" className="w-16 h-auto object-contain" />
                )}
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent">
                Company Details
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input
                    type="text"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="companyCity"
                      value={formData.companyCity}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                    <input
                      type="text"
                      name="companyPincode"
                      value={formData.companyPincode}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Details */}
            <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent">
                Employee Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee Name</label>
                  <input
                    type="text"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Joining</label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    value={formData.dateOfJoining}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pay Period</label>
                  <input
                    type="month"
                    name="payPeriod"
                    value={formData.payPeriod}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pay Date</label>
                  <input
                    type="date"
                    name="payDate"
                    value={formData.payDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PF A/C Number</label>
                  <input
                    type="text"
                    name="pfNumber"
                    value={formData.pfNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">UAN</label>
                  <input
                    type="text"
                    name="uan"
                    value={formData.uan}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Paid Days</label>
                  <input
                    type="number"
                    name="paidDays"
                    value={formData.paidDays}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">LOP Days</label>
                  <input
                    type="number"
                    name="lopDays"
                    value={formData.lopDays}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                    min="0"
                  />
                </div>
                {customEmployeeFields.map((field, idx) => (
                  <div key={idx} className="flex gap-2 items-end mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Field Label</label>
                      <input
                        type="text"
                        placeholder="Field Label"
                        value={field.label}
                        onChange={e => handleCustomEmployeeFieldChange(idx, 'label', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Field Value</label>
                      <input
                        type="text"
                        placeholder="Field Value"
                        value={field.value}
                        onChange={e => handleCustomEmployeeFieldChange(idx, 'value', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomEmployeeField(idx)}
                      className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-2 py-1 rounded hover:from-red-600 hover:to-rose-600 transition-all duration-300 self-end"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleAddCustomEmployeeField}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                >
                  + Add Details
                </button>
              </div>
            </div>

            {/* Earnings */}
            <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent">
                  Earnings
                </h2>
                <button
                  type="button"
                  onClick={handleAddEarning}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded hover:from-emerald-600 hover:to-green-600 transition-all duration-300"
                >
                  Add Earning
                </button>
              </div>
              <div className="space-y-4">
                {formData.earnings.map((earning, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={earning.title}
                        onChange={(e) => handleEarningChange(index, 'title', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                        placeholder="Earning Title"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={earning.amount}
                        onChange={(e) => handleEarningChange(index, 'amount', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                        placeholder="Amount"
                        min="0"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteEarning(index)}
                      className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-2 rounded hover:from-red-600 hover:to-rose-600 transition-all duration-300"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Deductions */}
            <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent">
                  Deductions
                </h2>
                <button
                  type="button"
                  onClick={handleAddDeduction}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded hover:from-emerald-600 hover:to-green-600 transition-all duration-300"
                >
                  Add Deduction
                </button>
              </div>
              <div className="space-y-4">
                {formData.deductions.map((deduction, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={deduction.title}
                        onChange={(e) => handleDeductionChange(index, 'title', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                        placeholder="Deduction Title"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={deduction.amount}
                        onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#E83A25] focus:ring-[#E83A25]"
                        placeholder="Amount"
                        min="0"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDeduction(index)}
                      className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-2 rounded hover:from-red-600 hover:to-rose-600 transition-all duration-300"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] text-white rounded-lg hover:from-[#D32F1D] hover:to-[#E85F3D] transition-all duration-300"
              >
                Generate Payslip
              </button>
              {showPreview && (
                <>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                  >
                    Download PNG
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-300"
                  >
                    Download PDF
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Payslip Preview */}
          {showPreview && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-[#E83A25] to-[#FF6B4A] bg-clip-text text-transparent">
                Payslip Preview
              </h2>
              <div className="w-full max-w-[1200px] mx-auto bg-white-100 p-2" ref={payslipRef}>
                <div className="p-8 bg-white max-w-4xl mx-auto text-sm font-sans leading-relaxed">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-6">
                      {formData.companyLogo && (
                        <img src={formData.companyLogo} alt="Logo" className="w-16 h-auto object-contain" />
                      )}
                      {formData.companyName && (
                        <div className="space-y-2">
                          <h1 className="text-lg font-bold text-[#E83A25]">{formData.companyName}</h1>
                          <div className="leading-relaxed">
                            {formData.companyAddress && <p>{formData.companyAddress}</p>}
                            {formData.companyCity && <p>{formData.companyCity}</p>}
                            {formData.companyPincode && <p>{formData.companyPincode}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                    {formData.payPeriod && (
                      <div className="text-right">
                        <p className="text-xs mb-1">Payslip For the Month</p>
                        <p className="font-bold text-[#E83A25]">{formatMonth(formData.payPeriod)}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-6 rounded mb-8">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                      {formData.employeeName && (
                        <p className="leading-relaxed">
                          <strong>Employee Name:</strong> {formData.employeeName}
                        </p>
                      )}
                      {formData.designation && (
                        <p className="leading-relaxed">
                          <strong>Designation:</strong> {formData.designation}
                        </p>
                      )}
                      {formData.employeeId && (
                        <p className="leading-relaxed">
                          <strong>Employee ID:</strong> {formData.employeeId}
                        </p>
                      )}
                      {formData.dateOfBirth && (
                        <p className="leading-relaxed">
                          <strong>Date of Birth:</strong> {formData.dateOfBirth}
                        </p>
                      )}
                      {formData.panNumber && (
                        <p className="leading-relaxed">
                          <strong>PAN Number:</strong> {formData.panNumber}
                        </p>
                      )}
                      {formData.dateOfJoining && (
                        <p className="leading-relaxed">
                          <strong>Date of Joining:</strong> {formData.dateOfJoining}
                        </p>
                      )}
                      {formData.payPeriod && (
                        <p className="leading-relaxed">
                          <strong>Pay Period:</strong> {formatMonth(formData.payPeriod)}
                        </p>
                      )}
                      {formData.payDate && (
                        <p className="leading-relaxed">
                          <strong>Pay Date:</strong> {formData.payDate}
                        </p>
                      )}
                      {formData.paidDays > 0 && (
                        <p className="leading-relaxed">
                          <strong>Paid Days:</strong> {formData.paidDays}
                        </p>
                      )}
                      {formData.lopDays > 0 && (
                        <p className="leading-relaxed">
                          <strong>LOP Days:</strong> {formData.lopDays}
                        </p>
                      )}
                      {customEmployeeFields.filter(f => f.label && f.value).map((field, idx) => (
                        <p className="leading-relaxed" key={idx}>
                          <strong>{field.label}:</strong> {field.value}
                        </p>
                      ))}
                    </div>
                  </div>

                  {(formData.pfNumber || formData.uan) && (
                    <div className="my-8 flex justify-between text-sm leading-relaxed">
                      {formData.pfNumber && (
                        <p><strong>PF A/C Number:</strong> {formData.pfNumber}</p>
                      )}
                      {formData.uan && (
                        <p><strong>UAN:</strong> {formData.uan}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-8 mt-8">
                    <table className="w-full border text-left">
                      <thead className="bg-[#E83A25] text-white">
                        <tr>
                          <th className="px-4 py-2">EARNINGS</th>
                          <th className="px-4 py-2">AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {formData.earnings
                          .filter(item => item.title && item.amount > 0)
                          .map((item, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2 leading-relaxed">{item.title}</td>
                              <td className="px-4 py-2 leading-relaxed">₹{item.amount.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        <tr className="bg-gray-50 font-semibold">
                          <td className="px-4 py-2 leading-relaxed">GROSS EARNINGS</td>
                          <td className="px-4 py-2 leading-relaxed">₹{calculateTotals().grossEarnings.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>

                    <table className="w-full border text-left">
                      <thead className="bg-[#E83A25] text-white">
                        <tr>
                          <th className="px-4 py-2">DEDUCTIONS</th>
                          <th className="px-4 py-2">AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {/* Show Provident Fund first if it exists */}
                        {formData.deductions
                          .filter(item => item.title.toLowerCase().includes('provident fund') && item.amount > 0)
                          .map((item, i) => (
                            <tr key={i} className="bg-gray-50">
                              <td className="px-4 py-2 leading-relaxed font-medium">{item.title}</td>
                              <td className="px-4 py-2 leading-relaxed font-medium">₹{item.amount.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        {/* Show other deductions */}
                        {formData.deductions
                          .filter(item => !item.title.toLowerCase().includes('provident fund') && item.title && item.amount > 0)
                          .map((item, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2 leading-relaxed">{item.title}</td>
                              <td className="px-4 py-2 leading-relaxed">₹{item.amount.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        <tr className="bg-gray-50 font-semibold">
                          <td className="px-4 py-2 leading-relaxed">TOTAL DEDUCTIONS</td>
                          <td className="px-4 py-2 leading-relaxed">₹{calculateTotals().totalDeductions.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8 p-6 bg-gray-50 rounded">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-base">
                        <span className="font-medium">GROSS EARNINGS</span>
                        <span className="font-medium">₹{calculateTotals().grossEarnings.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-base text-red-600">
                        <span className="font-medium">TOTAL DEDUCTIONS</span>
                        <span className="font-medium">₹{calculateTotals().totalDeductions.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <strong className="text-lg">NET PAY</strong>
                        <strong className="text-lg text-[#E83A25]">
                          ₹{calculateTotals().netPay.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      {formData.amountInWords && (
                        <p className="text-sm leading-relaxed pt-2">
                          Amount in Words: <strong>{formData.amountInWords}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-center mt-8 italic leading-relaxed">
                    This is a computer-generated document. No signature is required.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualEntry;