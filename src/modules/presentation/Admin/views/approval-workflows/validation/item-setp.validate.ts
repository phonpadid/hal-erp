import { formState } from "../../../stores/approval-workflow.store";

export const itemValidate = ((t:(key: string) => string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rules: any = {
    addMore: [],
  };

  formState.addMore.forEach((_, index) => {
    if (!rules.addMore[index]) {
      rules.addMore[index] = {};
    }

    rules.addMore[index].approval_workflow_id = [
      {
        required: true,
        message: t("approval-workflow-step.error.approval_workflow"), // example key
        trigger: "blur",
      },
    ];

    rules.addMore[index].department_id = [
      {
        required: true,
        message: t("approval-workflow-step.error.department"), // example key
        trigger: "blur",
      },
    ];
    rules.addMore[index].user_id = [
      {
        required: true,
        message: t("approval-workflow-step.error.user"), // example key
        trigger: "blur",
      },
    ];
    rules.addMore[index].type = [
      {
        required: true,
        message: t("approval-workflow-step.error.type"), // example key
        trigger: "blur",
      },
    ];
    rules.addMore[index].step_name = [
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
    ];
    rules.addMore[index].step_number = [
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
    ];
  });

  return rules;
});
