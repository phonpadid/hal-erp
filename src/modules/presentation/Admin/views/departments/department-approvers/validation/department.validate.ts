export const dpmApproverRules = (t: (key: string) => string) => ({
  user_id: [
    {
      required: true,
      message: t("departments.dpm_user.error.user"),
      trigger: ["blur"],
    },
  ],
});
