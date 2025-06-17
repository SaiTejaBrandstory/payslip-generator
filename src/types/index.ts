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

export interface Earning {
  title: string;
  amount: number;
  ytd?: number;
}

export interface Deduction {
  title: string;
  amount: number;
  ytd?: number;
}

export interface Totals {
  grossEarnings: number;
  totalDeductions: number;
  netPayable: number;
  amountInWords: string;
}

export interface PayslipData {
  companyDetails: CompanyDetails;
  employeeDetails: EmployeeDetails;
  earnings: Earning[];
  deductions: Deduction[];
  totals: Totals;
} 