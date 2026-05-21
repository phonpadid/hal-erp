<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import { computed, onMounted, ref, watch } from "vue";
import { DownOutlined } from "@ant-design/icons-vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { Tooltip } from "ant-design-vue";
import UiModal from "../components/Modal/UiModal.vue";
import InputSearch from "../components/Input/InputSearch.vue";
import { useGlobalSearchStore } from "@/modules/presentation/Admin/stores/global-search.store";
import { storeToRefs } from "pinia";
import router from "../router/index";

const emit = defineEmits<{ toggle: [] }>();
const { success } = useNotification();
const { t, locale } = useI18n();

const globalSearchStore = useGlobalSearchStore();
const { keyword: globalSearchKeyword } = storeToRefs(globalSearchStore);
const searchInput = ref<string>(globalSearchKeyword.value);

watch(globalSearchKeyword, (value) => {
  if (value !== searchInput.value) {
    searchInput.value = value;
  }
});

const handleGlobalSearch = (value: string) => {
  globalSearchStore.setKeyword(value);
};
const currentLang = ref<string>("");
const data = localStorage.getItem("userData");
const parsed = data ? JSON.parse(data) : null;
const username = parsed?.username || "";
const email = parsed?.email || "";
const lang = computed(() => [
  { name: t("lang.en"), value: "en", icon: "/en.png" },
  { name: t("lang.la"), value: "la", icon: "/lo.png" },
  { name: t("lang.cn"), value: "cn", icon: "/cn.png" },
]);

const showLogoutModal = ref(false);
const confirmLoading = ref(false);
const showMobileSearch = ref(false);

function handleLogout() {
  showLogoutModal.value = true;
}

function handleConfirmLogout() {
  confirmLoading.value = true;
  localStorage.clear();
  router
    .push({
      name: "login",
    })
    .catch(() => {})
    .finally(() => {
      confirmLoading.value = false;
      showLogoutModal.value = false;
    });
}

function handleCancelLogout() {
  showLogoutModal.value = false;
}

const updateCurrentLang = () => {
  const selected = lang.value.find((l) => l.value === locale.value);
  currentLang.value = selected ? selected.name : "Language";
};

const changeLang = (langValue: string) => {
  locale.value = langValue;
  localStorage.setItem("locale", langValue);
  updateCurrentLang();
};
const noti = () => {
  success(t("messages.notification"));
};
onMounted(() => {
  updateCurrentLang();
});

watch(locale, updateCurrentLang);
</script>

<template>
  <header
    class="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-2 sm:px-4 lg:pr-10 bg-white transition-all gap-2"
  >
    <div class="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
      <Icon
        icon="lucide-align-justify"
        width="24"
        height="24"
        class="cursor-pointer flex-shrink-0"
        @click="emit('toggle')"
      />

      <!-- Global search: hidden on phone, shown from sm+ -->
      <div class="hidden sm:block global-search flex-1 max-w-[420px] min-w-0">
        <InputSearch
          v-model="searchInput"
          :placeholder="t('common.searchPlaceholder')"
          @search="handleGlobalSearch"
        />
      </div>

      <!-- Phone: toggleable search icon -->
      <button
        type="button"
        class="sm:hidden flex items-center justify-center w-9 h-9 rounded-full bg-slate-100"
        @click="showMobileSearch = !showMobileSearch"
        aria-label="search"
      >
        <Icon icon="material-symbols:search" width="20" height="20" />
      </button>
    </div>

    <!-- Right cluster -->
    <div class="header-action-container flex items-center gap-1 sm:gap-3 flex-shrink-0">
      <a-dropdown>
        <a
          class="ant-dropdown-link flex items-center ring-1 ring-slate-200 shadow-sm px-2 h-8 rounded-full bg-slate-50 gap-1 sm:gap-2"
          @click.prevent
        >
          <img
            :src="locale === 'la' ? '/lo.png' : locale === 'cn' ? '/cn.png' : '/en.png'"
            alt="flag"
            width="20"
            height="20"
          />
          <span class="hidden sm:inline text-[14px] leading-none">{{ currentLang }}</span>
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
        class="notifycation bg-slate-100 p-1 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer"
        @click="noti"
      >
        <Icon
          icon="material-symbols:notifications-unread-outline"
          width="22"
          height="22"
        />
      </div>
      <Tooltip :title="email" color="red" key="color">
        <div class="profile hidden sm:flex gap-1 items-center max-w-[160px]">
          <img
            src="/public/Profile-PNG-File.png"
            width="32"
            height="32"
            alt=""
          />
          <span class="text-[14px] truncate hidden md:inline">{{ username }}</span>
        </div>
      </Tooltip>

      <div
        class="profile flex items-center cursor-pointer p-1"
        @click="handleLogout"
      >
        <Icon icon="ic:outline-logout" width="22" height="22" />
      </div>
      <UiModal
        :visible="showLogoutModal"
        :title="t('menu-sidebar.logout.title')"
        :confirm-loading="confirmLoading"
        @update:visible="showLogoutModal = false"
        @ok="handleConfirmLogout"
        @cancel="handleCancelLogout"
        :ok-text="t('button.confirm')"
        :cancel-text="t('button.cancel')"
      >
        {{ t("menu-sidebar.logout.description") }}
      </UiModal>
    </div>
  </header>

  <!-- Mobile expanded search bar -->
  <div
    v-if="showMobileSearch"
    class="sm:hidden bg-white px-2 pb-2 border-b border-slate-100"
  >
    <InputSearch
      v-model="searchInput"
      :placeholder="t('common.searchPlaceholder')"
      @search="handleGlobalSearch"
    />
  </div>
</template>

<style scoped></style>
