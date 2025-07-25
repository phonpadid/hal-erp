import type { Column } from "@/modules/shared/column/column";

export function columnsDetailsDirector(t: (key: string) => string): Column[] {
  return [
    {
      title: t("director.table.number"),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("director.table.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("director.table.code"),
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("director.table.quantity"),
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: t("director.table.unit"),
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: t("director.table.price"),
      dataIndex: "price",
      key: "price",
    },
    {
      title: t("director.table.total"),
      dataIndex: "total",
      key: "total",
    },
  ];
}
