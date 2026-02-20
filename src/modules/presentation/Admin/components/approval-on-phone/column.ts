import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
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
      title: t("receipt.title.budget_code"),
      dataIndex: "budget_code",
      key: "budget_code",
    },
    {
      title: t("purchase-rq.field.qty"),
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: t("purchase-rq.field.price"),
      dataIndex: "price",
      key: "price",
      width: 150,
    },
    {
      title: t("purchase-rq.field.remark"),
      dataIndex: "remark",
      key: "remark",
    },
    // {
    //   title: "ຂໍ້ມູນຮ້ານ",
    //   dataIndex: "vendor",
    //   key: "vendor",
    //   width: 120,
    // },
  ];
}
