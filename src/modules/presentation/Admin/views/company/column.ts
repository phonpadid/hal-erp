import type{ Column } from "@/modules/shared/column/column";

export function Columns(t: (key: string) => string) :Column[] {
  return [
    {
      title: t("company.field.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("company.field.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("company.field.tel"),
      dataIndex: "tel",
      key: "tel",
    },
    {
      title: t("company.field.address"),
      dataIndex: "address",
      key: "address",
    },
    {
      title: t("company.field.created"),
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: t("company.field.updated"),
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: t("company.field.manage"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}