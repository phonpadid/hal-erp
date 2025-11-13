import type { RouteRecordRaw } from "vue-router";

export const quotaRoutes: RouteRecordRaw[] = [
  {
    path: "/quotas",
    name: "quotas",
    component: () => import("../../views/quotas/quota-view/QuotaView.vue"),
    meta: {
      title: "quotas",
      requiresAuth: true,
      breadcrumb: [
        {
          name: "dashboard",
          title: "Dashboard",
        },
        {
          name: "quotas",
          title: "Quotas",
        },
      ],
    },
  },
  {
    path: "/companies/:companyId/quotas",
    name: "quotas.company",
    component: () => import("../../views/quotas/quota-view/QuotaView.vue"),
    meta: {
      title: "company-quotas",
      requiresAuth: true,
      breadcrumb: [
        {
          name: "dashboard",
          title: "Dashboard",
        },
        {
          name: "companies",
          title: "Companies",
        },
        {
          name: "quotas.company",
          title: "Company Quotas",
        },
      ],
    },
  },
  {
    path: "/vendors/:vendorId/quotas",
    name: "quotas.vendor",
    component: () => import("../../views/quotas/quota-view/QuotaView.vue"),
    meta: {
      title: "vendor-quotas",
      requiresAuth: true,
      breadcrumb: [
        {
          name: "dashboard",
          title: "Dashboard",
        },
        {
          name: "vendors",
          title: "Vendors",
        },
        {
          name: "quotas.vendor",
          title: "Vendor Quotas",
        },
      ],
    },
  },
];
