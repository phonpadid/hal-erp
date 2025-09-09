import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("budget_approval.table.code"),
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("budget_approval.table.amount"),
      dataIndex: "amount",
      key: "amount",
      align: "right" as const,
    },
  ];
}
