import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("purchase_orders.table.order_number"),
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: t("purchase_orders.table.name"),
      dataIndex: "vendorName",
      key: "vendorName",
    },
    {
      title: t("purchase_orders.table.created_at"),
      dataIndex: "orderDate",
      key: "orderDate",
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
