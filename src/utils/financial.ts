export const financial = (amount: string | number): number => {
  if (typeof amount === 'string') {
    return Number(Number.parseFloat(amount).toFixed(2));
  }

  return Number(amount.toFixed(2));
};
