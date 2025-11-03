import type { Column } from "@/modules/shared/column/column";

export function Columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("company-user.field.username"),
      dataIndex: "username",
      key: "username",
    },
    {
      title: t("company-user.field.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("company-user.field.tel"),
      dataIndex: "tel",
      key: "tel",
    },
    {
      title: t("company-user.field.roles"),
      dataIndex: "roles",
      key: "roles",
    },
    // {
    //   title: t("company-user.field.permissions"),
    //   dataIndex: "permissions",
    //   key: "permissions",
    // },
    {
      title: t("company-user.field.signature"),
      dataIndex: "signature_url",
      key: "signature_url",
    },
    {
      title: t("company-user.field.created"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("company-user.field.manage"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}