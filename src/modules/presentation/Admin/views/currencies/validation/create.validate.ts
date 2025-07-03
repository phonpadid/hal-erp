import { formState } from "../../../stores/currency.store";

export const CurrencyValidate = ((t:(key: string) => string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rules: any = {
    addMore: [],
  };

  formState.value.addMore.forEach((_, index) => {
    if (!rules.addMore[index]) {
      rules.addMore[index] = {};
    }

    rules.addMore[index].code = [
      {
        required: true,
        message: t("currency.error.code"),
        trigger: "blur",
      },
    ];

    rules.addMore[index].name = [
      {
        required: true,
        message: t("currency.error.name"),
        trigger: "blur",
      },
    ];
  });

  return rules;
});
