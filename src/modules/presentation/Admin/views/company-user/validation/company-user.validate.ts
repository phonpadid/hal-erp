import type { RuleObject } from "ant-design-vue/es/form";

interface ValidationState {
  isEditMode: boolean;
  password: string;
  signature: string | null;
}

export function createCompanyUserValidation(
  t: (key: string) => string,
  state: ValidationState
): Record<string, RuleObject[]> {

  return {
    username: [
      {
        required: true,
        message: t("company-user.validation.usernameRequired"),
        trigger: "blur",
      },
      {
        min: 2,
        message: t("company-user.validation.usernameMin"),
        trigger: "blur",
      },
      {
        max: 50,
        message: t("company-user.validation.usernameMax"),
        trigger: "blur",
      },
      {
        pattern: /^[a-zA-Z0-9_]+$/,
        message: t("company-user.validation.usernameFormat"),
        trigger: "blur",
      },
    ],
    email: [
      {
        required: true,
        message: t("company-user.validation.userEmailRequired"),
        trigger: "blur",
      },
      {
        type: "email",
        message: t("company-user.validation.userEmailFormat"),
        trigger: "blur",
      },
    ],
    tel: [
      {
        required: true,
        message: t("company-user.validation.userTelRequired"),
        trigger: "blur",
      },
      {
        pattern: /^\d{8,15}$/,
        message: t("company-user.validation.userTelFormat"),
        trigger: "blur",
      },
    ],
    password: [
      {
        required: !state.isEditMode,
        message: t("company-user.validation.passwordRequired"),
        trigger: "blur",
      },
      {
        min: 6,
        message: t("company-user.validation.passwordMin"),
        trigger: "blur",
      },
    ],
    confirm_password: [
      {
        required: !state.isEditMode,
        message: t("company-user.validation.confirmPasswordRequired"),
        trigger: "blur",
      },
      {
        validator: (_rule: RuleObject, value: string) => {
          if (!value && !state.isEditMode) {
            return Promise.reject(t("company-user.validation.confirmPasswordRequired"));
          }
          if (value !== state.password) {
            return Promise.reject(t("company-user.validation.passwordMismatch"));
          }
          return Promise.resolve();
        },
        trigger: "blur",
      },
    ],
    };
}