import type { RouteRecordRaw } from "vue-router";
import AccountingDepartment from "../views/disbursement-slip/AccountingDepartment.vue";
import AccountingDepartmentCheck from "../views/disbursement-slip/AccountingDepartmentCheck.vue";
import ApprovalByFinanceDepartment from "../views/disbursement-slip/ApprovalByFinanceDepartment.vue";
import FinancialDepartmentTransfer from "../views/disbursement-slip/FinancialDepartmentTransfer.vue";

export const disbursementRoutes: RouteRecordRaw[] = [
  {
    path: "/accounting-department",
    name: "accounting-department.index",
    component: AccountingDepartment,
    meta: {
      title: "Accounting department",
      requiredAuth: true,
    },
  },
  {
    path: "/accounting-department-check",
    name: "accounting-department-check.index",
    component: AccountingDepartmentCheck,
    meta: {
      title: "Accounting department check",
      requiredAuth: true,
    },
  },
  {
    path: "/approval-by-finance-department",
    name: "approval-by-finance-department.index",
    component: ApprovalByFinanceDepartment,
    meta: {
      title: "approval by department ",
      requiredAuth: true,
    },
  },
  {
    path: "/financial-department-transfer",
    name: "financial-department-transfer.index",
    component: FinancialDepartmentTransfer,
    meta: {
      title: "financial department transfer",
      requiredAuth: true,
    },
  },
];
