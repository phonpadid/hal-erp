import type { Rule } from "ant-design-vue/es/form";

export const createBudgetAccountValidation = (
  t: (key: string) => string
): Record<string, Rule[]> => {
  return {
    departmentId: [
      {
        required: true,
        message: t("budget_accounts.validation.departmentRequired"),
      },
    ],
    name: [
      {
        required: true,
        message: t("budget_accounts.validation.nameRequired"),
      },
      {
        max: 100,
        message: t("budget_accounts.validation.nameMax"),
      },
    ],
    fiscal_year: [
      {
        required: true,
        message: t("budget_accounts.validation.fiscalYearRequired"),
      },
    ],
    type: [
      {
        required: true,
        message: t("approval-workflow.error.type"),
      },
    ],
    allocated_amount: [
      {
        required: true,
        message: t("budget_accounts.validation.allocatedAmountRequired"),
      },
      // {
      //   pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
      //   message: t("budget_accounts.validation.allocatedAmountFormat"),
      // },
    ],
  };
};
