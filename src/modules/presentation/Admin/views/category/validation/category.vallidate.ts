import type { RuleObject } from "ant-design-vue/es/form";

interface ValidationState {
  isEditMode: boolean;
}

export const createCategoryValidation = (
  t: (key: string) => string,
  state: ValidationState
) => {
  // Name validation rules
  const nameRules = [
    {
      required: true,
      message: t("category.validation.nameRequired"),
      trigger: "blur",
    },
    {
      min: 2,
      message: t("category.validation.nameMin"),
      trigger: "blur",
    },
    {
      max: 100,
      message: t("category.validation.nameMax"),
      trigger: "blur",
    },
    {
      validator: (_rule: RuleObject, value: string) => {
        if (!value) return Promise.resolve();

        if (state.isEditMode) return Promise.resolve();

        if (!/^[\u0E00-\u0E7Fa-zA-Z0-9-_ ]+$/.test(value)) {
          return Promise.reject(t("category.validation.namePattern"));
        }
        return Promise.resolve();
      },
      trigger: "blur",
    },
  ];

  // Code validation rules
  const codeRules = [
    {
      required: true,
      message: t("category.validation.codeRequired"),
      trigger: "blur",
    },
    {
      min: 2,
      message: t("category.validation.codeMin"),
      trigger: "blur",
    },
    {
      max: 50,
      message: t("category.validation.codeMax"),
      trigger: "blur",
    },
    {
      validator: (_rule: RuleObject, value: string) => {
        if (!value) return Promise.resolve();

        if (state.isEditMode) return Promise.resolve();

        if (!/^[A-Z0-9-_]+$/.test(value)) {
          return Promise.reject(t("category.validation.codePattern"));
        }
        return Promise.resolve();
      },
      trigger: "blur",
    },
  ];

  return {
    name: nameRules,
    code: codeRules,
  };
};
