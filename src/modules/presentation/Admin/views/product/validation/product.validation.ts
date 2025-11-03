import type { RuleObject } from "ant-design-vue/es/form";

interface ValidationState {
  isEditMode: boolean;
}

export const createProductValidation = (
  t: (key: string) => string,
  state: ValidationState
) => {
  const nameRules = [
    {
      required: true,
      message: t("products.validation.nameRequired"),
      trigger: "blur",
    },
    {
      min: 2,
      message: t("products.validation.nameMin"),
      trigger: "blur",
    },
    {
      max: 200,
      message: t("products.validation.nameMax"),
      trigger: "blur",
    },
    {
      validator: (_rule: RuleObject, value: string) => {
        if (!value) return Promise.resolve();
        if (state.isEditMode) return Promise.resolve();
        return Promise.resolve();
      },
      trigger: "blur",
    },
  ];

  const descriptionRules = [
    // {
    //   required: true,
    //   message: t("products.validation.descriptionRequired"),
    //   trigger: "blur",
    // },
    {
      min: 5,
      message: t("products.validation.descriptionMin"),
      trigger: "blur",
    },
    {
      max: 1000,
      message: t("products.validation.descriptionMax"),
      trigger: "blur",
    },
  ];

  const productTypeIdRules = [
    {
      required: true,
      message: t("products.validation.productTypeRequired"),
      trigger: "change",
    },
    {
      type: "number" as const,
      min: 1,
      message: t("products.validation.productTypeValid"),
      trigger: "change",
    },
  ];

  return {
    name: nameRules,
    description: descriptionRules,
    product_type_id: productTypeIdRules,
  };
};