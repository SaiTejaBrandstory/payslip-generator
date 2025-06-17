'use client';

import { useState, useRef } from 'react';
import { PayslipData, Earning, Deduction } from '@/types/payslip';

const ManualEntry = () => {
  const [logo, setLogo] = useState<string>('');
  const [earnings, setEarnings] = useState<Earning[]>([
    { title: 'Basic', amount: 0 },
    { title: 'House Rent Allowance', amount: 0 },
  ]);
  const [deductions, setDeductions] = useState<Deduction[]>([
    { title: 'Income Tax', amount: 0 },
    { title: 'Provident Fund', amount: 0 },
  ]);
  const [additionalFields, setAdditionalFields] = useState<{ title: string; value: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File size must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addEarning = () => {
    setEarnings([...earnings, { title: '', amount: 0 }]);
  };

  const addDeduction = () => {
    setDeductions([...deductions, { title: '', amount: 0 }]);
  };

  const addField = () => {
    setAdditionalFields([...additionalFields, { title: '', value: '' }]);
  };

  const calculateTotals = () => {
    const grossEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
    const totalDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    return {
      grossEarnings,
      totalDeductions,
      netPayable: grossEarnings - totalDeductions
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const { grossEarnings, totalDeductions, netPayable } = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Logo Upload */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Upload Logo (240 x 240 pixels @ 72 DPI, Maximum size of 1MB)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Choose File
          </button>
          {logo && (
            <div className="w-24 h-24">
              <img
                src={logo}
                alt="Company Logo"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Company Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Company Name*</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Company Address</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Employee Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Employee Name*</label>
          <input
            type="text"
            required
            placeholder="Eg: Meera Krishnan"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Employee ID*</label>
          <input
            type="text"
            required
            placeholder="Eg: 1234"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Earnings Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Income Details*</h3>
        <div className="space-y-4">
          {earnings.map((earning, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={earning.title}
                onChange={(e) => {
                  const newEarnings = [...earnings];
                  newEarnings[index].title = e.target.value;
                  setEarnings(newEarnings);
                }}
                placeholder="Earning Title"
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="number"
                value={earning.amount}
                onChange={(e) => {
                  const newEarnings = [...earnings];
                  newEarnings[index].amount = Number(e.target.value);
                  setEarnings(newEarnings);
                }}
                placeholder="Amount"
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addEarning}
            className="text-blue-600 hover:text-blue-700"
          >
            + Add Earnings
          </button>
        </div>
      </div>

      {/* Deductions Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Deductions</h3>
        <div className="space-y-4">
          {deductions.map((deduction, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={deduction.title}
                onChange={(e) => {
                  const newDeductions = [...deductions];
                  newDeductions[index].title = e.target.value;
                  setDeductions(newDeductions);
                }}
                placeholder="Deduction Title"
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="number"
                value={deduction.amount}
                onChange={(e) => {
                  const newDeductions = [...deductions];
                  newDeductions[index].amount = Number(e.target.value);
                  setDeductions(newDeductions);
                }}
                placeholder="Amount"
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addDeduction}
            className="text-blue-600 hover:text-blue-700"
          >
            + Add Deductions
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex justify-between">
          <span>Gross Earnings:</span>
          <span>₹ {grossEarnings}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Deductions:</span>
          <span>₹ {totalDeductions}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Net Payable:</span>
          <span>₹ {netPayable}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate Payslip
        </button>
        <button
          type="reset"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default ManualEntry; 