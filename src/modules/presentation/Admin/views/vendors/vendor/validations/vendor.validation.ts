/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Vendor Validation Rules
 * @created 2025-05-29 08:45:20
 * @author phonpadid
 */
import type { Rule } from "ant-design-vue/es/form";
import type { ValidateState } from "@/modules/shared/validations/types";

export const createVendorValidation = (
  t: (key: string) => string,
  state?: ValidateState
): Record<string, Rule[]> => {
  return {
    name: [
      {
        required: true,
        message: t("vendors.validation.nameRequired"),
      },
      {
        min: 2,
        message: t("vendors.validation.nameMin"),
      },
      {
        max: 100,
        message: t("vendors.validation.nameMax"),
      },
      {
        validator: async (_rule: Rule, value: string) => {
          if (value && /[<>]/.test(value)) {
            throw new Error(t("vendors.validation.nameInvalidChars"));
          }
        },
      },
    ],
    contact_info: [
      {
        required: true,
        message: t("vendors.validation.contactInfoRequired"),
      },
      {
        max: 500,
        message: t("vendors.validation.contactInfoMax"),
      },
      {
        validator: async (_rule: Rule, value: string) => {
          if (value && /[<>]/.test(value)) {
            throw new Error(t("vendors.validation.contactInfoInvalidChars"));
          }
        },
      },
    ],
    vendor_bank_account: [
      {
        type: "array",
        defaultField: {
          type: "object",
          required: true,
          validator: (_rule: Rule, value: any) => {
            if (!value.currency_id) {
              return Promise.reject(t("vendors.validation.currencyRequired"));
            }
            if (!value.bank_name) {
              return Promise.reject(t("vendors.validation.bankNameRequired"));
            }
            return Promise.resolve();
          },
        },
      },
    ],
  };
};

// Helper validation functions
export const isValidBankName = (name: string): boolean => {
  return name.length > 0 && name.length <= 100 && !/[<>]/.test(name);
};

export const isValidAccountName = (name: string): boolean => {
  return name.length > 0 && name.length <= 100 && !/[<>]/.test(name);
};

export const isValidAccountNumber = (number: string): boolean => {
  return number.length > 0 && number.length <= 50 && /^[0-9-]+$/.test(number);
};

// เพิ่ม translations สำหรับ bank account validations
export const vendorValidationMessages = {
  en: {
    vendors: {
      validation: {
        // ... existing messages
        currencyRequired: "Please select a currency",
        bankNameRequired: "Please enter bank name",
        bankNameMax: "Bank name cannot exceed 100 characters",
        bankNameInvalidChars: "Bank name contains invalid characters",
        accountNameRequired: "Please enter account name",
        accountNameMax: "Account name cannot exceed 100 characters",
        accountNameInvalidChars: "Account name contains invalid characters",
        accountNumberRequired: "Please enter account number",
        accountNumberMax: "Account number cannot exceed 50 characters",
        accountNumberInvalidChars: "Account number can only contain numbers and hyphens",
      },
    },
  },
  la: {
    vendors: {
      validation: {
        currencyRequired: "ກະລຸນາເລືອກສະກຸນເງິນ",
        bankNameRequired: "ກະລຸນາປ້ອນຊື່ທະນາຄານ",
        bankNameMax: "ຊື່ທະນາຄານບໍ່ສາມາດເກີນ 100 ຕົວອັກສອນ",
        bankNameInvalidChars: "ຊື່ທະນາຄານມີຕົວອັກສອນທີ່ບໍ່ຖືກຕ້ອງ",
        accountNameRequired: "ກະລຸນາປ້ອນຊື່ບັນຊີ",
        accountNameMax: "ຊື່ບັນຊີບໍ່ສາມາດເກີນ 100 ຕົວອັກສອນ",
        accountNameInvalidChars: "ຊື່ບັນຊີມີຕົວອັກສອນທີ່ບໍ່ຖືກຕ້ອງ",
        accountNumberRequired: "ກະລຸນາປ້ອນເລກບັນຊີ",
        accountNumberMax: "ເລກບັນຊີບໍ່ສາມາດເກີນ 50 ຕົວອັກສອນ",
        accountNumberInvalidChars: "ເລກບັນຊີສາມາດມີແຕ່ຕົວເລກແລະເຄື່ອງໝາຍຂີດເທົ່ານັ້ນ",
      },
    },
  },
};
