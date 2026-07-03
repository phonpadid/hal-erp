import type { ComposerTranslation } from "vue-i18n";

export const getColumns = (t: ComposerTranslation) => [
  {
    title: t("expressDisbursementRequest.table.no"),
    dataIndex: "no",
    key: "no",
    width: 70,
  },
  {
    title: t("expressDisbursementRequest.table.edr_number"),
    dataIndex: "edr_number",
    key: "edr_number",
  },
  {
    title: t("expressDisbursementRequest.table.purpose"),
    dataIndex: "purpose",
    key: "purpose",
  },
  {
    title: t("expressDisbursementRequest.table.total"),
    dataIndex: "total",
    key: "total",
    align: "right",
  },
  {
    title: t("expressDisbursementRequest.table.status"),
    dataIndex: "status",
    key: "status",
  },
  {
    title: t("expressDisbursementRequest.table.created_at"),
    dataIndex: "createdAt",
    key: "createdAt",
  },
  {
    title: t("expressDisbursementRequest.table.actions"),
    key: "actions",
    align: "center",
    width: 140,
  },
];
