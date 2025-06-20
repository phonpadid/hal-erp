import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("purchase-rq.field.pr_number"),
      dataIndex: "pr_number",
      key: "pr_number",
    },
    {
      title: t("purchase-rq.field.user"),
      dataIndex: "username",
      key: "username",
    },
    {
      title: t("purchase-rq.field.position"),
      dataIndex: "position",
      key: "position",
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
      title: t("purchase-rq.field.doc_type"),
      dataIndex: "document_type",
      key: "document_type",
    },
    {
      title: t("purchase-rq.field.status"),
      dataIndex: "status",
      key: "status",
    },
    {
      title: t("purchase-rq.field.manage"),
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },

  ];
}
