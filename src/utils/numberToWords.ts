const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

const convertLessThanOneThousand = (num: number): string => {
  if (num === 0) {
    return '';
  }

  if (num < 20) {
    return ones[num];
  }

  if (num < 100) {
    return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  }

  return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + convertLessThanOneThousand(num % 100) : '');
};

export const numberToWords = (num: number): string => {
  if (num === 0) {
    return 'Zero';
  }

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  let result = '';

  if (crore > 0) {
    result += convertLessThanOneThousand(crore) + ' Crore ';
  }

  if (lakh > 0) {
    result += convertLessThanOneThousand(lakh) + ' Lakh ';
  }

  if (thousand > 0) {
    result += convertLessThanOneThousand(thousand) + ' Thousand ';
  }

  if (remainder > 0) {
    result += convertLessThanOneThousand(remainder);
  }

  return 'Indian Rupee ' + result.trim() + ' Only';
}; 