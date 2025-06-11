<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import { computed, onMounted, ref, watch } from "vue";
import { DownOutlined } from "@ant-design/icons-vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { Tooltip } from "ant-design-vue";

const emit = defineEmits<{ toggle: [] }>();
const { success } = useNotification();
const { t, locale } = useI18n();
const currentLang = ref<string>("");
const data = localStorage.getItem("userData");
const parsed = data ? JSON.parse(data) : null;
const username = parsed?.username || "";
const email = parsed?.email || "";
const lang = computed(() => [
  { name: t("lang.en"), value: "en", icon: "/en.png" },
  { name: t("lang.la"), value: "la", icon: "/lo.png" },
]);

const updateCurrentLang = () => {
  const selected = lang.value.find((l) => l.value === locale.value);
  currentLang.value = selected ? selected.name : "Language";
};

const changeLang = (langValue: string) => {
  locale.value = langValue;
  localStorage.setItem("locale", langValue);
  updateCurrentLang(); // make sure currentLang is updated
};
const noti = () => {
  success(t("messages.notification"));
};
onMounted(() => {
  updateCurrentLang();
});

// Optional: Keep currentLang updated if locale changes externally
watch(locale, updateCurrentLang);
</script>

<template>
  <header
    class="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 bg-white transition-all pr-10"
  >
    <Icon
      icon="lucide-align-justify"
      width="24"
      height="24"
      class="cursor-pointer"
      @click="emit('toggle')"
    />

    <!-- change langue  -->
    <div class="header-action-container flex items-center gap-4">
      <a-dropdown>
        <a
          class="ant-dropdown-link flex items-center ring-1 ring-slate-200 shadow-sm px-2 h-8 rounded-full bg-slate-50 gap-2"
          @click.prevent
        >
          <img
            :src="locale === 'la' ? '/lo.png' : '/en.png'"
            alt="flag"
            width="20"
            height="20"
          />
          <span class="text-[14px] leading-none">{{ currentLang }}</span>
          <DownOutlined :style="{ fontSize: '12px' }" />
        </a>

        <template #overlay>
          <a-menu>
            <a-menu-item
              v-for="langue in lang.filter((l) => l.value !== locale)"
              :key="langue.value"
              @click="changeLang(langue.value)"
            >
              <div class="flex items-center gap-2">
                <img :src="langue.icon" alt="flag" width="18" height="18" />
                <span>{{ langue.name }}</span>
              </div>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <div
        class="notifycation bg-slate-100 p-1 rounded-full w-9 h-9 flex items-center justify-center"
      >
        <Icon
          icon="material-symbols:notifications-unread-outline"
          width="24"
          height="24"
          class="cursor-pointer"
          @click="noti"
        />
      </div>
      <Tooltip :title="email" color="red" key="color">
        <div class="profile flex gap-0 items-center">
          <img
            src="/public/Profile-PNG-File.png"
            width="35"
            height="35"
            alt=""
            srcset=""
          />
          <span class="text-[14px]">{{ username }}</span>
        </div>
      </Tooltip>
    </div>
  </header>
</template>


<style scoped></style>
