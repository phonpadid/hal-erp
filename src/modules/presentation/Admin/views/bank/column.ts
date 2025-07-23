import type{ Column } from "@/modules/shared/column/column";

export function getColumns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("bank.field.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("bank.field.created"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("bank.field.updated"),
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("bank.field.manage"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
