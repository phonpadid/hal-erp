<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { menuItems } from "./menu";
import { useReceiptStore } from "@/modules/presentation/Admin/stores/receipt.store";

defineProps<{ toggle: boolean }>();

const { push } = useRouter();

const selectedKeys = ref<string[]>([""]);
const openKeys = ref<string[]>([""]);

function handleClick({ key, keyPath }: { key: string; keyPath: string[] }) {
  if (key === "logout") return;

  localStorage.setItem("menuKey", JSON.stringify(key));
  localStorage.setItem("subMenuKey", JSON.stringify(keyPath[0]));
  push({ name: key });
}
onMounted(() => {
  const menuKey = localStorage.getItem("menuKey");
  const subMenuKey = localStorage.getItem("subMenuKey");

  selectedKeys.value.push(menuKey ? JSON.parse(menuKey) : "login");
  openKeys.value.push(subMenuKey ? JSON.parse(subMenuKey) : "");
  const store = useReceiptStore();
  store.reportMenu("r");
  store.reportMenu("pr");
  store.reportMenu("po");
});
</script>
<template>
  <nav
    class="fixed top-0 left-0 z-50 w-0 h-full overflow-hidden overflow-y-auto transition-all bg-white whitespace-nowrap"
    :class="{ 'w-[256px] border': toggle }"
  >
    <div class="flex flex-row items-center gap-2 mt-4 ml-4">
      <img
        src="/src/common/shared/assets/images/logo-Hal-ERP.png"
        alt="logo"
        class="w-16 h-16 rounded-full"
      />
      <p class="text-2xl font-sans">HAL ERP</p>
    </div>
    <div class="mt-4">
      <a-menu
        v-model:openKeys="openKeys"
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :items="menuItems"
        @click="handleClick"
      />
    </div>
  </nav>
</template>

<style lang="scss">
:where(.css-dev-only-do-not-override-16pw25h).ant-menu-light .ant-menu-item-selected {
  color: red !important;
}
</style>
