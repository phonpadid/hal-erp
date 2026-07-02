import type { Column } from "@/modules/shared/column/column";

export function getColumns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("company_products.field.product"),
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: t("company_products.field.company"),
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: t("company_products.field.status"),
      dataIndex: "status",
      key: "status",
      slot: "status",
    },
    {
      title: t("company_products.field.created"),
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: t("company_products.field.manage"),
      dataIndex: "actions",
      key: "actions",
      slot: "actions",
    },
  ];
}
