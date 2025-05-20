interface Column {
  title: string; // must be string exactly
  dataIndex: string;
  key: string;
  align?: string;
}

export function columns(t: (key: string) => string): Column[] {
  return [
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
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("departments.dpm.field.updated") || "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("departments.dpm.field.manege") || "Actions",
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },
  ];
}
