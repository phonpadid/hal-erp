<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { menuItems } from "./menu";
import { useReceiptStore } from "@/modules/presentation/Admin/stores/receipt.store";

defineProps<{ toggle: boolean }>();
const emit = defineEmits<{ close: [] }>();

const { push } = useRouter();

const selectedKeys = ref<string[]>([""]);
const openKeys = ref<string[]>([""]);

function handleClick({ key, keyPath }: { key: string; keyPath: string[] }) {
  if (key === "logout") return;

  localStorage.setItem("menuKey", JSON.stringify(key));
  localStorage.setItem("subMenuKey", JSON.stringify(keyPath[0]));
  push({ name: key });

  if (typeof window !== "undefined" && window.innerWidth < 768) {
    emit("close");
  }
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
    class="fixed top-0 left-0 z-50 h-full overflow-hidden overflow-y-auto transition-all duration-200 ease-in-out bg-white whitespace-nowrap"
    :class="[
      toggle
        ? 'w-[85vw] sm:w-[320px] md:w-[256px] border shadow-xl md:shadow-none'
        : 'w-0 border-0',
    ]"
  >
    <div class="flex flex-row items-center gap-2 mt-4 ml-4 pr-4">
      <img
        src="/src/common/shared/assets/images/log-hallogictic.jpeg"
        alt="logo"
        class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex-shrink-0"
      />
      <p class="text-xl sm:text-2xl font-sans truncate">HAL ERP</p>
    </div>
    <div class="mt-4">
      <a-menu
        v-model:openKeys="openKeys"
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :items="menuItems"
        @click="handleClick"
        class="pb-6"
      />
    </div>
  </nav>
</template>

<style lang="scss">
:where(.css-dev-only-do-not-override-16pw25h).ant-menu-light .ant-menu-item-selected {
  color: red !important;
}
</style>
