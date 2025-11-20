import type { Column } from "@/modules/shared/column/column";

// Create columns function for quota table
export function column(t: (key: string) => string): Column[] {
  return [
    // {
    //   title: "ID",
    //   dataIndex: "id",
    //   key: "id",
    //   width: 80,
    //   align: "center",
    // },
    // {
    //   title: "ຮ້ານຄ້າ",
    //   dataIndex: "vendor_name",
    //   key: "vendor_name",
    //   width: 180,
    // },
    {
      title: "ສິນຄ້າ",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "ຈຳນວນ",
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: "ປີ",
      dataIndex: "year",
      key: "year",
    },
    {
      title: "ວັນທີສ້າງ",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "ວັນທີອັບເດດ",
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("common.actions"),
      dataIndex: "actions",
      key: "actions",
    },
  ];
}

// Export the old format for backward compatibility
export const columns = column;
