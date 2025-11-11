import i18nConfig, { t } from "@/common/config/i18n/i18n.config";

export const quotaRules = (t: any) => ({
  company_id: [
    { required: true, message: t("quota.validation.companyRequired"), trigger: "change" },
  ],
  vendor_id: [
    { required: true, message: t("quota.validation.vendorRequired"), trigger: "change" },
  ],
  product_id: [
    { required: true, message: t("quota.validation.productRequired"), trigger: "change" },
  ],
  qty: [
    { required: true, message: t("quota.validation.qtyRequired"), trigger: "blur" },
    { type: "number", min: 1, message: t("quota.validation.qtyMin"), trigger: "blur" },
  ],
  year: [
    { required: true, message: t("quota.validation.yearRequired"), trigger: "blur" },
    {
      pattern: /^(19|20)\d{2}$/,
      message: t("quota.validation.yearFormat"),
      trigger: "blur"
    },
  ],
});