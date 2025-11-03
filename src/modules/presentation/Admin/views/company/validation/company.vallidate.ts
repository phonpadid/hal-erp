
interface ValidationState {
  isEditMode: boolean;
  formState?: {
    name?: string;
    tel?: string;
    email?: string;
    address?: string;
    user?: {
      username?: string;
      email?: string;
      tel?: string;
      password?: string;
      confirm_password?: string;
    };
  };
}

export const createCompanyValidation = (
  t: (key: string) => string,
  state: ValidationState
) => {
  const nameRules = [
    {
      required: true,
      message: t("company.validation.nameRequired"),
      trigger: "blur",
    },
    {
      min: 2,
      message: t("company.validation.nameMin"),
      trigger: "blur",
    },
    {
      max: 200,
      message: t("company.validation.nameMax"),
      trigger: "blur",
    },
  ];

  const telRules = [
    {
      required: true,
      message: t("company.validation.telRequired"),
      trigger: "blur",
    },
    {
      pattern: /^[0-9]{8,15}$/,
      message: t("company.validation.telFormat"),
      trigger: "blur",
    },
  ];

  const emailRules = [
    {
      required: true,
      message: t("company.validation.emailRequired"),
      trigger: "blur",
    },
    {
      type: "email" as const,
      message: t("company.validation.emailFormat"),
      trigger: "blur",
    },
  ];

  const addressRules = [
    {
      required: true,
      message: t("company.validation.addressRequired"),
      trigger: "blur",
    },
    {
      min: 5,
      message: t("company.validation.addressMin"),
      trigger: "blur",
    },
    {
      max: 500,
      message: t("company.validation.addressMax"),
      trigger: "blur",
    },
  ];

  // User validation (only for create mode)
  const userValidation: Record<string, Array<Record<string, unknown>>> = {};

  if (!state.isEditMode) {
    userValidation.username = [
      {
        validator: (_rule: unknown, value: string) => {
          return new Promise((resolve, reject) => {
            // Get actual value from form state
            const actualValue = state.formState?.user?.username || value;

            if (!actualValue || actualValue.trim() === '') {
              reject(new Error(t("company.validation.usernameRequired")));
              return;
            }

            if (actualValue.length < 3) {
              reject(new Error(t("company.validation.usernameMin")));
              return;
            }

            if (actualValue.length > 50) {
              reject(new Error(t("company.validation.usernameMax")));
              return;
            }

            if (!/^[a-zA-Z0-9_]+$/.test(actualValue)) {
              reject(new Error(t("company.validation.usernameFormat")));
              return;
            }

            resolve(true);
          });
        },
        trigger: "blur",
      },
    ];

    userValidation.email = [
      {
        validator: (_rule: unknown, value: string) => {
          return new Promise((resolve, reject) => {
            // Get actual value from form state
            const actualValue = state.formState?.user?.email || value;

            if (!actualValue || actualValue.trim() === '') {
              reject(new Error(t("company.validation.userEmailRequired")));
              return;
            }

            // Simple email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(actualValue)) {
              reject(new Error(t("company.validation.emailFormat")));
              return;
            }

            resolve(true);
          });
        },
        trigger: "blur",
      },
    ];

    userValidation.tel = [
      {
        validator: (_rule: unknown, value: string) => {
          return new Promise((resolve, reject) => {
            // Get actual value from form state
            const actualValue = state.formState?.user?.tel || value;

            if (!actualValue || actualValue.trim() === '') {
              reject(new Error(t("company.validation.userTelRequired")));
              return;
            }

            if (!/^[0-9]{8,15}$/.test(actualValue)) {
              reject(new Error(t("company.validation.telFormat")));
              return;
            }

            resolve(true);
          });
        },
        trigger: "blur",
      },
    ];

    userValidation.password = [
      {
        validator: (_rule: unknown, value: string) => {
          return new Promise((resolve, reject) => {
            // Get actual value from form state
            const actualValue = state.formState?.user?.password || value;

            if (!actualValue || actualValue.trim() === '') {
              reject(new Error(t("company.validation.passwordRequired")));
              return;
            }

            if (actualValue.length < 6) {
              reject(new Error(t("company.validation.passwordMin")));
              return;
            }

            resolve(true);
          });
        },
        trigger: "blur",
      },
    ];

    userValidation.confirm_password = [
      {
        validator: (_rule: unknown, value: string) => {
          return new Promise((resolve, reject) => {
            // Get actual values from form state
            const actualValue = state.formState?.user?.confirm_password || value;
            const password = state.formState?.user?.password;

            if (!actualValue || actualValue.trim() === '') {
              reject(new Error(t("company.validation.confirmPasswordRequired")));
              return;
            }

            if (actualValue !== password) {
              reject(new Error(t("company.validation.passwordMismatch")));
              return;
            }

            resolve(true);
          });
        },
        trigger: "blur",
      },
    ];
  }

  return {
    name: nameRules,
    tel: telRules,
    email: emailRules,
    address: addressRules,
    "user.username": userValidation.username,
    "user.email": userValidation.email,
    "user.tel": userValidation.tel,
    "user.password": userValidation.password,
    "user.confirm_password": userValidation.confirm_password,
  };
};