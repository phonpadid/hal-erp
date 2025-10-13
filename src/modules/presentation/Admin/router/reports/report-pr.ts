import type { RouteRecordRaw } from "vue-router";
import ReportPrView from "../../views/reports/ReportPrView.vue";
import ReportReceiptView from "../../views/reports/ReportReceiptView.vue";

export const reportRoutes: RouteRecordRaw[] = [
  {
    path: "/report-purchase-request",
    name: "report_pr",
    component: ReportPrView,
    meta: {
      title: "report",
      requiredAuth: true,
    },
  },
  {
    path: "/report-receipt",
    name: "report_receipt",
    component: ReportReceiptView,
    meta: {
      title: "report-receipt",
      requiredAuth: true,
    },
  },
];
