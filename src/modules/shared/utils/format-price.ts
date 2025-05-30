//fomat number in table list
export const formatPrice = (num: number | undefined): string => {
  if (num === undefined || num === null) return '';
  return new Intl.NumberFormat('en-US').format(num);
};

//fomat number on form
export const parsePrice = (str: string): number | undefined => {
  const cleaned = str.replace(/,/g, '');
  const num = Number(cleaned);
  return isNaN(num) ? undefined : num;
};
//can enter 0 - 9 only
export const NumberOnly = (evt: KeyboardEvent): void => {
  const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
  if (!allowedKeys.includes(evt.key)) {
    evt.preventDefault();
  }
};


