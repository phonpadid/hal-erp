export const userApprovalRulue = (t: (key: string) => string) => ({
  document_id: [
    {
      required: true,
      message: t("user_approval.user_apv.error.document"), // example key
      trigger: "blur",
    },
  ],
  status_id: [
    {
      required: true,
      message: t("user_approval.user_apv.error.status"), // example key
      trigger: "blur",
    },
  ],
  approval_workflow_id: [
    {
      required: true,
      message: t("user_approval.user_apv.error.apv_workflow"), // example key
      trigger: "blur",
    },
  ],
});
