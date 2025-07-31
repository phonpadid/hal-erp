<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

// Import ที่จำเป็น
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import PurchaseForm from "./PurchaseForm.vue";
import type { ButtonType } from "@/modules/shared/buttonType";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const purchaseFormRef = ref<any>(null);
const loading = ref(false);

const id = route.params.id as string; // ดึง ID จาก URL

const handleUpdate = async () => {
  if (purchaseFormRef.value) {
    loading.value = true;
    const isSaveSuccess = await purchaseFormRef.value.handleSave();
    if (isSaveSuccess) {
      router.push({ name: "purchase_request.index" });
    }
    loading.value = false;
  }
};

// สร้างปุ่มสำหรับ Header
const actionButtons = computed(() => [
  {
    label: t("button.cancel"),
    onClick: () => router.back(), // ปุ่มยกเลิก ให้ย้อนกลับไปหน้าก่อนหน้า
    show: true,
    type: "default" as ButtonType,
    class: "button-hover",
  },
  {
    label: t("purchase-rq.edit"), // "บันทึกการแก้ไข"
    onClick: handleUpdate,
    show: true,
    type: "primary" as ButtonType,
    class: "button-hover",
    loading: loading.value, // ให้ปุ่มแสดง loading ขณะบันทึก
  },
]);
</script>

<template>
  <div class="container mx-auto py-1 px-0">
    <div
      class="fixed px-6 py-4 top-0 z-20 bg-white shadow-sm transition-all duration-150 mt-[4rem] w-full lg:w-[calc(100%-16rem)] left-0 lg:left-64"
    >
      <header-component
        :header-title="t('purchase-rq.edit_purchase_request')"
        :breadcrumb-items="[t('purchase-rq.field.proposal'), t('purchase-rq.edit')]"
        :action-buttons="actionButtons"
      />
    </div>

    <div class="px-2 mt-[10rem]">
      <PurchaseForm ref="purchaseFormRef" :is-editing="true" :request-id="id" />
    </div>
  </div>
</template>
