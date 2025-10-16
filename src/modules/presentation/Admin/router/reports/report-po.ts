import type { RouteRecordRaw } from "vue-router";
import ReportPoView from "../../views/reports/ReportPoView.vue";


export const reportPoRoutes: RouteRecordRaw[] = [
  {
    path: "/report-purchase-order",
    name: "report_po",
    component: ReportPoView,
    meta: {
      title: "report",
      requiredAuth: true,
    },
  },
];
