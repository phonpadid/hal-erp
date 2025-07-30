import type{ Column } from "@/modules/shared/column/column";

export function Columns(t: (key: string) => string) :Column[] {
  return [
    {
      title: t("categories.field.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("categories.field.created"),
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: t("categories.field.updated"),
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: t("categories.field.manage"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
