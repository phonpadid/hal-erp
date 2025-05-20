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
        key: "UnitList",
        label: "ຫົວໜ່ວຍ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "ic:outline-receipt",
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
              icon: "ic:outline-imagesearch-roller",
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
            key: "users",
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
