import { formState } from "@/modules/presentation/Admin/stores/budget/increase/increase-budget.store";

export const itemValidate = ((t:(key: string) => string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rules: any = {
    detail: [],
  };

  formState.detail.forEach((_, index) => {
    if (!rules.detail[index]) {
      rules.detail[index] = {};
    }

    rules.detail[index].budget_item_id = [
      {
        required: true,
        message: t("increase-budget.vld.item"), // example key
        trigger: "blur",
      },
    ];

    rules.detail[index].allocated_amount = [
      {
        required: true,
        message: t("increase-budget.vld.allocated_amount"), // example key
        trigger: "blur",
      },
    ];

  });

  return rules;
});
