import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("disbursement.field.no"),
      dataIndex: "id",
      key: "id",
    },
     {
      title: t("disbursement.field.receipt_number"),
      dataIndex: "receipt_number",
      key: "receipt_number",
    },
    {
      title: t("disbursement.field.created_by"),
      dataIndex: "document.requester.username",
      key: "created_by",
    },
     {
      title: t("disbursement.field.total"),
      dataIndex: "document.total",
      key: "total",
    },
    {
      title: t("disbursement.field.created_at"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("disbursement.field.status"),
      dataIndex: "status",
      key: "status",
    },
    {
      title: t("disbursement.field.current_approver"),
      dataIndex: "current_approver",
      key: "current_approver",
    },

    {
      title: t("disbursement.field.manage"),
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },

  ];
}
