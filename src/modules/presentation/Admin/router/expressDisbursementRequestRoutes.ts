import type { RouteRecordRaw } from "vue-router";

// NOTE: Routes intentionally do NOT set a `permission` meta key. The global
// `permissionGuard` redirects to a route named "unauthorized" that is not
// registered, which throws a vue-router "No match" error. This matches the
// canonical PR/bank convention (routes are auth-gated only; access is gated by
// the sidebar menu + inline `hasPermission()` checks inside the views).
export const expressDisbursementRequestRoutes: RouteRecordRaw[] = [
  {
    path: "/express-disbursement-requests",
    name: "express_disbursement_request.index",
    component: () =>
      import("../views/express-disbursement-requests/ExpressDisbursementRequestListView.vue"),
    meta: {
      Title: "expressDisbursementRequest",
      requiredAuth: true,
    },
  },
  {
    path: "/express-disbursement-requests/create",
    name: "express_disbursement_request.create",
    component: () =>
      import("../views/express-disbursement-requests/CreateExpressDisbursementRequestView.vue"),
    meta: {
      Title: "expressDisbursementRequest",
      requiredAuth: true,
    },
  },
  {
    path: "/express-disbursement-requests/:id/edit",
    name: "express_disbursement_request.edit",
    component: () =>
      import("../views/express-disbursement-requests/UpdateExpressDisbursementRequestView.vue"),
    meta: {
      Title: "expressDisbursementRequest",
      requiredAuth: true,
    },
  },
  {
    path: "/express-disbursement-requests/:id",
    name: "express_disbursement_request.detail",
    component: () =>
      import("../views/express-disbursement-requests/ExpressDisbursementRequestDetailView.vue"),
    meta: {
      Title: "expressDisbursementRequest",
      requiredAuth: true,
    },
  },
  {
    path: "/express-disbursement-requests/:id/approval",
    name: "express_disbursement_request.approval",
    component: () =>
      import("../components/express-disbursement-request/ExpressApprovalDetail.vue"),
    meta: {
      Title: "expressDisbursementRequest",
      requiredAuth: true,
    },
  },
];
