import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("user.list.username"),
      dataIndex: "username",
      key: "username",
    },
    {
      title: t("user.list.firstName"),
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: t("user.list.lastName"),
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: t("user.list.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("user.list.tel"),
      dataIndex: "tel",
      key: "tel",
    },

    {
      title: t("user.list.createdAt"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("user.list.updatedAt"),
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("user.list.actions"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
