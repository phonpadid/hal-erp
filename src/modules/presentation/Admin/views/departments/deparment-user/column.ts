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
      key: "username",
    },
    {
      title: t("departments.dpm_user.field.email"),
      dataIndex: "user.email",
      key: "email",
    },
    {
      title: t("departments.dpm_user.field.tel"),
      dataIndex: "user.tel",
      key: "tel",
    },
    // {
    //   title: t("departments.dpm.field.name"),
    //   dataIndex: "department.name",
    //   key: "department",
    // },
    {
      title: t("departments.dpm_user.field.position"),
      dataIndex: "position.name",
      key: "position",
    },

    {
      title: t("departments.dpm_user.field.signature"),
      dataIndex: "signature_file",
      key: "signature_file",
    },
    {
      title: t("departments.dpm.field.created"),
      dataIndex: "created_at",
      key: "createdAt",
    },
    {
      title: t("departments.dpm.field.updated"),
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("departments.dpm.field.manege"),
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },
  ];
}
