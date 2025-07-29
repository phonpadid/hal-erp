import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("budget_items.field.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("budget_items.field.allocated_amount"),
      dataIndex: "format_allocated_amount",
      key: "allocated_amount",
    },
    {
      title: t("budget_items.field.budget_account"),
      dataIndex: "budget_account",
      key: "budget_account",
    },
    {
      title: t("budget_items.field.created"),
      dataIndex: "created_at",
      key: "created_at",
      scopedSlots: { customRender: "created_at" },
    },
    {
      title: t("budget_items.field.updated"),
      dataIndex: "updated_at",
      key: "updated_at",
      scopedSlots: { customRender: "updated_at" },
    },
    {
      title: t("budget_items.field.manage"),
      dataIndex: "actions",
      key: "actions",
      align: "center",
      scopedSlots: { customRender: "actions" },
    },
  ];
}
