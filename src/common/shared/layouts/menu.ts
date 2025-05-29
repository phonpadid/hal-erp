import { h, reactive } from "vue";
import type { ItemType } from "./interfaces/menu.interface";
import { Icon } from "@iconify/vue";
import router from "../router/index";

function logout() {
  localStorage.clear();
  router
    .push({
      name: "login",
    })
    .catch(() => {});
}

export const menuItems: ItemType[] = reactive([
  {
    label: "ເມນູ",
    children: [
      {
        key: "dashboard",
        label: "ແດຊບອດ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "ic:baseline-pie-chart",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "",
        label: "ສ້າງໃບສະເໜີ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "ic:outline-receipt",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "PositionList",
        label: "ຕຳແໜ່ງ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "ic:baseline-person",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "UnitList",
        label: "ຫົວໜ່ວຍ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "ic:round-filter-list",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "CategoryList",
        label: "ປະເພດ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "ic:outline-lan",

              class: "text-base",
            }),
          ]),
      },
      {
        key: "document_typesList",
        label: "ຈັດການປະເພດເອກະສານ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "material-symbols:edit-document-sharp",

              class: "text-base",
            }),
          ]),
      },
      {
        key: "department.index",
        label: "ພະແນກ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "ic:outline-lan",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "department_user.index",
        label: "ຜູ້​ໃຊ້​ພະ​ແນກ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "ic:outline-lan",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "department_approver.index",
        label: "ຜູ້​ອະ​ນຸ​ມັດ​ພະ​ແນກ​​",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "ic:outline-imagesearch-roller",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "user_approval.index",
        label: "ຜູ້ອະນຸມັດເອກະສານ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "ic:outline-imagesearch-roller",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "currencies.index",
        label: "ສະກຸນເງິນ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "ic:outline-currency-rupee",
              class: "text-base",
            }),
          ]),
      },
    ],

    type: "group",
  },
  {
    label: "",
    children: [
      { type: "divider" },

      {
        key: "12",
        label: "ຈັດການຜູ້ໃຊ້",
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
            label: "ຜູ້ໃຊ້",
          },
          {
            key: "roleList",
            label: "ບົດບາດ",
          },
          {
            key: "permissionsList",
            label: "ການອານຸຍາດ",
          },
        ],
      },
    ],
    type: "group",
  },
  {
    label: "ລາຍງານ",
    children: [
      {
        key: "payments",
        label: "ລາຍງານ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "material-symbols:signal-cellular-alt-rounded",
              class: "text-base",
            }),
          ]),
      },
      {
        key: "logout",
        label: "ອອກຈາກລະບົບ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "streamline:interface-logout-circle-arrow-enter-right-logout-point-circle",
              class: "text-base",
            }),
          ]),
        onClick: logout,
      },
    ],
    type: "group",
  },
]);
