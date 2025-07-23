<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useUserStore } from "../../stores/user.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import type { UserInterface } from "@/modules/interfaces/user.interface";
import ManageUserForm from "./ManageUserForm.vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { success, error: showError } = useNotification();
const { t } = useI18n();
const loading = ref(false);
const user = ref<UserInterface | null>(null);

onMounted(async () => {
  if (route.params.id) {
    try {
      loading.value = true;
      const userId = route.params.id as string;
      const userData = await userStore.fetchUserById(userId);
      user.value = userData;
      console.log("Loaded user data:", userData);
    } catch (err) {
      console.error("Error loading user:", err);
      showError(t("user.error.loadFailed"));
      router.push("/users");
    } finally {
      loading.value = false;
    }
  }
});

const handleSubmit = async (formData: any) => {
  try {
    loading.value = true;
    if (route.params.id) {
      await userStore.updateUser(route.params.id as string, formData);
      success(t("user.success.updated"));
    } else {
      await userStore.createUser(formData);
      success(t("user.success.created"));
    }
    router.push("/users");
  } catch (err: any) {
    console.error("Failed to save user:", err);
    showError(err.message || t("user.error.saveFailed"));
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push("/users");
};
</script>

<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-semibold">
        {{ route.params.id ? t("user.modal.edit") : t("user.modal.create") }}
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow">
      <ManageUserForm
        :user="user"
        :is-edit-mode="!!route.params.id"
        :loading="loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
