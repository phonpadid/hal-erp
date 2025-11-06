interface ValidationState {
  isEditMode: boolean;
  formState?: {
    product_id?: string;
    price?: number;
  };
}

export const createVendorProductValidation = (
  t: (key: string) => string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _state: ValidationState
) => {
  const productRules = [
    {
      required: true,
      message: t("vendor-product.validation.productRequired"),
      trigger: "change",
    },
  ];

  const priceRules = [
    {
      required: true,
      message: t("vendor-product.validation.priceRequired"),
      trigger: "blur",
    },
    // {
    //   type: "number" as const,
    //   min: 0,
    //   message: t("vendor-product.validation.priceMin"),
    //   trigger: "blur",
    // },
  ];

  return {
    product_id: productRules,
    price: priceRules,
  };
};