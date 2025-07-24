import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("documentType.table.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("documentType.table.code"),
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("documentType.table.createdAt"),
      dataIndex: "createdAt",
      key: "created_at",
      scopedSlots: { customRender: "createdAt" },
    },
    {
      title: t("documentType.table.updatedAt"),
      dataIndex: "updatedAt",
      key: "updated_at",
      scopedSlots: { customRender: "updatedAt" },
    },
    {
      title: t("documentType.table.actions"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}
