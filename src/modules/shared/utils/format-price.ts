//fomat number in table list
export const formatPrice = (num: number | undefined): string => {
  if (num === undefined || num === null) return '';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(num);
};

//fomat number on form
export const parsePrice = (str: string): number | undefined => {
  const cleaned = str.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
};
//can enter 0 - 9 only
export const NumberOnly = (evt: KeyboardEvent, currentValue: string): void => {
  const allowedKeys = [
    '0','1','2','3','4','5','6','7','8','9',
    '.', 'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'
  ];

  // allow only one dot
  if (evt.key === '.' && currentValue.includes('.')) {
    evt.preventDefault();
    return;
  }

  if (!allowedKeys.includes(evt.key)) {
    evt.preventDefault();
  }
};



