import type{ Column } from "@/modules/shared/column/column";

export function Columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("positions.field.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("positions.field.created"),
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: t("positions.field.updated"),
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: t("positions.field.manage"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
