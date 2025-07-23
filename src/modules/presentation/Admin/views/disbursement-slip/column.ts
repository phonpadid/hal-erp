import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("disbursement.field.no"),
      dataIndex: "no",
      key: "no",
    },
    {
      title: t("disbursement.field.created_by"),
      dataIndex: "created_by",
      key: "created_by",
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
      title: t("disbursement.field.manage"),
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },

  ];
}
