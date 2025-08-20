import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("purchase_qequest.table.number"),
      dataIndex: "index",
      key: "index",
    },
    {
      title: t("purchase_qequest.table.name"),
      dataIndex: "title",
      key: "title",
    },
    {
      title: t("purchase_qequest.table.quantity"),
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: t("purchase_qequest.table.price"),
      dataIndex: "total_price",
      key: "total_price",
    },
    {
      title: t("purchase_qequest.table.note"),
      dataIndex: "remark",
      key: "remark",
    },
  ];
}
