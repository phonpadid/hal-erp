import { formState } from "../../../components/purchase-requests/formstate";

export const CreatePRValidate = ((t:(key: string) => string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rules: any = {
    addMore: [],
  };

  formState.value.addMore.forEach((_, index) => {
    if (!rules.addMore[index]) {
      rules.addMore[index] = {};
    }

    rules.document_type_id = [
      {
        required: true,
        message: t("currency.error.code"),
        trigger: "blur",
      },
    ];
    rules.requested_date = [
      {
        required: true,
        message: t("currency.error.code"),
        trigger: "blur",
      },
    ];
    rules.expired_date = [
      {
        required: true,
        message: t("currency.error.code"),
        trigger: "blur",
      },
    ];
    rules.addMore[index].title = [
      {
        required: true,
        message: t("currency.error.code"),
        trigger: "blur",
      },
    ];

    rules.addMore[index].count = [
      {
        required: true,
        message: t("currency.error.name"),
        trigger: "blur",
      },
    ];
    rules.addMore[index].price = [
      {
        required: true,
        message: t("currency.error.name"),
        trigger: "blur",
      },
    ];
    rules.addMore[index].images = [
      {
        required: true,
        message: t("currency.error.name"),
        trigger: "blur",
      },
    ];
  });

  return rules;
});
