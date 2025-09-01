import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("purchase_orders.table.order_number"),
      dataIndex: "po_number",
      key: "po_number",
    },
    {
      title: t("purchase_orders.table.name"),
      dataIndex: "requester",
      key: "requester",
    },
    {
      title: t("purchase_orders.table.created_at"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("purchase_orders.table.status"),
      dataIndex: "status",
      key: "status",
    },
    {
      title: t("purchase_orders.table.action"),
      dataIndex: "action",
      key: "action",
    },
  ];
}
