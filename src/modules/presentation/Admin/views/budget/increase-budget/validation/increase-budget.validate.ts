import { itemValidate } from "./items.validate";

export const increaseBudgetRules = (t: (key: string) => string) => ({
  budget_account_id: [
    {
      required: true,
      message: t("increase-budget.vld.title"), // example key
      trigger: "blur",
    },
  ],
  file_name: [
    {
      required: true,
      message: t("increase-budget.vld.file_name"), // example key
      trigger: "blur",
    },
  ],
  ...itemValidate(t)
});
