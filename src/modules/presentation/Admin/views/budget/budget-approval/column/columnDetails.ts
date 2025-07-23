import type { Column } from "@/modules/shared/column/column";

export function columnsApprovalDetails(t: (key: string) => string): Column[] {
  return [
    {
      title: t("budget_approval.table.number"),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("budget_approval.table.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("budget_approval.table.id_name"),
      dataIndex: "id_name",
      key: "id_name",
    },
    {
      title: t("budget_approval.table.quantity"),
      dataIndex: "quantity",
      key: "quantity",
    },
    // {
    //   title: t("purchase_approval.table.unit"),
    //   dataIndex: "unit",
    //   key: "unit",
    // },
    {
      title: t("budget_approval.table.price"),
      dataIndex: "price",
      key: "price",
    },
    {
      title: t("budget_approval.table.total"),
      dataIndex: "total",
      key: "total",
    },
  ];
}
