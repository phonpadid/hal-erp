import { computed, h } from "vue";
import type { ItemType } from "./interfaces/menu.interface";
import { Icon } from "@iconify/vue";
import { t } from "@/common/config/i18n/i18n.config";
import { usePermissions } from "../store/usePermissions";
import { useReceiptStore } from "@/modules/presentation/Admin/stores/receipt.store";
const rStore = useReceiptStore();
export const menuItems = computed<ItemType[]>(() => {
  const { hasPermission, hasCompanyPermission } = usePermissions();
  const manageMenuItems = [
    { key: "position.index", label: t("menu-sidebar.position"), companyPermission: "read-position" },

    { key: "currencies.index", label: t("menu-sidebar.currency"), permission: "read-currency" },

    { key: "unit.index", label: t("menu-sidebar.unit"), permission: "read-unit" },

    { key: "category.index", label: t("menu-sidebar.category"), permission: "read-category" },

    { key: "product-type.index", label: t("menu-sidebar.product_type"), permission: "read-product-type" },

    { key: "product.index", label: t("menu-sidebar.product"), permission: "read-product" },

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

      companyPermission: "read-approval-workflow",
    },
    {
      key: "exchange-rate.index",
      label: t("menu-sidebar.exchange_rate"),
      permission: "read-exchange-rate",
    },

    { key: "quotas", label: t("menu-sidebar.quota"), permission: "read-quota" },
  ].filter((item) => {
    if (item.companyPermission) {
      return hasCompanyPermission(item.companyPermission);
    }
    return hasPermission(item.permission!);
  });

  const departmentMenuItems = [
    { key: "department.index", label: t("menu-sidebar.department"), companyPermission: "read-department" },
    {
      key: "department_approver.index",
      label: t("menu-sidebar.department_approver"),
      companyPermission: "read-department-approver",
    },
    {
      key: "department_user.index",
      label: t("menu-sidebar.department_user"),
      companyPermission: "read-department-user",
    },
    {
      key: "department_role.index",
      label: t("menu-sidebar.department_role"),
      companyPermission: "read-department-role",
    },
  ].filter((item) => hasCompanyPermission(item.companyPermission));

  const budgetMenuItems = [
    {
      key: "budget-accounts",
      label: t("menu-sidebar.budget_account"),
      companyPermission: "read-budget-account",
    },
    // {
    //   key: "budget-items",
    //   label: t("menu-sidebar.budget_item"),
    //   permission: "read-budget-item",
    // },
    {
      key: "budget_apv_rule.index",
      label: t("menu-sidebar.budget_apv_rule"),
      companyPermission: "read-budget-approval-rule",
    },
  ].filter((item) => hasCompanyPermission(item.companyPermission));

  // const budgetApprovalMenuItems = [
  //   {
  //     key: "budget-approval",
  //     label: h("div", { class: "flex items-center gap-2" }, [
  //       h("span", t("menu-sidebar.budgetApproval")),
  //       h(
  //         "span",
  //         {
  //           class:
  //             "rounded-full bg-red-500 text-white text-xs px-2 py-0.5 min-w-[20px] text-center",
  //         },
  //         rStore.counts.po?.toString() ?? "0"
  //       ),
  //     ]),
  //     icon: () =>
  //       h("div", {}, [
  //         h(Icon, {
  //           icon: "solar:archive-check-broken",
  //           class: "text-base",
  //         }),
  //       ]),
  //     permission: "read-budget-approval-rule",
  //     // permission: "read-budget-approval",
  //   },
  // ].filter((item) => hasPermission(item.permission));

  // const budgetApprovalRuleMenuItems = [
  //   {
  //     key: "budget_apv_rule.index",
  //     label: t("menu-sidebar.budget_apv_rule"),
  //     icon: () =>
  //       h("div", {}, [
  //         h(Icon, {
  //           icon: "mdi:account-check",
  //           class: "text-base",
  //         }),
  //       ]),
  //     permission: "read-budget-approval-rule",
  //   },
  // ].filter((item) => hasPermission(item.permission));
  const reportMenu = [
    {
      key: "report_pr",
      label: t("menu-sidebar.report_pr"),
      permission: "read-budget-approval-rule",
    },
    {
      key: "report_po",
      label: t("menu-sidebar.report_po"),
      permission: "read-budget-approval-rule",
    },
    {
      key: "report_receipt",
      label: t("menu-sidebar.report_receipt"),
      permission: "read-budget-approval-rule",
    },

  ].filter((item) => hasPermission(item.permission));

  const receiptsMenuItems = [
    {
      key: "approval-receipt.index",
      label: h("div", { class: "flex items-center gap-2" }, [
        h("span", t("menu-sidebar.receipt_approved")),
        h(
          "span",
          {
            class:
              "rounded-full bg-red-500 text-white text-xs px-2 py-0.5 min-w-[20px] text-center",
          },
          rStore.counts.r?.toString() ?? "0"
        ),
      ]),
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

  // const userApprovalMenuItems = [
  //   {
  //     key: "user_approval.index",
  //     label: t("menu-sidebar.user_approval"),
  //     icon: () =>
  //       h("div", {}, [
  //         h(Icon, {
  //           icon: "ic:outline-imagesearch-roller",
  //           class: "text-base",
  //         }),
  //       ]),
  //     permission: "read-user-approval",
  //   },
  // ].filter((item) => hasPermission(item.permission));

  const userManageMenuItems = [
    { key: "userList", label: t("menu-sidebar.user"), permission: "read-user" },

    { key: "roleList", label: t("menu-sidebar.role"), permission: "read-role" },

    { key: "permissionsList", label: t("menu-sidebar.permission"), permission: "read-permission" },
  ].filter((item) => hasPermission(item.permission));

  const prManageMenuItems = [
    // {
    //   key: "purchaseRequestsList",
    //   label: h("div", { class: "flex items-center gap-2" }, [
    //     h("span", t("menu-sidebar.purchaseRequests")),
    //     h(
    //       "span",
    //       {
    //         class:
    //           "rounded-full bg-red-500 text-white text-xs px-2 py-0.5 min-w-[20px] text-center",
    //       },
    //       rStore.counts.pr?.toString() ?? "0"
    //     ),
    //   ]),
    //   permission: "read-purchase-request",
    // },
    // {
    //   key: "purchase_request.index",
    //   label: h("div", { class: "flex items-center gap-2" }, [
    //     h("span", t("menu-sidebar.purchase_rq")),
    //     h(
    //       "span",
    //       {
    //         class:
    //           "rounded-full bg-red-500 text-white text-xs px-2 py-0.5 min-w-[20px] text-center",
    //       },
    //       rStore.counts.pr?.toString() ?? "0"
    //     ),
    //   ]),
    //   permission: "write-purchase-request",
    // },
    {
      key: "apv_purchase_request.index",

      label: h("div", { class: "flex items-center gap-2" }, [
        h("span", t("menu-sidebar.apv_purchase_rq")),
        h(
          "span",
          {
            class:
              "rounded-full bg-red-500 text-white text-xs px-2 py-0.5 min-w-[20px] text-center",
          },
          rStore.counts.pr?.toString() ?? "0"
        ),
      ]),
      permission: "write-purchase-request",
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

      label: h("div", { class: "flex items-center gap-2" }, [
        h("span", t("menu-sidebar.purchasePanak")),
        h(
          "span",
          {
            class:
              "rounded-full bg-red-500 text-white text-xs px-2 py-0.5 min-w-[20px] text-center",
          },
          rStore.counts.po?.toString() ?? "0"
        ),
      ]),
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

        {
          key: "company.index",

          label: t("menu-sidebar.company"),

          icon: () => h(Icon, { icon: "mdi:company", class: "text-base" }),

          permission: "read-company",
        },

        // {
        //   key: "company-user.index",

        //   label: t("menu-sidebar.company_user"),

        //   icon: () => h(Icon, { icon: "mdi:account-group", class: "text-base" }),

        //   permission: "read-company-user",
        // },

        {
          key: "hal-group.index",

          label: t("menu-sidebar.hal_group"),

          icon: () => h(Icon, { icon: "mdi:account-multiple", class: "text-base" }),

          permission: "read-hal-group",
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
        // ...budgetApprovalMenuItems,
        // {
        //   key: "director-list",
        //   label: t("menu-sidebar.director"),
        //   icon: () => h(Icon, { icon: "solar:archive-check-broken", class: "text-base" }),
        //   permission: "read-director-list",
        // },
        // ...userApprovalMenuItems,
        // ...budgetApprovalRuleMenuItems,
        // ...reportMenu,
        ...(reportMenu.length > 0
          ? [
              {
                label: "",

                children: [
                  { type: "divider" },

                  {
                    key: "2",

                    label: t("menu-sidebar.report"),

                    icon: () =>
                      h(Icon, {
                        icon: "material-symbols:monitoring-sharp",

                        class: "text-base",
                      }),

                    children: reportMenu,
                  },
                ],

                type: "group",
              },
            ]
          : []),
      ],
      type: "group",

    },
  ];

  return menuStructure;
});
