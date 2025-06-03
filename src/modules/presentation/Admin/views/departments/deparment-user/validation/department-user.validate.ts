export const dpmUserRules = (t: (key: string) => string) => ({
  username: [
    {
      required: true,
      message: t("departments.dpm_user.error.user"),
      trigger: ["blur"],
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
      message: t("departments.dpm_user.error.dpm"),
      trigger: "blur",
    },
  ],
  tel: [
    {
      required: true,
      message: t("departments.dpm_user.error.dpm"),
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: t("departments.dpm_user.error.dpm"),
      trigger: "blur",
    },
  ],
  confirm_password: [
    {
      required: true,
      message: t("departments.dpm_user.error.dpm"),
      trigger: "blur",
    },
  ],
  signature_file: [
    {
      required: true,
      message: t("departments.dpm_user.error.signature"),
      trigger: ["blur", "change"], // Add change trigger for file uploads
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-explicit-any
      validator: (_rule: any, value: any, callback: Function) => {
        if (!value || value === null || value === undefined) {
          callback(new Error(t("departments.dpm.error.signature_required")));
        } else {
          callback();
        }
      }
    },
  ],
});
