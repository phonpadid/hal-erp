import type { Column } from "@/modules/shared/column/column";

export function VatColumns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("vats.field.amount"),
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: t("vats.field.created"),
      dataIndex: "created_at",
      key: "createdAt",
    },
    {
      title: t("vats.field.updated"),
      dataIndex: "updated_at",
      key: "updatedAt",
    },
    {
      title: t("vats.field.manage"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
