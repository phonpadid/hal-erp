import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("exchange-rate.field.from_currency"),
      dataIndex: "from_currency.name",
      key: "from_currency",
    },
    {
      title: t("exchange-rate.field.to_currency"),
      dataIndex: "to_currency.name",
      key: "to_currency",
    },
    {
      title: t("exchange-rate.field.rate"),
      dataIndex: "rate",
      key: "rate",
    },
    {
      title: t("exchange-rate.field.is_active"),
      dataIndex: "is_active",
      key: "is_active",
    },
    {
      title: t("documentType.table.createdAt"),
      dataIndex: "createdAt",
      key: "created_at",
      scopedSlots: { customRender: "createdAt" },
    },
    {
      title: t("documentType.table.updatedAt"),
      dataIndex: "updatedAt",
      key: "updated_at",
      scopedSlots: { customRender: "updatedAt" },
    },
    {
      title: t("documentType.table.actions"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
