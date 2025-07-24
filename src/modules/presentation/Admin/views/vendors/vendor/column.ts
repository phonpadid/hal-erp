import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("vendors.table.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("vendors.table.contact_info"),
      dataIndex: "contact_info",
      key: "contact_info",
    },
    {
      title: t("vendors.table.created_at"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("vendors.table.updated_at"),
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("vendors.table.actions"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
