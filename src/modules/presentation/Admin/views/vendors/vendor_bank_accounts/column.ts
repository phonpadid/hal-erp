import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    // {
    //   title: t("vendors_bank.table.vendor"),
    //   dataIndex: "vendor",
    //   key: "vendor",
    // },
    {
      title: t("vendors_bank.table.bankName"),
      dataIndex: "bank.short_name",
      key: "bank_name",
    },
    {
      title: t("vendors_bank.table.currency"),
      dataIndex: "currency.code",
      key: "currency_id",
    },
    {
      title: t("vendors_bank.table.accountName"),
      dataIndex: "account_name",
      key: "account_name",
    },
    {
      title: t("vendors_bank.table.accountNumber"),
      dataIndex: "account_number",
      key: "account_number",
    },
    {
      title: t("vendors_bank.table.isSelected"),
      dataIndex: "is_selected",
      key: "is_selected",
    },
    {
      title: t("vendors_bank.table.createdAt"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("vendors_bank.table.updatedAt"),
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("vendors_bank.table.actions"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
