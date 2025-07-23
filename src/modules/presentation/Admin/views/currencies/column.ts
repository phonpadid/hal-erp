import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("currency.field.code") || "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("currency.field.name") || "Department Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("currency.field.created") || "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: t("currency.field.updated") || "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: t("currency.field.manege") || "Actions",
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },
  ];
}
