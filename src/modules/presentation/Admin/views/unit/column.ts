import type{ Column } from "@/modules/shared/column/column";

export function getColumns(t: (key: string) => string) : Column[] {
  return [
    {
      title: t("units.field.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("units.field.created"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("units.field.updated"),
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("units.field.manage"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
