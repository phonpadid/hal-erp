import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("approval-workflow.field.code"),
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("approval-workflow.field.form_name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("approval-workflow.field.doc_type"),
      dataIndex: "document_type",
      key: "document_type",
    },
    {
      title: t("approval-workflow.field.created"),
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: t("approval-workflow.field.updated"),
      dataIndex: "updatedAt",
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
