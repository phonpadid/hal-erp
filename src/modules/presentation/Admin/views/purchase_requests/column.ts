import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("purchase_qequest.table.number"),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("purchase_qequest.table.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("purchase_qequest.table.quantity"),
      dataIndex: "quantity",
      key: "quantity",
    },
    // {
    //   title: t("purchase_qequest.table.unit"),
    //   dataIndex: "unit",
    //   key: "unit",
    // },
    {
      title: t("purchase_qequest.table.price"),
      dataIndex: "price",
      key: "price",
    },
    {
      title: t("purchase_qequest.table.note"),
      dataIndex: "note",
      key: "note",
    },
  ];
}
