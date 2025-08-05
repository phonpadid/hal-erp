export const approvalWorkflowStepRules = (t: (key: string) => string) => ({
  approval_workflow_id: [
    {
      required: true,
      message: t("approval-workflow-step.error.approval_workflow"), // example key
      trigger: "blur",
    },
  ],
  department_id: [
    {
      required: true,
      message: t("approval-workflow-step.error.department"), // example key
      trigger: "blur",
    },
  ],
  type: [
    {
      required: true,
      message: t("approval-workflow-step.error.type"), // example key
      trigger: "blur",
    },
  ],
  user_id: [
    {
      required: true,
      message: t("approval-workflow-step.error.user"), // example key
      trigger: "blur",
    },
  ],
  step_name: [
    {
      required: true,
      message: t("approval-workflow-step.error.step_name"), // example key
      trigger: "blur",
    },
    {
      min: 1,
      max: 255,
      message: t("approval-workflow-step.error.max_name"), // example key
      trigger: "blur",
    },
  ],
  step_number: [
    {
      required: true,
      message: t("approval-workflow-step.error.step_number"), // example key
      trigger: "blur",
    },
    {
      type: 'number',
      min: 1,
      max: 12,
      message: t("approval-workflow-step.error.max_number"), // example key
      trigger: "blur",
    },
  ],
});
