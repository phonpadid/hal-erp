export const dpmRules = (t: (key: string) => string) => ({
  name: [
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
  code: [
    {
      required: true,
      message: t("departments.dpm.error.code"), // example key
      trigger: "blur",
    },
    {
      max: 150,
      message: t("departments.dpm.error.code_max"),
      trigger: ["blur"],
    },
  ],
});
