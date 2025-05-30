import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("user.form.username"),
      dataIndex: "approver.username",
      key: "username",
    },
    {
      title: t("user.form.tel"),
      dataIndex: "approver.tel",
      key: "tel",
    },
    {
      title: t("departments.dpm.field.name"),
      dataIndex: "department.name",
      key: "name",
    },
    {
      title: t("budget-apv-rule.field.min"),
      dataIndex: "min_amount",
      key: "min_amount",
    },
    {
      title: t("budget-apv-rule.field.max"),
      dataIndex: "max_amount",
      key: "max_amount",
    },
    {
      title: t("budget-apv-rule.field.created"),
      dataIndex: "created_at",
      key: "createdAt",
    },
    {
      title: t("budget-apv-rule.field.updated"),
      dataIndex: "updated_at",
      key: "updatedAt",
    },
    {
      title: t("budget-apv-rule.field.manege"),
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },
  ];
}
