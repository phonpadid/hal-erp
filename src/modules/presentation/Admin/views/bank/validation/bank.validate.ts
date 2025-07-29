import type { RuleObject } from "ant-design-vue/es/form";

interface ValidationState {
  isEditMode: boolean;
}

export function createBankValidation(
  t: (key: string) => string,
  state: ValidationState
) {
  return {
    name: [
      { required: true, message: t("banks.validation.nameRequired"), trigger: "blur" },
      { min: 2, message: t("banks.validation.nameMin"), trigger: "blur" },
      { max: 100, message: t("banks.validation.nameMax"), trigger: "blur" },
      {
        validator: (_rule: RuleObject, value: string) => {
          if (!value) return Promise.resolve();
          if (state.isEditMode) return Promise.resolve();
          if (!/^[\u0E00-\u0E7Fa-zA-Z0-9-_ ]+$/.test(value)) {
            return Promise.reject(t("banks.validation.namePattern"));
          }
          return Promise.resolve();
        },
        trigger: "blur",
      },
    ],
    short_name: [
      { required: true, message: t("banks.validation.shortNameRequired"), trigger: "blur" },
      { min: 1, message: t("banks.validation.shortNameMin"), trigger: "blur" },
      { max: 20, message: t("banks.validation.shortNameMax"), trigger: "blur" },
    ],
  };
}
