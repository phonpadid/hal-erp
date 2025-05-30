export const budgetApvRuleRules = (t: (key: string) => string) => ({
  department_id: [
    {
      required: true,
      message: t("budget-apv-rule.error.department"), // example key
      trigger: "blur",
    },
  ],
  approver_id: [
    {
      required: true,
      message: t("budget-apv-rule.error.user"), // example key
      trigger: "blur",
    },
  ],
  min_amount: [
    {
      required: true,
      message: t("budget-apv-rule.error.min"), // example key
      trigger: "blur",
    },
  ],
  max_amount: [
    {
      required: true,
      message: t("budget-apv-rule.error.max"), // example key
      trigger: "blur",
    },
  ],
});
