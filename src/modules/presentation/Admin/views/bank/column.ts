import type{ Column } from "@/modules/shared/column/column";

export function getColumns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("banks.field.logo"),
      dataIndex: "logo",
      key: "logo",
    },
    {
      title: t("banks.field.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("banks.field.short_name"),
      dataIndex: "short_name",
      key: "short_name",
    },
    {
      title: t("banks.field.created"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("banks.field.updated"),
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("banks.field.manage"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
