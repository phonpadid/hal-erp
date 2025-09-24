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
      dataIndex: "title",
      key: "title",
    },
    {
      title: "ລະຫັດງົບປະມານ",
      dataIndex: "budget_code",
      key: "budget_code",
    },
    {
      title: "ເລກບັນຊີ",
      dataIndex: "account_code",
      key: "account_code",
      width: 200,
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
