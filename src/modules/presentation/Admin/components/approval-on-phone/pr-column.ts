import type { Column } from "@/modules/shared/column/column";

export function prColumns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("purchase-rq.field.id"),
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: t("purchase-rq.field.content"),
      dataIndex: "title",
      key: "title",
    },
    {
      title: t("purchase-rq.field.qty"),
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: t("purchase-rq.field.unit_price"),
      dataIndex: "unit_price",
      key: "unit_price",
      width: 120,
    },
    {
      title: t("purchase-rq.field.total_price"),
      dataIndex: "total_price",
      key: "total_price",
      width: 120,
    },
    {
      title: t("purchase-rq.field.remark"),
      dataIndex: "remark",
      key: "remark",
    },
  ];
}
