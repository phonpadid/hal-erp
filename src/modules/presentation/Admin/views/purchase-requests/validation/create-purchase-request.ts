import { formState } from "../../../components/purchase-requests/formstate";

export const CreatePRValidate = (t: (key: string) => string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rules: any = {
    document_type_id: [
      {
        required: true,
        message: t("purchase_request.error.document_type_required"),
        trigger: "blur",
      },
    ],
    purpose: [
      {
        required: true,
        message: t("purchase_request.error.document_type_required"),
        trigger: "blur",
      },
    ],
    expired_date: [
      {
        required: true,
        message: t("purchase-rq.error.rq_date"),
        trigger: "blur",
      },
    ],
    addMore: [],
  };

  // Validate that addMore array exists and iterate through it
  if (formState.value.addMore && Array.isArray(formState.value.addMore)) {
    formState.value.addMore.forEach((_, index) => {
      // Initialize the rules object for this index
      rules.addMore[index] = {
        title: [
          {
            required: true,
            message: t("purchase-rq.error.title"),
            trigger: "blur",
          },
          {
            max: 255,
            message: t("purchase-rq.error.max_title"),
            trigger: "blur",
          },
        ],
        count: [
          {
            required: true,
            message: t("purchase-rq.error.qty"),
            trigger: "blur",
          },
          {
            min: 1,
            message: t("purchase-rq.error.min_qty"),
            trigger: "blur",
          },
          {
            max: 12,
            message: t("purchase-rq.error.max_qty"),
            trigger: "blur",
          },
        ],
        price: [
          {
            required: true,
            message: t("purchase-rq.error.price"),
            trigger: "blur",
          },
          {
            type: 'number',
            min: 1,
            message: t("purchase-rq.error.min_price"),
            trigger: "blur",
          },
          {
            type: 'number',
            max: 999999999999,
            message: t("purchase-rq.error.max_price"),
            trigger: "blur",
          },
        ],
        images: [
          {
            required: true,
            message: t("purchase-rq.error.images_required"),
            trigger: "blur",
          },
        ],
      };
    });
  }

  return rules;
};
