import type{ Column } from "@/modules/shared/column/column";

export function Columns(t: (key: string) => string) :Column[] {
  return [
    {
      title: t("product-types.field.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("product-types.field.category"),
      dataIndex: "categoryId",
      key: "categoryId",
    },
    {
      title: t("product-types.field.created"),
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: t("product-types.field.updated"),
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: t("product-types.field.manage"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}