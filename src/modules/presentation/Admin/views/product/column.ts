import type { Column } from "@/modules/shared/column/column";

export function Columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("products.field.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("products.field.description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("products.field.productType"),
      dataIndex: "product_type_id",
      key: "product_type_id",
    },
    {
      title: t("products.field.status"),
      dataIndex: "status",
      key: "status",
    },
    {
      title: t("products.field.created"),
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: t("products.field.updated"),
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: t("products.field.manage"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}