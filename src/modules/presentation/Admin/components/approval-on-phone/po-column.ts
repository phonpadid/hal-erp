import type { Column } from "@/modules/shared/column/column";

export function poColumns(t: (key: string) => string, hasBudgetRole?: boolean): Column[] {
  const columns: Column[] = [
    {
      title: t("purchase-rq.field.id"),
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: t("purchase-rq.field.content"),
      dataIndex: "title",
      key: "title",
    },
    {
      title: t("purchase-rq.field.qty"),
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    // {
    //   title: t("purchase-rq.field.unit"),
    //   dataIndex: "unit.name",
    //   key: "unit",
    //   width: 120,
    // },
    {
      title: t("purchase-rq.field.price"),
      dataIndex: "total_price",
      key: "total_price",
      width: 120,
    },
  ];

  // Add budget column only if user has budget role
  if (hasBudgetRole) {
    columns.push({
      title: t('budget_approval.table.id_name'),
      dataIndex: "budget",
      key: "budget",
      width: 150,
    });
  }

  columns.push({
    title: t("purchase-rq.field.remark"),
    dataIndex: "remark",
    key: "remark",
  });

  return columns;
}
