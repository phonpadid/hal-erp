export function getColumns(t: (key: string) => string) {
  return [
    {
      title: t("positions.field.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("positions.field.created"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("positions.field.updated"),
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("positions.field.manage"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
