import type{ Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string) :Column[] {
  return [
    {
      title: t("categories.field.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("categories.field.created"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("categories.field.updated"),
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("categories.field.manage"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
