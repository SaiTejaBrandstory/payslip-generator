'use client';

import React from 'react';
import { FormData } from '@/types/payslip';
import Image from 'next/image';

interface PayslipPreviewProps {
  payslip: FormData;
}

const formatMonth = (date: string) => {
  try {
    const [year, month] = date.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  } catch {
    return date;
  }
};

const PayslipPreview = ({ payslip }: PayslipPreviewProps) => {
  const totalEarnings = payslip.earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = payslip.deductions.reduce((sum, item) => sum + item.amount, 0);

  // Calculate max rows needed for tables
  const maxRows = Math.max(payslip.earnings.length, payslip.deductions.length);
  const earningRows = payslip.earnings.filter(item => item.title && item.amount > 0);
  const deductionRows = payslip.deductions.filter(item => item.title && item.amount > 0);
  const emptyEarningRows = maxRows - earningRows.length;
  const emptyDeductionRows = maxRows - deductionRows.length;

  return (
    <div className="p-8 bg-white max-w-4xl mx-auto text-sm font-['system-ui'] leading-relaxed">
      {/* Header with Logo and Company Info */}
      <div className="flex justify-between items-start mb-8 font-['system-ui']">
        <div className="flex items-center space-x-6 font-['system-ui']">
          <div className="w-16 h-16 relative flex-shrink-0">
            {payslip.companyLogo && (
              <img 
                src={payslip.companyLogo} 
                alt="Company Logo" 
                className="w-full h-full object-contain"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>
          <div className="space-y-1 font-['system-ui']">
            <h1 className="text-lg font-bold text-[#E83A25] font-['system-ui']">{payslip.companyName}</h1>
            <div className="text-gray-600 font-['system-ui']">
              {payslip.companyAddress && <p>{payslip.companyAddress}</p>}
              {payslip.companyCity && <p>{payslip.companyCity}</p>}
              {payslip.companyPincode && <p>{payslip.companyPincode}</p>}
            </div>
          </div>
        </div>
        <div className="text-right font-['system-ui']">
          <p className="text-xs text-gray-600 font-['system-ui']">Payslip For the Month</p>
          <p className="font-bold text-[#E83A25] font-['system-ui']">{formatMonth(payslip.payPeriod)}</p>
        </div>
      </div>

      {/* Employee Details */}
      <div className="bg-gray-50 p-6 rounded mb-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 font-['system-ui']">
          <p><span className="font-bold">Employee Name:</span> {payslip.employeeName}</p>
          <p><span className="font-bold">Designation:</span> {payslip.designation}</p>
          <p><span className="font-bold">Employee ID:</span> {payslip.employeeId}</p>
          <p><span className="font-bold">Date of Birth:</span> {payslip.dateOfBirth}</p>
          <p><span className="font-bold">PAN Number:</span> {payslip.panNumber}</p>
          <p><span className="font-bold">Date of Joining:</span> {payslip.dateOfJoining}</p>
          <p><span className="font-bold">Pay Period:</span> {formatMonth(payslip.payPeriod)}</p>
          <p><span className="font-bold">Pay Date:</span> {payslip.payDate}</p>
          <p><span className="font-bold">Paid Days:</span> {payslip.paidDays}</p>
          <p><span className="font-bold">LOP Days:</span> {payslip.lopDays}</p>
        </div>
      </div>

      {/* PF and UAN */}
      <div className="flex justify-between text-sm mb-8 font-['system-ui']">
        <p><span className="font-bold">PF A/C Number:</span> {payslip.pfNumber}</p>
        <p><span className="font-bold">UAN:</span> {payslip.uan}</p>
      </div>

      {/* Earnings and Deductions Tables */}
      <div className="flex justify-between gap-4 mb-6">
        {/* Earnings Table */}
        <div className="flex-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left font-bold">Earnings</th>
                <th className="border p-2 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="h-full">
              {earningRows.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">{item.title}</td>
                  <td className="border p-2 text-right">₹{item.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {/* Add empty rows to match deductions length */}
              {deductionRows.length > earningRows.length && 
                Array(deductionRows.length - earningRows.length)
                  .fill(null)
                  .map((_, index) => (
                    <tr key={`empty-${index}`}>
                      <td className="border p-2">&nbsp;</td>
                      <td className="border p-2">&nbsp;</td>
                    </tr>
                  ))
              }
              <tr className="bg-gray-100 font-bold">
                <td className="border p-2">Total Earnings</td>
                <td className="border p-2 text-right">₹{totalEarnings.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deductions Table */}
        <div className="flex-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left font-bold">Deductions</th>
                <th className="border p-2 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="h-full">
              {deductionRows.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">{item.title}</td>
                  <td className="border p-2 text-right">₹{item.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {/* Add empty rows to match earnings length */}
              {earningRows.length > deductionRows.length && 
                Array(earningRows.length - deductionRows.length)
                  .fill(null)
                  .map((_, index) => (
                    <tr key={`empty-${index}`}>
                      <td className="border p-2">&nbsp;</td>
                      <td className="border p-2">&nbsp;</td>
                    </tr>
                  ))
              }
              <tr className="bg-gray-100 font-bold">
                <td className="border p-2">Total Deductions</td>
                <td className="border p-2 text-right">₹{totalDeductions.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Net Pay */}
      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <p className="font-bold">NET PAY: ₹{payslip.netPay.toLocaleString('en-IN')}</p>
            <p className="text-gray-600 italic">Amount in Words: {payslip.amountInWords}</p>
          </div>
        </div>
        <p className="text-center text-gray-500 text-xs mt-8">This is a computer-generated document. No signature is required.</p>
      </div>
    </div>
  );
};

export default PayslipPreview; 