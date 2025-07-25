import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("budget_accounts.list.code"),
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("budget_accounts.list.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("budget_accounts.list.fiscalYear"),
      dataIndex: "fiscal_year",
      key: "fiscal_year",
    },
    {
      title: t("budget_accounts.list.allocatedAmount"),
      dataIndex: "format_allocated_amount",
      key: "allocated_amount",
    },
    {
      title: t("budget_accounts.list.department"),
      dataIndex: "department.name",
      key: "department",
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
