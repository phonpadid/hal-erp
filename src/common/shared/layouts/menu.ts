import { computed, h } from "vue";
import type { ItemType } from "./interfaces/menu.interface";
import { Icon } from "@iconify/vue";
import { t } from "@/common/config/i18n/i18n.config";

export const menuItems = computed<ItemType[]>(() => [
  {
    label: t("menu-sidebar.menu"),
    children: [
      {
        key: "dashboard",
        label: t("menu-sidebar.dashboard"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "ic:baseline-pie-chart",
              class: "text-base",
            }),
          ]),
      },

      /** ຈັດການຂໍ້ມູນຫຼັກ */
      {
        label: "",
        children: [
          { type: "divider" },
          {
            key: "1",
            label: t("menu-sidebar.manage"),
            icon: () =>
              h("div", {}, [
                h(Icon, {
                  icon: "material-symbols:auto-transmission-outline",
                  class: "text-base",
                }),
              ]),
            children: [
              {
                key: "position.index",
                label: t("menu-sidebar.position"),
              },
              {
                key: "currencies.index",
                label: t("menu-sidebar.currency"),
              },
              {
                key: "unit.index",
                label: t("menu-sidebar.unit"),
              },
              {
                key: "category.index",
                label: t("menu-sidebar.category"),
              },
              {
                key: "document.type.index",
                label: t("menu-sidebar.document_type"),
              },
              {
                key: "vendors.index",
                label: t("menu-sidebar.vendor"),
              },
              {
                key: "user_approval.index",
                label: t("menu-sidebar.user_approval"),
              },
              {
                key: "budget_apv_rule.index",
                label: t("menu-sidebar.budget_apv_rule"),
              },
              {
                key: "approval_workflows.index",
                label: t("menu-sidebar.approval_workflow"),
              },
            ],
          },
        ],
        type: "group",
      },

      //department group
      {
        label: "",
        children: [
          { type: "divider" },
          {
            key: "2",
            label: t("menu-sidebar.department_manage"),
            icon: () =>
              h("div", {}, [
                h(Icon, {
                  icon: "material-symbols:auto-transmission-outline",
                  class: "text-base",
                }),
              ]),
            children: [
              {
                key: "department.index",
                label: t("menu-sidebar.department"),
              },
              {
                key: "department_approver.index",
                label: t("menu-sidebar.department_approver"),
              },
              {
                key: "department_user.index",
                label: t("menu-sidebar.department_user"),
              },
              {
                key: "budget_apv_rule.index",
                label: t("menu-sidebar.budget_apv_rule"),
              },
            ],
          },
        ],
        type: "group",
      },

      /** Budget */
      {
        label: "",
        children: [
          { type: "divider" },
          {
            key: "3",
            label: t("menu-sidebar.budget_manage"),
            icon: () =>
              h("div", {}, [
                h(Icon, {
                  icon: "material-symbols:folder-managed-outline",
                  class: "text-base",
                }),
              ]),
            children: [
              {
                key: "budget-accounts",
                label: t("menu-sidebar.budget_account"),
              },
              {
                key: "budget-items",
                label: t("menu-sidebar.budget_item"),
              },
              // {
              //   key: "budget-items-details",
              //   label: t("menu-sidebar.budget_item_detail"),
              // },
            ],
          },
        ],
        type: "group",
      },

      /** User */
      {
        label: "",
        children: [
          { type: "divider" },
          {
            key: "5",
            label: t("menu-sidebar.user_manage"),
            icon: () =>
              h("div", {}, [
                h(Icon, {
                  icon: "mdi:user",
                  class: "text-base",
                }),
              ]),
            children: [
              {
                key: "userList",
                label: t("menu-sidebar.user"),
              },
              {
                key: "roleList",
                label: t("menu-sidebar.role"),
              },
              {
                key: "permissionsList",
                label: t("menu-sidebar.permission"),
              },
            ],
          },
        ],
        type: "group",
      },

      {
        key: "",
        label: t("menu-sidebar.purchase_orde"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "ic:outline-receipt",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "purchaseRequestsList",
        label: t("menu-sidebar.purchaseRequests"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "mdi:file-document-box-outline",
              class: "text-base",
            }),
          ]),
      },

      {
        key: "purchaseOrdersList",
        label: t("menu-sidebar.purchaseOrders"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "solar:archive-check-broken",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "approval_department_panak",
        label: t("menu-sidebar.purchasePanak"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "solar:archive-check-broken",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "budget-approval",
        label: t("menu-sidebar.budgetApproval"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "solar:archive-check-broken",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "director-list",
        label: t("menu-sidebar.director"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "solar:archive-check-broken",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "review-money-list",
        label: t("menu-sidebar.reviewMoney"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "solar:archive-check-broken",
              class: "text-base",
            }),
          ]),
      },

      //purchase-rq
      {
        key: "purchase_request.index",
        label: t("menu-sidebar.purchase_rq"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "material-symbols:app-registration-outline",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "apv_purchase_request.index",
        label: t("menu-sidebar.apv_purchase_rq"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "material-symbols:app-registration-outline",
              class: "text-base",
            }),
          ]),
      },

      //disbursement
      {
        key: "accounting-department.index",
        label: t("menu-sidebar.accounting_dpm"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "material-symbols:app-registration-outline",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "accounting-department-check.index",
        label: t("menu-sidebar.accounting_dpm_check"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "material-symbols:app-registration-outline",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "financial-department-transfer.index",
        label: t("menu-sidebar.financial_dpm_transfer"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "material-symbols:app-registration-outline",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "approval-by-finance-department.index",
        label: t("menu-sidebar.approval_finance_dpm"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "material-symbols:app-registration-outline",
              class: "text-base",
            }),
          ]),
      },
    ],

    type: "group",
  },

  {
    label: t("menu-sidebar.report"),
    children: [
      {
        key: "payments",
        label: t("menu-sidebar.report"),
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "material-symbols:signal-cellular-alt-rounded",
              class: "text-base",
            }),
          ]),
      },
    ],
    type: "group",
  },
]);
