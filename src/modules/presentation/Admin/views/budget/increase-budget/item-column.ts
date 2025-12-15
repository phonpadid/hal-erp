import type { Column } from "@/modules/shared/column/column";

export function itemColumns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("budget_accounts.list.code"),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("budget_accounts.list.budget_item"),
      dataIndex: "budget_item.name",
      key: "budget_item_name",
    },
    {
      title: t("budget_accounts.list.name"),
      dataIndex: "budget_item.budget_account.name",
      key: "name",
    },
    {
      title: t("budget_accounts.list.fiscalYear"),
      dataIndex: "budget_item.budget_account.fiscal_year",
      key: "fiscal_year",
    },
    {
      title: t("budget_accounts.list.allocatedAmount"),
      dataIndex: "allocated_amount",
      key: "allocated_amount",
    },
    // {
    //   title: t("increase-budget.table.allocatedAmount"),
    //   dataIndex: "budget_item.allocated_amount",
    //   key: "budget_allocated_amount",
    // },
    {
      title: t("increase-budget.table.balance_amount"),
      dataIndex: "budget_item.balance_amount",
      key: "budget_balance_amount",
    },
    {
      title: t("increase-budget.table.use_amount"),
      dataIndex: "budget_item.use_amount",
      key: "budget_use_amount",
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
