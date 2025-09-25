export const rejectRule = (t: (key: string) => string) => ({
  remark: [
    {
      required: true,
      message: t("departments.dpm.error.name"), // example key
      trigger: "blur",
    },
    {
      max: 255,
      message: t("departments.dpm.error.name_max"),
      trigger: ["blur"],
    },
  ],
});
export const accountCodeRule = (t: (key: string) => string) => ({
  account_code: [
    {
      required: true,
      message: t("departments.dpm.error.name"), // example key
      trigger: "blur",
    },
    {
      max: 255,
      message: t("departments.dpm.error.name_max"),
      trigger: ["blur"],
    },
  ],
});
