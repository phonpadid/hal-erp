import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("departments.dpm.field.code") || "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("departments.dpm.field.code") || "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("departments.dpm.field.code") || "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("departments.dpm.field.name") || "Department Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("departments.dpm.field.created") || "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: t("departments.dpm.field.updated") || "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: t("departments.dpm.field.manege") || "Actions",
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },
  ];
}
