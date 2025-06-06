interface Column {
  title: string; // must be string exactly
  dataIndex: string;
  key: string;
  align?: string;
}

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("departments.dpm_user.field.user"),
      dataIndex: "user.username",
      key: "user",
    },
    {
      title: t("departments.dpm.field.name"),
      dataIndex: "department.name",
      key: "department",
    },

    {
      title: t("departments.dpm.field.created"),
      dataIndex: "created_at",
      key: "createdAt",
    },
    {
      title: t("departments.dpm.field.updated"),
      dataIndex: "updated_at",
      key: "updatedAt",
    },
    {
      title: t("departments.dpm.field.manege"),
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },
  ];
}
