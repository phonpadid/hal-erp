
export const dpmUserRules = (t: (key: string) => string, formModel: any) => ({
  username: [
    {
      required: true,
      message: t("departments.dpm_user.error.user"),
      trigger: ["blur"],
    },
    {
      max: 255,
      message: t("departments.dpm_user.error.user_max"),
      trigger: ["blur"],
    },
  ],
  departmentId: [
    {
      required: true,
      message: t("departments.dpm_user.error.dpm"),
      trigger: "blur",
    },
  ],
  position_id: [
    {
      required: true,
      message: t("departments.dpm_user.error.position"),
      trigger: "blur",
    },
  ],
  email: [
    {
      required: true,
      message: t("departments.dpm_user.error.email"),
      trigger: "blur",
    },
    {
      type: "email",
      message: t("departments.dpm_user.error.email_format"),
      trigger: "blur",
    },
    {
      max: 100,
      message: t("departments.dpm_user.error.email_max"),
      trigger: "blur",
    },
  ],
  tel: [
    {
      required: true,
      message: t("departments.dpm_user.error.tel"),
      trigger: "blur",
    },
    {
      max: 50,
      message: t("departments.dpm_user.error.tel_max"),
      trigger: "blur",
    },
  ],
  roleIds: [
    {
      required: true,
      message: t("departments.dpm_user.error.role"),
      trigger: "blur"
    }
  ],
  permissionIds: [
    {
      required: true,
      message: t("departments.dpm_user.error.permission"),
      trigger: "blur"
    }
  ],
  password: [
    {
      required: true,
      message: t("departments.dpm_user.error.password"),
      trigger: "blur",
    },
    {
      min: 6,
      message: t("departments.dpm_user.error.password_min"),
      trigger: "blur",
    },
    {
      max: 100,
      message: t("departments.dpm_user.error.password_max"),
      trigger: "blur",
    },
  ],
  confirm_password: [
    {
      required: true,
      message: t("departments.dpm_user.error.confirm_password"),
      trigger: "blur",
    },
    {
      min: 6,
      message: t("departments.dpm_user.error.password_min"),
      trigger: "blur",
    },
    {
      max: 100,
      message: t("departments.dpm_user.error.password_max"),
      trigger: "blur",
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-explicit-any
      validator: (_rule: any, value: any, callback: Function) => {
        if (value && formModel && value !== formModel.password) {
          callback(new Error(t("departments.dpm_user.error.password_match")));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  signature_file: [
    {
      required: true,
      message: t("departments.dpm_user.error.signature"),
      trigger: ["blur", "change"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: (_rule: any, value: any) => {
        if (!value || value === null || value === undefined) {
          return Promise.reject(t("departments.dpm_user.error.signature_required"));
        }
        return Promise.resolve();
      }
    },
  ],
});
