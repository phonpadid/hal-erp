import { itemValidate } from "./item-setp.validate";

export const apvStepRules = (t: (key: string) => string) => ({
  name: [
    {
      required: true,
      message: t("approval-workflow.error.name"), // example key
      trigger: "blur",
    },
    {
      min: 1,
      max: 255,
      message: t("approval-workflow.error.max_name"), // example key
      trigger: "blur",
    },
  ],
  document_type_id: [
    {
      required: true,
      message: t("approval-workflow.error.doc_type"), // example key
      trigger: "blur",
    },
  ],
  ...itemValidate(t)
});
