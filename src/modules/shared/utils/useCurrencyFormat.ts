export function useCurrencyFormat() {
  const formatCurrency = (
    value: number,
    options: {
      currency?: string;
      locale?: string;
      showSymbol?: boolean;
      decimals?: number;
    } = {}
  ) => {
    const {
      currency = 'LAK',
      locale = 'lo-LA',
      showSymbol = true,
      decimals = 0
    } = options;

    try {
      const formatted = new Intl.NumberFormat(locale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);

      if (!showSymbol && currency) {
        return `${formatted} ${currency}`;
      }

      return formatted;
    } catch (error) {
      console.error('Error formatting currency:', error);
      return value.toString();
    }
  };

  return {
    formatCurrency
  };
}
