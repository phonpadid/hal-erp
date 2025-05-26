export const dpmUserRules = (t: (key: string) => string) => ({
  user_id: [
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
  department_id: [
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
      validator: (rule: any, value: any, callback: Function) => {
        if (!value || value === null || value === undefined) {
          callback(new Error(t("departments.dpm.error.signature_required")));
        } else {
          callback();
        }
      }
    },
  ],
});
