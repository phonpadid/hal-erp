import type { RouteRecordRaw } from "vue-router";
import ReportPrView from "../../views/reports/ReportPrView.vue";

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
];
