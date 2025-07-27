import type { RuleObject } from "ant-design-vue/es/form";

interface ValidationState {
  isEditMode: boolean;
}

export const createCategoryValidation = (
  t: (key: string) => string,
  state: ValidationState
) => {
  const nameRules = [
    {
      required: true,
      message: t("categories.validation.nameRequired"),
      trigger: "blur",
    },
    {
      min: 2,
      message: t("categories.validation.nameMin"),
      trigger: "blur",
    },
    {
      max: 100,
      message: t("categories.validation.nameMax"),
      trigger: "blur",
    },
    {
      validator: (_rule: RuleObject, value: string) => {
        if (!value) return Promise.resolve();

        if (state.isEditMode) return Promise.resolve();

        if (!/^[\u0E00-\u0E7Fa-zA-Z0-9-_ ]+$/.test(value)) {
          return Promise.reject(t("categories.validation.namePattern"));
        }
        return Promise.resolve();
      },
      trigger: "blur",
    },
  ];
  return {
    name: nameRules,
  };
};
