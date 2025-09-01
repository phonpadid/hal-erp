/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TableColumnType } from "ant-design-vue";

export const columns = (t: (key: string) => string): TableColumnType<any>[] => [
  {
    title: t("purchase_qequest.table.image"),
    dataIndex: "file_name_url",
    key: "file_name_url",
  },
  {
    title: t("purchase_qequest.table.title"),
    dataIndex: "title",
    key: "title",
  },
  {
    title: t("purchase_qequest.table.quantity"),
    dataIndex: "quantity",
    key: "quantity",
  },
  {
    title: t("purchase_qequest.table.unit"),
    dataIndex: "unit",
    key: "unit",
    customRender: ({ record }) => record.unit?.name || "-",
  },
  {
    title: t("purchase_qequest.table.price"),
    dataIndex: "price",
    key: "price",
    customRender: ({ text }) => formatCurrency(text),
  },
  {
    title: t("purchase_qequest.table.total_price"),
    dataIndex: "total_price",
    key: "total_price",
    customRender: ({ text }) => formatCurrency(text),
  },
  {
    title: t("purchase_qequest.table.remark"),
    dataIndex: "remark",
    key: "remark",
  },
   {
    title: t("purchase_qequest.table.vendor"), 
    dataIndex: "vendor",
    key: "vendor",
  },
  {
    title: t("purchase_qequest.table.action"),
    dataIndex: "action",
    key: "action",
  },
];

// ฟังก์ชันสำหรับจัดรูปแบบตัวเลขเงิน
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    minimumFractionDigits: 0,
  }).format(value);
};
