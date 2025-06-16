import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("approval-workflow-step.field.step"),
      dataIndex: "step_number",
      key: "step_number",
    },
    {
      title: t("approval-workflow-step.field.department"),
      dataIndex: "department.name",
      key: "name",
    },
    {
      title: t("approval-workflow-step.field.step_name"),
      dataIndex: "step_name",
      key: "step_name",
    },
    // {
    //   title: t("approval-workflow.field.doc_type"),
    //   dataIndex: "document_type.name",
    //   key: "document_type",
    // },
    {
      title: t("approval-workflow.field.created"),
      dataIndex: "created_at",
      key: "createdAt",
    },
    {
      title: t("approval-workflow.field.updated"),
      dataIndex: "updated_at",
      key: "updatedAt",
    },
    {
      title: t("approval-workflow.field.manege"),
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },
  ];
}
