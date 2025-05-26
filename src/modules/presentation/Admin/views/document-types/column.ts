import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("documentType.table.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("documentType.table.code"),
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("documentType.table.createdAt"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("documentType.table.updatedAt"),
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("documentType.table.actions"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
