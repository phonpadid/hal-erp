import type { Column } from "@/modules/shared/column/column";

export function departmentRoleColumn(t: (key: string) => string): Column[] {
  return [
    {
      title: t("role.list.rolename"),
      dataIndex: "name",
      key: "name",
      width: 120
    },
    {
      title: t("departments.dpm.field.name"),
      dataIndex: "department_name",
      key: "department_name",
      width: 120
    },
    // {
    //   title: t("departmentRole.list.permissions"),
    //   dataIndex: "permissions",
    //   key: "permissions",
    // },
    {
      title: t("departments.dpm.field.created"),
      dataIndex: "created_at",
      key: "created_at",
      width: 100
    },
    {
      title: t("departments.dpm.field.updated"),
      dataIndex: "updated_at",
      key: "updated_at",
      width: 100
    },
    {
      title: t("departments.dpm.field.manege"),
      dataIndex: "actions",
      key: "actions",
      width: 80,
      align: "center"
    },
  ];
}
