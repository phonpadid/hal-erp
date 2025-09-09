import type { Column } from "@/modules/shared/column/column";

export function columnsApprovalDetails(t: (key: string) => string): Column[] {
  return [
    {
      title: t("budget_approval.table.number"),
      dataIndex: "number",
      key: "number",
    },
    {
      title: t("budget_approval.table.remark"),
      dataIndex: "remark",
      key: "remark",
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
