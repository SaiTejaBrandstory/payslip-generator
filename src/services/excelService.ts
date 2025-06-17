import { FormData } from '@/types/payslip';
import * as XLSX from 'xlsx';
import { numberToWords } from '@/utils/numberToWords';
import { Payslip } from '../types/payslip';

interface WorkbookImage {
  type: string;
  data: string;
}

interface ExtendedWBProps extends XLSX.WBProps {
  Images?: WorkbookImage[];
}

interface ExtendedWorkbook extends Omit<XLSX.WorkBook, 'Workbook'> {
  Workbook?: ExtendedWBProps;
}

const sampleEmployees = [
  {
    companyName: 'BrandStory Digital',
    companyAddress: '3rd floor, 5, 1st Cross Rd, K.R.Colony, Krishna Reddy Colony, Amarjyoti Layout, Domlur',
    companyCity: 'Bengaluru',
    companyPincode: '560071',
    employeeName: 'Ravi Kumar',
    employeeId: 'BSD0023',
    dateOfBirth: '1990-06-13',
    panNumber: 'ABCDE1234F',
    designation: 'Senior Developer',
    dateOfJoining: '2020-06-13',
    payPeriod: 'June 2023',
    payDate: '2023-06-30',
    pfNumber: '6534634346',
    uan: '363463',
    paidDays: 30,
    lopDays: 0,
    basic: 50000,
    hra: 25000,
    conveyance: 3000,
    medical: 1500,
    special: 15000,
    other: 5000,
    pf: 6000,
    profTax: 200,
    tds: 5000,
    leaveDeduction: 0
  },
  {
    companyName: 'PixelWave Solutions',
    companyAddress: '2nd Floor, 12, MG Road, Sector 18',
    companyCity: 'Noida',
    companyPincode: '201301',
    employeeName: 'Priya Singh',
    employeeId: 'BSD0024',
    dateOfBirth: '1992-08-15',
    panNumber: 'FGHIJ5678K',
    designation: 'UI/UX Designer',
    dateOfJoining: '2021-01-10',
    payPeriod: 'June 2023',
    payDate: '2023-06-30',
    pfNumber: '7645745745',
    uan: '474574',
    paidDays: 30,
    lopDays: 0,
    basic: 45000,
    hra: 22500,
    conveyance: 3000,
    medical: 1500,
    special: 12000,
    other: 4000,
    pf: 5400,
    profTax: 200,
    tds: 4000,
    leaveDeduction: 0
  },
  {
    companyName: 'NextGen Tech',
    companyAddress: 'Plot 8, IT Park, Hinjewadi',
    companyCity: 'Pune',
    companyPincode: '411057',
    employeeName: 'Arun Sharma',
    employeeId: 'BSD0025',
    dateOfBirth: '1988-12-25',
    panNumber: 'LMNOP9012Q',
    designation: 'Project Manager',
    dateOfJoining: '2019-03-15',
    payPeriod: 'June 2023',
    payDate: '2023-06-30',
    pfNumber: '8756856856',
    uan: '585685',
    paidDays: 28,
    lopDays: 2,
    basic: 70000,
    hra: 35000,
    conveyance: 3000,
    medical: 1500,
    special: 25000,
    other: 8000,
    pf: 8400,
    profTax: 200,
    tds: 8000,
    leaveDeduction: 5000
  },
  {
    companyName: 'BrandStory Digital',
    companyAddress: '3rd floor, 5, 1st Cross Rd, K.R.Colony, Krishna Reddy Colony, Amarjyoti Layout, Domlur',
    companyCity: 'Bengaluru',
    companyPincode: '560071',
    employeeName: 'Neha Patel',
    employeeId: 'BSD0026',
    dateOfBirth: '1993-04-20',
    panNumber: 'RSTUV3456W',
    designation: 'Business Analyst',
    dateOfJoining: '2021-07-01',
    payPeriod: 'June 2023',
    payDate: '2023-06-30',
    pfNumber: '9867967967',
    uan: '696796',
    paidDays: 30,
    lopDays: 0,
    basic: 40000,
    hra: 20000,
    conveyance: 3000,
    medical: 1500,
    special: 10000,
    other: 3000,
    pf: 4800,
    profTax: 200,
    tds: 3000,
    leaveDeduction: 0
  },
  {
    companyName: 'PixelWave Solutions',
    companyAddress: '2nd Floor, 12, MG Road, Sector 18',
    companyCity: 'Noida',
    companyPincode: '201301',
    employeeName: 'Rahul Verma',
    employeeId: 'BSD0027',
    dateOfBirth: '1991-10-05',
    panNumber: 'WXYZA7890B',
    designation: 'QA Engineer',
    dateOfJoining: '2020-11-15',
    payPeriod: 'June 2023',
    payDate: '2023-06-30',
    pfNumber: '1078078078',
    uan: '707807',
    paidDays: 30,
    lopDays: 0,
    basic: 42000,
    hra: 21000,
    conveyance: 3000,
    medical: 1500,
    special: 11000,
    other: 3500,
    pf: 5040,
    profTax: 200,
    tds: 3500,
    leaveDeduction: 0
  },
  {
    companyName: 'NextGen Tech',
    companyAddress: 'Plot 8, IT Park, Hinjewadi',
    companyCity: 'Pune',
    companyPincode: '411057',
    employeeName: 'Anjali Gupta',
    employeeId: 'BSD0028',
    dateOfBirth: '1994-02-28',
    panNumber: 'BCDEF4567G',
    designation: 'Frontend Developer',
    dateOfJoining: '2022-01-10',
    payPeriod: 'June 2023',
    payDate: '2023-06-30',
    pfNumber: '1189189189',
    uan: '818918',
    paidDays: 30,
    lopDays: 0,
    basic: 45000,
    hra: 22500,
    conveyance: 3000,
    medical: 1500,
    special: 12000,
    other: 4000,
    pf: 5400,
    profTax: 200,
    tds: 4000,
    leaveDeduction: 0
  },
  {
    companyName: 'BrandStory Digital',
    companyAddress: '3rd floor, 5, 1st Cross Rd, K.R.Colony, Krishna Reddy Colony, Amarjyoti Layout, Domlur',
    companyCity: 'Bengaluru',
    companyPincode: '560071',
    employeeName: 'Vikram Malhotra',
    employeeId: 'BSD0029',
    dateOfBirth: '1987-07-15',
    panNumber: 'GHIJK8901L',
    designation: 'DevOps Engineer',
    dateOfJoining: '2019-08-20',
    payPeriod: 'June 2023',
    payDate: '2023-06-30',
    pfNumber: '1290290290',
    uan: '929029',
    paidDays: 29,
    lopDays: 1,
    basic: 60000,
    hra: 30000,
    conveyance: 3000,
    medical: 1500,
    special: 20000,
    other: 6000,
    pf: 7200,
    profTax: 200,
    tds: 6000,
    leaveDeduction: 2000
  },
  {
    companyName: 'PixelWave Solutions',
    companyAddress: '2nd Floor, 12, MG Road, Sector 18',
    companyCity: 'Noida',
    companyPincode: '201301',
    employeeName: 'Meera Krishnan',
    employeeId: 'BSD0030',
    dateOfBirth: '1992-11-30',
    panNumber: 'MNOPQ2345R',
    designation: 'Backend Developer',
    dateOfJoining: '2021-04-05',
    payPeriod: 'June 2023',
    payDate: '2023-06-30',
    pfNumber: '1301301301',
    uan: '030130',
    paidDays: 30,
    lopDays: 0,
    basic: 48000,
    hra: 24000,
    conveyance: 3000,
    medical: 1500,
    special: 13000,
    other: 4500,
    pf: 5760,
    profTax: 200,
    tds: 4500,
    leaveDeduction: 0
  },
  {
    companyName: 'BrandStory Digital',
    companyAddress: '3rd floor, 5, 1st Cross Rd, K.R.Colony, Krishna Reddy Colony, Amarjyoti Layout, Domlur',
    companyCity: 'Bengaluru',
    companyPincode: '560071',
    employeeName: 'Sanjay Mehta',
    employeeId: 'BSD0031',
    dateOfBirth: '1989-09-22',
    panNumber: 'STUVW5678X',
    designation: 'System Architect',
    dateOfJoining: '2018-12-01',
    payPeriod: 'June 2023',
    payDate: '2023-06-30',
    pfNumber: '1412412412',
    uan: '141241',
    paidDays: 30,
    lopDays: 0,
    basic: 75000,
    hra: 37500,
    conveyance: 3000,
    medical: 1500,
    special: 28000,
    other: 9000,
    pf: 9000,
    profTax: 200,
    tds: 9000,
    leaveDeduction: 0
  },
  {
    companyName: 'BrandStory Digital',
    companyAddress: '3rd floor, 5, 1st Cross Rd, K.R.Colony, Krishna Reddy Colony, Amarjyoti Layout, Domlur',
    companyCity: 'Bengaluru',
    companyPincode: '560071',
    employeeName: 'Pooja Reddy',
    employeeId: 'BSD0032',
    dateOfBirth: '1993-01-15',
    panNumber: 'YZABC9012D',
    designation: 'Product Manager',
    dateOfJoining: '2020-02-15',
    payPeriod: 'June 2023',
    payDate: '2023-06-30',
    pfNumber: '1523523523',
    uan: '252352',
    paidDays: 30,
    lopDays: 0,
    basic: 65000,
    hra: 32500,
    conveyance: 3000,
    medical: 1500,
    special: 22000,
    other: 7000,
    pf: 7800,
    profTax: 200,
    tds: 7000,
    leaveDeduction: 0
  }
];

