import type { Column } from "@/modules/shared/column/column";

export function getColumns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("banks.field.logo"),
      dataIndex: "logo",
      key: "logo",
      slot: "logo",
    },
    {
      title: t("banks.field.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("banks.field.short_name"),
      dataIndex: "shortName",
      key: "shortName",
    },
    {
      title: t("banks.field.created"),
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: t("banks.field.updated"),
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: t("banks.field.manage"),
      dataIndex: "actions",
      key: "actions",
      slot: "actions",
    },
  ];
}
