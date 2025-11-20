export const roleRules = (t: (key: string) => string) => ({
  name: [
    { required: true, message: t("role.validation.nameRequired"), trigger: "blur" },
    { min: 2, message: t("role.validation.nameMinLength"), trigger: ["blur", "change"] },
    { max: 100, message: t("role.validation.nameMaxLength"), trigger: ["blur", "change"] },
    {
      pattern: /^[a-zA-Z0-9_\-\s]+$/,
      message: t("role.validation.namePattern"),
      trigger: ["blur", "change"]
    }
  ]
});