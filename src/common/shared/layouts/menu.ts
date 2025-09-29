import { computed, h } from "vue";
import type { ItemType } from "./interfaces/menu.interface";
import { Icon } from "@iconify/vue";
import { t } from "@/common/config/i18n/i18n.config";
import { usePermissions } from "../store/usePermissions";

export const menuItems = computed<ItemType[]>(() => {
  const { hasPermission } = usePermissions();
  const manageMenuItems = [
    { key: "position.index", label: t("menu-sidebar.position"), permission: "read-position" },

    { key: "currencies.index", label: t("menu-sidebar.currency"), permission: "read-currency" },

    { key: "unit.index", label: t("menu-sidebar.unit"), permission: "read-unit" },

    { key: "category.index", label: t("menu-sidebar.category"), permission: "read-category" },

    { key: "vat.index", label: t("menu-sidebar.vats"), permission: "read-vat" },

    { key: "bank.index", label: t("menu-sidebar.bank"), permission: "read-bank" },

    {
      key: "document.type.index",

      label: t("menu-sidebar.document_type"),

      permission: "read-document-type",
    },

    { key: "vendors.index", label: t("menu-sidebar.vendor"), permission: "read-vendor" },

    // {
    //   key: "user_approval.index",

    //   label: t("menu-sidebar.user_approval"),

    //   permission: "read-user-approval",
    // },

    {
      key: "approval_workflows.index",

      label: t("menu-sidebar.approval_workflow"),

      permission: "read-approval-workflow",
    },
    {
      key: "exchange-rate.index",
      label: t("menu-sidebar.exchange_rate"),
      permission: "read-exchange-rate",
    },
  ].filter((item) => hasPermission(item.permission));

  const departmentMenuItems = [
    { key: "department.index", label: t("menu-sidebar.department"), permission: "read-department" },
    {
      key: "department_approver.index",
      label: t("menu-sidebar.department_approver"),
      permission: "read-department-approver",
    },
    {
      key: "department_user.index",
      label: t("menu-sidebar.department_user"),
      permission: "read-department-user",
    },
  ].filter((item) => hasPermission(item.permission));

  const budgetMenuItems = [
    {
      key: "budget-accounts",
      label: t("menu-sidebar.budget_account"),
      permission: "read-budget-account",
    },
    // {
    //   key: "budget-items",
    //   label: t("menu-sidebar.budget_item"),
    //   permission: "read-budget-item",
    // },
    {
      key: "budget_apv_rule.index",
      label: t("menu-sidebar.budget_apv_rule"),
      permission: "read-budget-approval-rule",
    },
  ].filter((item) => hasPermission(item.permission));

  const budgetApprovalMenuItems = [
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
      permission: "read-budget-approval-rule",
      // permission: "read-budget-approval",
    },
  ].filter((item) => hasPermission(item.permission));

  const budgetApprovalRuleMenuItems = [
    {
      key: "budget_apv_rule.index",
      label: t("menu-sidebar.budget_apv_rule"),
      icon: () =>
        h("div", {}, [
          h(Icon, {
            icon: "mdi:account-check",
            class: "text-base",
          }),
        ]),
      permission: "read-budget-approval-rule",
    },
  ].filter((item) => hasPermission(item.permission));
  const receiptsMenuItems = [
    {
      key: "approval-receipt.index",
      label: t("menu-sidebar.receipt_approved"),
      permission: "read-receipt",
      icon: () =>
        h("div", {}, [
          h(Icon, {
            icon: "material-symbols:receipt-long-outline",
            class: "text-base",
          }),
        ]),
    },
  ].filter((item) => hasPermission(item.permission));

  const userApprovalMenuItems = [
    {
      key: "user_approval.index",
      label: t("menu-sidebar.user_approval"),
      icon: () =>
        h("div", {}, [
          h(Icon, {
            icon: "ic:outline-imagesearch-roller",
            class: "text-base",
          }),
        ]),
      permission: "read-user-approval",
    },
  ].filter((item) => hasPermission(item.permission));

  const userManageMenuItems = [
    { key: "userList", label: t("menu-sidebar.user"), permission: "read-user" },

    { key: "roleList", label: t("menu-sidebar.role"), permission: "read-role" },

    { key: "permissionsList", label: t("menu-sidebar.permission"), permission: "read-permission" },
  ].filter((item) => hasPermission(item.permission));

  const prManageMenuItems = [
    {
      key: "purchaseRequestsList",
      label: t("menu-sidebar.purchaseRequests"),
      permission: "read-purchase-request",
    },
    {
      key: "purchase_request.index",
      label: t("menu-sidebar.purchase_rq"),
      permission: "write-purchase-request",
    },
    {
      key: "apv_purchase_request.index",
      label: t("menu-sidebar.apv_purchase_rq"),
      permission: "read-purchase-request",
    },
  ].filter((item) => hasPermission(item.permission));

  const poManageMenuItems = [
    // {
    //   key: "purchaseOrdersList",

    //   label: t("menu-sidebar.purchaseOrders"),

    //   permission: "read-purchase-order",
    // },
    {
      key: "approval_department_panak",
      label: t("menu-sidebar.purchasePanak"),
      permission: "read-purchase-order",

      // permission: "read-approval-department",
    },
  ].filter((item) => hasPermission(item.permission));
  const menuStructure = [
    {
      label: t("menu-sidebar.menu"),

      children: [
        {
          key: "dashboard",

          label: t("menu-sidebar.dashboard"),

          icon: () => h(Icon, { icon: "ic:baseline-pie-chart", class: "text-base" }),
        },

        ...(manageMenuItems.length > 0
          ? [
              {
                label: "",

                children: [
                  { type: "divider" },

                  {
                    key: "1",

                    label: t("menu-sidebar.manage"),

                    icon: () =>
                      h(Icon, {
                        icon: "material-symbols:auto-transmission-outline",

                        class: "text-base",
                      }),

                    children: manageMenuItems,
                  },
                ],

                type: "group",
              },
            ]
          : []),

        ...(departmentMenuItems.length > 0
          ? [
              {
                label: "",

                children: [
                  { type: "divider" },

                  {
                    key: "2",

                    label: t("menu-sidebar.department_manage"),

                    icon: () =>
                      h(Icon, {
                        icon: "material-symbols:auto-transmission-outline",

                        class: "text-base",
                      }),

                    children: departmentMenuItems,
                  },
                ],

                type: "group",
              },
            ]
          : []),
        ...(budgetMenuItems.length > 0
          ? [
              {
                label: "",

                children: [
                  { type: "divider" },

                  {
                    key: "3",

                    label: t("menu-sidebar.budget_manage"),

                    icon: () =>
                      h(Icon, {
                        icon: "material-symbols:folder-managed-outline",

                        class: "text-base",
                      }),

                    children: budgetMenuItems,
                  },
                ],

                type: "group",
              },
            ]
          : []),

        ...(userManageMenuItems.length > 0
          ? [
              {
                label: "",

                children: [
                  { type: "divider" },

                  {
                    key: "5",

                    label: t("menu-sidebar.user_manage"),

                    icon: () => h(Icon, { icon: "mdi:user", class: "text-base" }),

                    children: userManageMenuItems,
                  },
                ],

                type: "group",
              },
            ]
          : []),

        ...(prManageMenuItems.length > 0
          ? [
              {
                label: "",

                children: [
                  { type: "divider" },

                  {
                    key: "6",

                    label: t("menu-sidebar.pr_manage"),

                    icon: () =>
                      h(Icon, { icon: "mdi:file-document-box-outline", class: "text-base" }),

                    children: prManageMenuItems,
                  },
                ],

                type: "group",
              },
            ]
          : []),
        ...(poManageMenuItems.length > 0
          ? [
              {
                label: "",

                children: [
                  { type: "divider" },

                  {
                    key: "7",

                    label: t("menu-sidebar.po_manage"),

                    icon: () => h(Icon, { icon: "solar:archive-check-broken", class: "text-base" }),

                    children: poManageMenuItems,
                  },
                ],

                type: "group",
              },
            ]
          : []),
        ...receiptsMenuItems,
        ...budgetApprovalMenuItems,
        // {
        //   key: "director-list",
        //   label: t("menu-sidebar.director"),
        //   icon: () => h(Icon, { icon: "solar:archive-check-broken", class: "text-base" }),
        //   permission: "read-director-list",
        // },
        ...userApprovalMenuItems,
        ...budgetApprovalRuleMenuItems,
      ],
      type: "group",
    },
  ];

  return menuStructure;
});
