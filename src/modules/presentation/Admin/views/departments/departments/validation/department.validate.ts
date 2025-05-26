export const dpmRules = (t: (key: string) => string) => ({
  name: [
    {
      required: true,
      message: t("departments.dpm.error.name"), // example key
      trigger: "blur",
    },
  ],
  code: [
    {
      required: true,
      message: t("departments.dpm.error.code"), // example key
      trigger: "blur",
    },
  ],
});
