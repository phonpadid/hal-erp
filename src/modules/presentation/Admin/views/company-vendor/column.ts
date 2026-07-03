import type { Column } from "@/modules/shared/column/column";

export function getColumns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("company_vendors.field.vendor"),
      dataIndex: "vendor_name",
      key: "vendor_name",
    },
    {
      title: t("company_vendors.field.company"),
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: t("company_vendors.field.credit_term_days"),
      dataIndex: "credit_term_days",
      key: "credit_term_days",
    },
    {
      title: t("company_vendors.field.credit_limit"),
      dataIndex: "credit_limit",
      key: "credit_limit",
    },
    {
      title: t("company_vendors.field.payment_term"),
      dataIndex: "payment_term",
      key: "payment_term",
    },
    {
      title: t("company_vendors.field.status"),
      dataIndex: "status",
      key: "status",
      slot: "status",
    },
    {
      title: t("company_vendors.field.manage"),
      dataIndex: "actions",
      key: "actions",
      slot: "actions",
    },
  ];
}
