export const currencyRules = (t: (key: string) => string) => ({
  name: [
    {
      required: true,
      message: t("currency.error.name"), // example key
      trigger: "blur",
    },
  ],
  code: [
    {
      required: true,
      message: t("currency.error.code"), // example key
      trigger: "blur",
    },
  ],
});
