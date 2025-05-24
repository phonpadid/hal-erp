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
      dataIndex: "user",
      key: "user",
    },
    {
      title: t("departments.dpm.field.name"),
      dataIndex: "department",
      key: "department",
    },
    {
      title: t("departments.dpm_user.field.position"),
      dataIndex: "position",
      key: "position",
    },

    {
      title: t("departments.dpm_user.field.signature"),
      dataIndex: "signature_file",
      key: "signature_file",
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
