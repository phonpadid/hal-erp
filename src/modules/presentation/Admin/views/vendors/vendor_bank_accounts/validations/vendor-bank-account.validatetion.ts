import type { Rule } from "ant-design-vue/es/form";

export const createVendorBankAccountValidation = (
  t: (key: string) => string
): Record<string, Rule[]> => {
  return {
    vendor_id: [
      {
        required: true,
        message: t("vendors_bank.validation.vendorRequired"),
      },
    ],
    currency_id: [
      {
        required: true,
        message: t("vendors_bank.validation.currencyRequired"),
      },
    ],
    bank_id: [
      {
        required: true,
        message: t("vendors_bank.validation.bankNameRequired"),
      },
      {
        max: 100,
        message: t("vendors_bank.validation.bankNameMax"),
      },
    ],
    account_name: [
      {
        required: true,
        message: t("vendors_bank.validation.accountNameRequired"),
      },
      {
        max: 100,
        message: t("vendors_bank.validation.accountNameMax"),
      },
    ],
    account_number: [
      {
        required: true,
        message: t("vendors_bank.validation.accountNumberRequired"),
      },
      {
        pattern: /^\d+$/,
        message: t("vendors_bank.validation.accountNumberFormat"),
      },
      {
        max: 20,
        message: t("vendors_bank.validation.accountNumberMax"),
      },
    ],
  };
};
