import type { RuleObject } from "ant-design-vue/es/form";
import { computed } from "vue";
import type { ComputedRef } from "vue";

interface ValidationState {
  password: string;
  isEditMode: boolean;
}

export const createUserValidation = (
  t: (key: string) => string,
  state: ValidationState
): ComputedRef<Record<string, RuleObject[]>> => {
  return computed(() => {
    // Validate confirm password
    const validateConfirmPassword = (_rule: RuleObject, value: string) => {
      if (state.password && value !== state.password) {
        return Promise.reject(t("user.validation.passwordMismatch"));
      }
      return Promise.resolve();
    };

    return {
      username: [
        { required: true, message: t("user.validation.usernameRequired"), trigger: "blur" },
        { min: 3, message: t("user.validation.usernameLength"), trigger: "blur" },
        {
          pattern: /^[a-zA-Z0-9_]+$/,
          message: t("user.validation.usernamePattern"),
          trigger: "blur",
        },
      ],
      email: [
        { required: true, message: t("user.validation.emailRequired"), trigger: "blur" },
        { type: "email", message: t("user.validation.emailValid"), trigger: "blur" },
      ],
      password: [
        {
          required: !state.isEditMode,
          message: t("user.validation.passwordRequired"),
          trigger: "blur",
        },
        {
          validator: (_rule: RuleObject, value: string) => {
            if (state.isEditMode && !value) return Promise.resolve();
            if (value && value.length < 6) {
              return Promise.reject(t("user.validation.passwordLength"));
            }
            return Promise.resolve();
          },
          trigger: "blur",
        },
      ],
      confirmPassword: [
        {
          required: !state.isEditMode || (state.isEditMode && !!state.password),
          message: t("user.validation.confirmPasswordRequired"),
          trigger: "blur",
        },
        { validator: validateConfirmPassword, trigger: "blur" },
      ],
      tel: [
        {
          pattern: /^[0-9]+$/,
          message: t("user.validation.telPattern"),
          trigger: "blur",
        },
      ],
    };
  });
};