export const generateTemplate = () => {
  // Create headers
  const headers = [
    'COMPANY NAME',
    'STREET ADDRESS',
    'CITY',
    'PINCODE',
    'EMPLOYEE NAME',
    'EMPLOYEE ID',
    'DATE OF BIRTH',
    'PAN NUMBER',
    'DESIGNATION',
    'DATE OF JOINING',
    'PAY PERIOD',
    'PAY DATE',
    'PF A/C NUMBER',
    'UAN',
    'PAID DAYS',
    'LOP DAYS',
    'BASIC',
    'HRA',
    'CONVEYANCE',
    'MEDICAL ALLOWANCE',
    'SPECIAL ALLOWANCE',
    'OTHER ALLOWANCE',
    'PF',
    'PROFESSIONAL TAX',
    'TDS',
    'LEAVE DEDUCTION'
  ];

  // Create rows from sample data
  const rows = sampleEmployees.map(emp => [
    emp.companyName,
    emp.companyAddress,
    emp.companyCity,
    emp.companyPincode,
    emp.employeeName,
    emp.employeeId,
    emp.dateOfBirth,
    emp.panNumber,
    emp.designation,
    emp.dateOfJoining,
    emp.payPeriod,
    emp.payDate,
    emp.pfNumber,
    emp.uan,
    emp.paidDays,
    emp.lopDays,
    emp.basic,
    emp.hra,
    emp.conveyance,
    emp.medical,
    emp.special,
    emp.other,
    emp.pf,
    emp.profTax,
    emp.tds,
    emp.leaveDeduction
  ]);

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  const cols = headers.map(() => ({ wch: 15 }));
  worksheet['!cols'] = cols;

  // Style the headers
  const headerStyle = {
    font: { bold: true, name: 'system-ui', color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "E83A25" } },
    alignment: { horizontal: "center", vertical: "center" }
  };

  // Apply styles to headers
  const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1');
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ r: 0, c: C });
    worksheet[address].s = headerStyle;
  }

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payslip Data');

  // Write to buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Create Blob and trigger download
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'payslip-template.xlsx';
  link.click();
  window.URL.revokeObjectURL(url);
};

