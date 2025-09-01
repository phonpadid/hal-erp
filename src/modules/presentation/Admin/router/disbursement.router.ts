import type { RouteRecordRaw } from "vue-router";
import AccountingDepartment from "../views/disbursement-slip/AccountingDepartment.vue";
import AccountingDepartmentCheck from "../views/disbursement-slip/AccountingDepartmentCheck.vue";
import ApprovalByFinanceDepartment from "../views/disbursement-slip/ApprovalByFinanceDepartment.vue";
import FinancialDepartmentTransfer from "../views/disbursement-slip/FinancialDepartmentTransfer.vue";
import AccountingDepartmentDetail from "../components/disbursement-slip/accounting-dpm/AccountingDepartmentDetail.vue";
import ApprovalByFinanceDpmDetail from "../components/disbursement-slip/approval-finance-dpm/ApprovalByFinanceDpmDetail.vue";

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
    path: "/accounting-department-detail/:id",
    name: "accounting-department-detail.index",
    component: AccountingDepartmentDetail,
    meta: {
      title: "Accounting department detail",
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

  //apv by finance dpm
  {
    path: "/approval-receipt",
    name: "approval-receipt.index",
    component: ApprovalByFinanceDepartment,
    meta: {
      title: "approval by department ",
      requiredAuth: true,
    },
  },


  {
    path: "/approval-by-finance-department/:id",
    name: "approval-by-finance-department-detail.index",
    component: ApprovalByFinanceDpmDetail,
    meta: {
      title: "approval by department ",
      requiredAuth: true,
    },
  },
  {
    path: "/approval-receipt/:id/account_code=:code",
    name: "approval-receipt-account-code.index",
    component: ApprovalByFinanceDpmDetail,
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
  {
    path: "/financial-department-transfer/:id",
    name: "financial-department-transfer-detail.index",
    component: FinancialDepartmentTransfer,
    meta: {
      title: "financial department transfer",
      requiredAuth: true,
    },
  },
];
