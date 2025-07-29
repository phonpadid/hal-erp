import { formState } from "../../../stores/exchange-rate.store";

export const exchangeRateValidate = ((t:(key: string) => string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rules: any = {
    addMore: [],
  };

  formState.addMore.forEach((_, index) => {
    if (!rules.addMore[index]) {
      rules.addMore[index] = {};
    }

    rules.addMore[index].from_currency_id = [
      {
        required: true,
        message: t("exchange-rate.error.from_currency"),
        trigger: "blur",
      },
    ];

    rules.addMore[index].to_currency_id = [
      {
        required: true,
        message: t("exchange-rate.error.to_currency"),
        trigger: "blur",
      },
    ];
    rules.addMore[index].rate = [
      {
        required: true,
        message: t("exchange-rate.error.rate"),
        trigger: "blur",
      },
    ];
  });

  return rules;
});
