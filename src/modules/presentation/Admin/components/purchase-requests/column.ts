import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("purchase-rq.field.id"),
      dataIndex: "index",
      key: "index",
    },
    {
      title: t("purchase-rq.field.img_example"),
      dataIndex: "image",
      key: "image",
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
    },
     {
      title: t("purchase-rq.field.price"),
      dataIndex: "price",
      key: "price",
    },
    {
      title: t("purchase-rq.field.total_price"),
      dataIndex: "total_price",
      key: "total_price",
    },
    {
      title: t("purchase-rq.field.remark"),
      dataIndex: "remark",
      key: "remark",
    },
  ];
}
