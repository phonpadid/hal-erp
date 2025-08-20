import { itemValidate } from "./items.validate";

export const increaseBudgetItemsRules = (t: (key: string) => string) => ({
  budget_item_id: [
    {
      required: true,
      message: t("increase-budget.vld.item"), // example key
      trigger: "blur",
    },
  ],
  allocated_amount: [
    {
      required: true,
      message: t("increase-budget.vld.allocated_amount"), // example key
      trigger: "blur",
    },
  ],
  ...itemValidate(t)
});
