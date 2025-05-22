export function getColumns(t: (key: string) => string) {
  return [
    {
      title: t("categories.field.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("categories.field.created"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("categories.field.updated"),
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("categories.field.manage"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