export const parseExcelFile = async (file: File): Promise<FormData[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data) as ExtendedWorkbook;
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Convert to array of objects with header row as keys
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  // Get the company logo from the workbook
  let logoUrl = '';
  if (workbook.Workbook?.Images?.[0]) {
    const image = workbook.Workbook.Images[0];
    logoUrl = `data:${image.type};base64,${image.data}`;
  }

  return jsonData.map((row: any) => {
    const earnings = [
      { title: 'Basic', amount: Number(row['BASIC']) || 0 },
      { title: 'HRA', amount: Number(row['HRA']) || 0 },
      { title: 'Conveyance', amount: Number(row['CONVEYANCE']) || 0 },
      { title: 'Medical Allowance', amount: Number(row['MEDICAL ALLOWANCE']) || 0 },
      { title: 'Special Allowance', amount: Number(row['SPECIAL ALLOWANCE']) || 0 },
      { title: 'Other Allowance', amount: Number(row['OTHER ALLOWANCE']) || 0 }
    ].filter(item => item.amount > 0); // Only include non-zero amounts

    const deductions = [
      { title: 'PF', amount: Number(row['PF']) || 0 },
      { title: 'Professional Tax', amount: Number(row['PROFESSIONAL TAX']) || 0 },
      { title: 'TDS', amount: Number(row['TDS']) || 0 },
      { title: 'Leave Deduction', amount: Number(row['LEAVE DEDUCTION']) || 0 }
    ].filter(item => item.amount > 0); // Only include non-zero amounts

    const netPay = earnings.reduce((sum, e) => sum + e.amount, 0) -
                  deductions.reduce((sum, d) => sum + d.amount, 0);

    return {
      companyName: row['COMPANY NAME'] || '',
      companyAddress: row['STREET ADDRESS'] || '',
      companyCity: row['CITY'] || '',
      companyPincode: row['PINCODE'] || '',
      employeeName: row['EMPLOYEE NAME'] || '',
      employeeId: row['EMPLOYEE ID'] || '',
      dateOfBirth: row['DATE OF BIRTH'] || '',
      panNumber: row['PAN NUMBER'] || '',
      designation: row['DESIGNATION'] || '',
      dateOfJoining: row['DATE OF JOINING'] || '',
      payPeriod: row['PAY PERIOD'] || '',
      payDate: row['PAY DATE'] || '',
      pfNumber: row['PF A/C NUMBER'] || '',
      uan: row['UAN'] || '',
      paidDays: Number(row['PAID DAYS']) || 0,
      lopDays: Number(row['LOP DAYS']) || 0,
      earnings,
      deductions,
      netPay,
      amountInWords: numberToWords(netPay),
      companyLogo: '', // This will be set by the ExcelUpload component
    };
  });
};

