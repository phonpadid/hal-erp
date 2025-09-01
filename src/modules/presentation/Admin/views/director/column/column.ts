import type { Column } from "@/modules/shared/column/column";

export function columnsDirecter(t: (key: string) => string): Column[] {
  return [
    {
      title: t("purchase-rq.field.pr_number"),
      dataIndex: "pr_number",
      key: "pr_number",
    },
    {
      title: t("purchase-rq.field.user"),
      dataIndex: "user",
      key: "user",
    },
    {
      title: t("purchase-rq.field.position"),
      dataIndex: "position.name",
      key: "position",
    },
    {
      title: t("purchase-rq.field.department"),
      dataIndex: "department.name",
      key: "department",
    },
    {
      title: t("purchase-rq.field.rq_date"),
      dataIndex: "requested_date",
      key: "requested_date",
    },
    {
      title: t("purchase-rq.field.doc_type"),
      dataIndex: "document_type.name",
      key: "document_type",
    },
    {
      title: t("purchase_orders.table.status"),
      dataIndex: "status",
      key: "status",
    },
    {
      title: t("purchase_orders.table.action"),
      dataIndex: "action",
      key: "action",
    },
  ];
}
