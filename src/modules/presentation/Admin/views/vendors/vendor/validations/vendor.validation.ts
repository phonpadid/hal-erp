/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Rule } from "ant-design-vue/es/form";
import type { ValidateState } from "@/modules/shared/validations/types";

/**
 * Create validation rules for vendor form
 * @param t - Translation function
 * @param state - Validation state (optional)
 * @returns Validation rules object
 * @created 2025-05-29 03:15:58
 * @author phonpadid
 */
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
          // Custom validation example
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
  };
};

/**
 * Validate vendor name
 * @param name - Vendor name to validate
 * @returns boolean
 */
export const isValidVendorName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 100 && !/[<>]/.test(name);
};

/**
 * Validate vendor contact info
 * @param contactInfo - Contact information to validate
 * @returns boolean
 */
export const isValidContactInfo = (contactInfo: string): boolean => {
  return contactInfo.length > 0 && contactInfo.length <= 500 && !/[<>]/.test(contactInfo);
};

/**
 * Custom validation messages
 */
export const vendorValidationMessages = {
  en: {
    vendors: {
      validation: {
        nameRequired: "Please enter a name",
        nameMin: "Name must be at least 2 characters",
        nameMax: "Name cannot exceed 100 characters",
        nameInvalidChars: "Name contains invalid characters",
        contactInfoRequired: "Please enter contact information",
        contactInfoMax: "Contact information cannot exceed 500 characters",
        contactInfoInvalidChars: "Contact information contains invalid characters",
      },
    },
  },
  la: {
    vendors: {
      validation: {
        nameRequired: "ກະລຸນາປ້ອນຊື່",
        nameMin: "ຊື່ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ",
        nameMax: "ຊື່ບໍ່ສາມາດເກີນ 100 ຕົວອັກສອນ",
        nameInvalidChars: "ຊື່ມີຕົວອັກສອນທີ່ບໍ່ຖືກຕ້ອງ",
        contactInfoRequired: "ກະລຸນາປ້ອນຂໍ້ມູນຕິດຕໍ່",
        contactInfoMax: "ຂໍ້ມູນຕິດຕໍ່ບໍ່ສາມາດເກີນ 500 ຕົວອັກສອນ",
        contactInfoInvalidChars: "ຂໍ້ມູນຕິດຕໍ່ມີຕົວອັກສອນທີ່ບໍ່ຖືກຕ້ອງ",
      },
    },
  },
};
