import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("disbursement.field.no"),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("purchase-rq.field.pr_number"),
      dataIndex: "pr_number",
      key: "pr_number",
    },
    {
      title: t("purchase-rq.field.qty"),
      dataIndex: "itemCount",
      key: "qty",
    },
    {
      title: t("purchase-rq.field.price"),
      dataIndex: "total",
      key: "total",
    },
    {
      title: t("purchase-rq.field.department"),
      dataIndex: "document.department.name",
      key: "department",
    },
    {
      title: t("purchase-rq.description"),
      dataIndex: "purposes",
      key: "purposes",
    },
    {
      title: t("disbursement.field.created_by"),
      dataIndex: "document.requester.username",
      key: "user",
    },
    {
      title: t("purchase-rq.field.date_rq"),
      dataIndex: "requested_date",
      key: "date_rq",
    },
    {
      title: t("disbursement.field.created_at"),
      dataIndex: "created_at",
      key: "created_at",
    },
    // {
    //   title: t("disbursement.field.status"),
    //   dataIndex: "status",
    //   key: "status",
    // },

    {
      title: t("disbursement.field.manage"),
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },

  ];
}
