import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("approval-workflow-step.field.user"),
      dataIndex: "user.username",
      key: "user",
    },
    {
      title: t("approval-workflow-step.field.step"),
      dataIndex: "step_number",
      key: "step_number",
      width: 100,
    },
    {
      title: t("approval-workflow-step.field.department"),
      dataIndex: "department.name",
      key: "department",
    },
    {
      title: t("approval-workflow-step.field.step_name"),
      dataIndex: "step_name",
      key: "step_name",
    },
    {
      title: t("approval-workflow-step.field.type"),
      dataIndex: "type",
      key: "type",
    },
    {
      title: t("approval-workflow-step.field.requires_upload"),
      dataIndex: "requires_file",
      key: "requires_file",
    },
    {
      title: t("approval-workflow-step.field.isOtp"),
      dataIndex: "is_otp",
      key: "is_otp",
    },
    {
      title: t("approval-workflow.field.created"),
      dataIndex: "createdAt",
      key: "createdAt",
    },
    // {
    //   title: t("approval-workflow.field.updated"),
    //   dataIndex: "updatedAt",
    //   key: "updatedAt",
    // },
    {
      title: t("approval-workflow.field.manege"),
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },
  ];
}
