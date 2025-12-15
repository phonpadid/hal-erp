import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("budget_accounts.list.code"),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("budget_accounts.list.budget_item"),
      dataIndex: "budget_account.budget_item",
      key: "budget_item",
    },
     {
      title: t("budget_accounts.list.name"),
      dataIndex: "budget_account.name",
      key: "name",
    },
    {
      title: t("budget_accounts.list.fiscalYear"),
      dataIndex: "budget_account.fiscal_year",
      key: "fiscal_year",
    },
    {
      title: t("budget_accounts.list.allocatedAmount"),
      dataIndex: "allocated_amount",
      key: "allocated_amount",
    },
    {
      title: "createdBy",
      dataIndex: "created_by.username",
      key: "created_by",
    },
    {
      title: t("budget_accounts.list.createdAt"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("budget_accounts.list.updatedAt"),
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("budget_accounts.list.actions"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
