import type { Column } from "@/modules/shared/column/column";

// สร้างฟังก์ชันที่ return columns เพื่อให้สามารถเรียกใช้ useI18n ภายในฟังก์ชันได้
export function column(t: (key: string) => string): Column[] {
  return [
    {
      title: t("role.list.rolename"),
      dataIndex: "name",
      key: "name",
    },
    // {
    //   title: t("role.list.displayName"),
    //   dataIndex: "display_name",
    //   key: "display_name",
    // },
    {
      title: t("role.list.createdAt"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("role.list.updatedAt"),
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("role.list.actions"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
