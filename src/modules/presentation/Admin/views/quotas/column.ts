import type { Column } from "@/modules/shared/column/column";

// Create columns function for quota table
export function column(t: (key: string) => string): Column[] {
  return [
    {
      title: "ປີ",
      dataIndex: "year",
      key: "year",
      width: 120,
    },
    {
      title: "ຮ້ານຄ້າ/ຜູ້ຂາຍ",
      dataIndex: "vendor",
      key: "vendor",
      width: 180,
    },
    {
      title: "ສິນຄ້າ",
      dataIndex: "product_name",
      key: "product_name",
      width: 200,
    },
    {
      title: "ປະເພດສິນຄ້າ",
      dataIndex: "product_type",
      key: "product_type",
      width: 150,
    },
    {
      title: "ຈຳນວນ",
      dataIndex: "qty",
      key: "qty",
      width: 100,
      align: "center",
    },
    {
      title: "ຫົວໜ່ວຍ",
      dataIndex: "unit",
      key: "unit",
      width: 100,
      align: "center",
    },
    {
      title: "ວັນທີສ້າງ",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
    },
    {
      title: "ວັນທີອັບເດດ",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 120,
    },
    {
      title: t("common.actions"),
      dataIndex: "actions",
      key: "actions",
      width: 120,
      align: "center",
    },
  ];
}

// Export the old format for backward compatibility
export const columns = column;