export const processExcelFile = async (file: File): Promise<Payslip[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' }) as ExtendedWorkbook;
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Get the company logo from the workbook
        let logoUrl = '';
        if (workbook.Workbook?.Images?.[0]) {
          const image = workbook.Workbook.Images[0];
          const imageData = image.data;
          logoUrl = `data:${image.type};base64,${imageData}`;
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const payslips: Payslip[] = jsonData.map((row: any) => ({
          employeeName: row['EMPLOYEE NAME'] || '',
          employeeId: row['EMPLOYEE ID'] || '',
          designation: row['DESIGNATION'] || '',
          dateOfBirth: row['DATE OF BIRTH'] || '',
          panNumber: row['PAN NUMBER'] || '',
          dateOfJoining: row['DATE OF JOINING'] || '',
          payPeriod: row['PAY PERIOD'] || '',
          payDate: row['PAY DATE'] || '',
          pfNumber: row['PF A/C NUMBER'] || '',
          uan: row['UAN'] || '',
          paidDays: parseFloat(row['PAID DAYS']) || 0,
          lopDays: parseFloat(row['LOP DAYS']) || 0,
          basicSalary: parseFloat(row['BASIC']) || 0,
          houseRentAllowance: parseFloat(row['HRA']) || 0,
          conveyanceAllowance: parseFloat(row['CONVEYANCE']) || 0,
          medicalAllowance: parseFloat(row['MEDICAL ALLOWANCE']) || 0,
          specialAllowance: parseFloat(row['SPECIAL ALLOWANCE']) || 0,
          otherAllowance: parseFloat(row['OTHER ALLOWANCE']) || 0,
          providentFund: parseFloat(row['PF']) || 0,
          professionalTax: parseFloat(row['PROFESSIONAL TAX']) || 0,
          incomeTax: parseFloat(row['TDS']) || 0,
          leaveDeduction: parseFloat(row['LEAVE DEDUCTION']) || 0,
          grossEarnings: 0, // Will be calculated
          totalDeductions: 0, // Will be calculated
          netPay: 0, // Will be calculated
          companyLogo: logoUrl || '/logo.png',
        }));

        // Calculate totals for each payslip
        payslips.forEach(p => {
          p.grossEarnings = p.basicSalary + p.houseRentAllowance + p.conveyanceAllowance + 
                           p.medicalAllowance + p.specialAllowance + p.otherAllowance;
          p.totalDeductions = p.providentFund + p.professionalTax + p.incomeTax + p.leaveDeduction;
          p.netPay = p.grossEarnings - p.totalDeductions;
        });

        resolve(payslips);
      } catch (error) {
        reject(new Error('Error processing Excel file: ' + error));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading Excel file'));
    };

    reader.readAsArrayBuffer(file);
  });
}; 