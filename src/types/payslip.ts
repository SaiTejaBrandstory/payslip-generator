export interface Earning {
  title: string;
  amount: number;
}

export interface Deduction {
  title: string;
  amount: number;
}

export interface AdditionalField {
  label: string;
  value: string;
}

export interface CompanyDetails {
  name: string;
  address: string;
  city: string;
  pincode: string;
  logo?: string;
}

export interface EmployeeDetails {
  name: string;
  id: string;
  designation: string;
  joiningDate: string;
  payPeriod: string;
  payDate: string;
  paidDays: number;
  lossOfPayDays: number;
  pfNumber?: string;
  uan?: string;
}

export interface Totals {
  grossEarnings: number;
  totalDeductions: number;
  netPayable: number;
  amountInWords: string;
}

export interface FormData {
  employeeName: string;
  employeeId: string;
  designation: string;
  panNumber: string;
  dateOfBirth: string;
  dateOfJoining: string;
  payDate: string;
  payPeriod: string;
  paidDays: number;
  lopDays: number;
  pfNumber: string;
  uan: string;
  companyName: string;
  companyLogo: string;
  companyAddress: string;
  companyCity: string;
  companyPincode: string;
  earnings: { title: string; amount: number }[];
  deductions: { title: string; amount: number }[];
  netPay: number;
  amountInWords: string;
}

export interface PayslipData {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  designation: string;
  payPeriod: string;
  basicSalary: number;
  hra: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  pf: number;
  professionalTax: number;
  tds: number;
  paidDays: number;
  lopDays: number;
  netPay?: number;
  amountInWords?: string;
  companyName?: string;
  companyLogo?: string;
  earnings?: {
    basic: number;
    hra: number;
    conveyance: number;
    medical: number;
    special: number;
  };
  deductions?: {
    pf: number;
    professionalTax: number;
    tds: number;
  };
  totals?: {
    grossEarnings: number;
    totalDeductions: number;
    netPayable: number;
  };
}

export interface Payslip {
  employeeName: string;
  employeeId: string;
  designation: string;
  department?: string;
  dateOfBirth: string;
  panNumber: string;
  dateOfJoining: string;
  payPeriod: string;
  payDate: string;
  pfNumber: string;
  uan: string;
  paidDays: number;
  lopDays: number;
  bankName?: string;
  accountNumber?: string;
  basicSalary: number;
  houseRentAllowance: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  otherAllowance: number;
  bonus?: number;
  grossEarnings: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  leaveDeduction: number;
  totalDeductions: number;
  netPay: number;
  companyLogo: string;
} 