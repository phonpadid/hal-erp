// import type { Column } from "@/modules/shared/column/column";

// export function columnsApprovalDetails(t: (key: string) => string): Column[] {
//   return [
//     {
//       title: t("budget_approval.table.number"),
//       dataIndex: "number",
//       key: "number",
//     },
//     {
//       title: t("budget_approval.table.remark"),
//       dataIndex: "remark",
//       key: "remark",
//     },
//     {
//       title: t("budget_approval.table.id_name"),
//       dataIndex: "id_name",
//       key: "id_name",
//     },
//     {
//       title: t("budget_approval.table.quantity"),
//       dataIndex: "quantity",
//       key: "quantity",
//     },
//     {
//       title: t("budget_approval.table.price"),
//       dataIndex: "price",
//       key: "price",
//     },
//     {
//       title: t("budget_approval.table.total"),
//       dataIndex: "total",
//       key: "total",
//     },
//   ];
// }
import type { Column } from "@/modules/shared/column/column";

export function columnsApprovalDetails(t: (key: string) => string, userRoles: string[]): Column[] {
  const baseColumns: Column[] = [
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
    {
      title: t("budget_approval.table.shop"),
      dataIndex: "shop",
      key: "shop",
    },
  ];

  const hasBudgetRole = userRoles.includes("budget-admin") || userRoles.includes("budget-user");
  if (hasBudgetRole) {
    baseColumns.splice(2, 0, {
      title: t("budget_approval.table.id_name"),
      dataIndex: "id_name",
      key: "id_name",
    });
  }
  return baseColumns;
}
