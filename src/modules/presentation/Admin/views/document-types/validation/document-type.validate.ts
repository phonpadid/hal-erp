import type { RuleObject } from "ant-design-vue/es/form";

interface ValidationState {
  isEditMode: boolean;
}

export const createDocumentTypeValidation = (
  t: (key: string) => string,
  state: ValidationState
) => {
  // Name validation rules
  const nameRules = [
    {
      required: true,
      message: t("documentType.validation.nameRequired"),
      trigger: "blur",
    },
    {
      min: 2,
      message: t("documentType.validation.nameMin"),
      trigger: "blur",
    },
    {
      max: 100,
      message: t("documentType.validation.nameMax"),
      trigger: "blur",
    },
    {
      validator: (_rule: RuleObject, value: string) => {
        if (!value) return Promise.resolve();

        if (state.isEditMode) return Promise.resolve();

        if (!/^[\u0E00-\u0E7Fa-zA-Z0-9-_ ]+$/.test(value)) {
          return Promise.reject(t("documentType.validation.namePattern"));
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
      message: t("documentType.validation.codeRequired"),
      trigger: "blur",
    },
    {
      min: 2,
      message: t("documentType.validation.codeMin"),
      trigger: "blur",
    },
    {
      max: 50,
      message: t("documentType.validation.codeMax"),
      trigger: "blur",
    },
    {
      validator: (_rule: RuleObject, value: string) => {
        if (!value) return Promise.resolve();

        if (state.isEditMode) return Promise.resolve();

        if (!/^[A-Z0-9-_]+$/.test(value)) {
          return Promise.reject(t("documentType.validation.codePattern"));
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
