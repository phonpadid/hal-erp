import type{ Column } from "@/modules/shared/column/column";

export function Columns(t: (key: string) => string) : Column[] {
  return [
    {
      title: t("units.field.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("units.field.created"),
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: t("units.field.updated"),
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: t("units.field.manage"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
