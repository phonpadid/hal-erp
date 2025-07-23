/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Rule } from "ant-design-vue/es/form";

export const createBudgetItemValidation = (t: (key: string) => string): Record<string, Rule[]> => {
  return {
    budget_account_id: [
      {
        required: true,
        message: t("budget_items.validation.budgetAccountRequired"),
      },
    ],
    name: [
      {
        required: true,
        message: t("budget_items.validation.nameRequired"),
      },
      {
        max: 100,
        message: t("budget_items.validation.nameMax"),
      },
    ],
  };
};

// เพิ่มฟังก์ชันสร้าง rules สำหรับ แต่ละ item detail
export const createItemDetailRules = (
  t: (key: string, vars?: Record<string, any>) => string,
  index: number
): Record<string, Rule[]> => {
  return {
    [`province_${index}`]: [
      {
        required: true,
        message: t("budget_items.validation.provinceRequired", { index: index + 1 }),
        trigger: "change",
      },
    ],
    [`allocatedAmount_${index}`]: [
      {
        required: true,
        message: t("budget_items.validation.detailAllocatedAmountRequired", { index: index + 1 }),
        trigger: "blur",
      },
      {
        validator: (_: any, value: string) => {
          if (!value) return Promise.resolve();

          if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(value)) {
            return Promise.reject(
              t("budget_items.validation.detailAllocatedAmountFormat", { index: index + 1 })
            );
          }
          return Promise.resolve();
        },
        trigger: "blur",
      },
    ],
  };
};

// ยังคงเก็บฟังก์ชัน validateBudgetItemDetails ไว้สำหรับ validate ทั้งหมดในครั้งเดียว
export const validateBudgetItemDetails = (
  t: (key: string, vars?: Record<string, any>) => string,
  details: Array<{
    province_id: string;
    allocated_amount: string;
  }>
): string | undefined => {
  if (!details || details.length === 0) {
    return t("budget_items.validation.detailsRequired");
  }

  for (let i = 0; i < details.length; i++) {
    const detail = details[i];
    if (!detail.province_id) {
      return t("budget_items.validation.provinceRequired", { index: i + 1 });
    }
    if (!detail.allocated_amount) {
      return t("budget_items.validation.detailAllocatedAmountRequired", { index: i + 1 });
    }
    if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(detail.allocated_amount)) {
      return t("budget_items.validation.detailAllocatedAmountFormat", { index: i + 1 });
    }
  }

  return undefined;
};
