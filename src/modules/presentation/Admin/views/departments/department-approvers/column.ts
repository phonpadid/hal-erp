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
      title: t("departments.dpm_user.field.tel"),
      dataIndex: "user.tel",
      key: "tel",
    },
    {
      title: t("departments.dpm_user.field.email"),
      dataIndex: "user.email",
      key: "email",
    },

    {
      title: t("departments.dpm.field.created"),
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: t("departments.dpm.field.updated"),
      dataIndex: "updatedAt",
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
