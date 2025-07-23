import type { Column } from "@/modules/shared/column/column";

export function columns(t: (key: string) => string): Column[] {
  return [
    {
      title: t("budget_item_details.field.name"),
      dataIndex: "name",
      key: "name",
    },
    // {
    //   title: t("budget_item_details.field.budget_item"),
    //   dataIndex: "budget_item_id",
    //   key: "budget_item",
    //   scopedSlots: { customRender: "budget_item" },
    // },
    {
      title: t("budget_item_details.field.province"),
      dataIndex: "province",
      key: "province",
      scopedSlots: { customRender: "province" },
    },
    {
      title: t("budget_item_details.field.description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("budget_item_details.field.allocated_amount"),
      dataIndex: "allocated_amount",
      key: "allocated_amount",
    },
    {
      title: t("budget_item_details.field.created"),
      dataIndex: "created_at",
      key: "created_at",
      scopedSlots: { customRender: "created_at" },
    },
    {
      title: t("budget_item_details.field.updated"),
      dataIndex: "updated_at",
      key: "updated_at",
      scopedSlots: { customRender: "updated_at" },
    },
    {
      title: t("budget_item_details.field.manage"),
      dataIndex: "actions",
      key: "actions",
      align: "center",
      scopedSlots: { customRender: "actions" },
    },
  ];
}
