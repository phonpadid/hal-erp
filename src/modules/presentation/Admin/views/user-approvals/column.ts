import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("user_approval.user_apv.field.id"),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("user_approval.user_apv.field.apv_workflow"),
      dataIndex: "apv_workflow",
      key: "apv_workflow",
    },
    {
      title:t("user_approval.user_apv.field.document"),
      dataIndex: "document",
      key: "document",
    },
    {
      title: t("user_approval.user_apv.field.status"),
      dataIndex: "status",
      key: "status",
    },
    {
      title: t("departments.dpm.field.created") || "Created At",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("departments.dpm.field.updated") || "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("departments.dpm.field.manege") || "Actions",
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },
  ];
}
