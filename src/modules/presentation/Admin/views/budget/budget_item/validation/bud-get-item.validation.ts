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
    allocated_amount: [
      {
        required: true,
        message: t("budget_items.validation.allocatedAmountRequired"),
      },
      {
        pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
        message: t("budget_items.validation.allocatedAmountFormat"),
      },
    ],
  };
};
