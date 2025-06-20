import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("purchase-rq.field.id"),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("purchase-rq.field.content"),
      dataIndex: "content",
      key: "content",
    },
    {
      title: t("purchase-rq.field.qty"),
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: t("purchase-rq.field.price"),
      dataIndex: "price",
      key: "price",
    },
    {
      title: t("purchase-rq.field.remark"),
      dataIndex: "remark",
      key: "remark",
    },

  ];
}
