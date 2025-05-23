import type { Column } from "@/modules/shared/column/column";
export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("permissions.list.displayName"),
      dataIndex: "display_name",
      key: "display_name",
    },
    {
      title: t("permissions.list.permissionname"),
      dataIndex: "name",
      key: "name",
    },
    // {
    //   title: t("permissions.list.createdAt"),
    //   dataIndex: "created_at",
    //   key: "created_at",
    // },
    // {
    //   title: t("permissions.list.updatedAt"),
    //   dataIndex: "updated_at",
    //   key: "updated_at",
    // },
    // {
    //   title: t("role.list.actions"),
    //   dataIndex: "actions",
    //   key: "actions",
    // },
  ];
}
