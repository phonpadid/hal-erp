import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("purchase-rq.field.pr_number"),
      dataIndex: "pr_number",
      key: "pr_number",
    },
    {
      title: t("purchase-rq.proposer"),
      dataIndex: "username",
      key: "username",
    },
    {
      title: t("purchase-rq.field.department"),
      dataIndex: "department",
      key: "department",
    },
    {
      title: t("purchase-rq.field.rq_date"),
      dataIndex: "requested_date",
      key: "requested_date",
    },
    {
      title: t("purchase-rq.field.manage"),
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },
  ];
}
