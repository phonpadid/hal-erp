import type { RuleObject } from "ant-design-vue/es/form";

interface ValidationState {
  isEditMode: boolean;
}

export const createVatValidation = (
  t: (key: string) => string,
  state: ValidationState
) => {
  const amountRules = [
    {
      required: true,
      message: t("vats.validation.amountRequired"),
      trigger: "blur",
    },
    {
      validator: (_rule: RuleObject, value: string | number) => {
        const numValue = Number(value);
        if (value === "" || value === undefined || value === null) return Promise.resolve();
        if (isNaN(numValue)) return Promise.reject(t("vats.validation.amountNumber"));
        if (!state.isEditMode && numValue < 0) return Promise.reject(t("vats.validation.amountMin"));
        if (numValue > 100) return Promise.reject(t("vats.validation.amountMax"));
        return Promise.resolve();
      },
      trigger: "blur",
    },
  ];
  return {
    amount: amountRules,
  };
};
