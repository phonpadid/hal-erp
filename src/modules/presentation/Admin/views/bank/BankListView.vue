<script setup lang="ts">
import { ref } from 'vue';
import InputSearch from '@/common/shared/components/Input/InputSearch.vue';
import { useI18n } from 'vue-i18n';
import UiButton from '@/common/shared/components/button/UiButton.vue';

const { t } = useI18n();
const search = ref<string>("");
const handleSearch = async()=>{}
</script>
<template>
  <div class="position-list-container p-16">
    <div class="mb-6 gap-4">
      <!-- Title -->
      <h1 class="text-2xl font-semibold">
        {{ t("banks.title") }}
      </h1>
      <div class="flex justify-between gap-20">
        <div class="w-[20rem]">
          <InputSearch
          v-model:value="search" @keyup.enter="handleSearch"
          :placeholder="t('banks.placeholder.search')"
          />
        </div>
        <UiButton type="primary" icon="ant-design:plus-outlined" @click=""
        colorClass="flex items-center"
        >
          {{ t("banks.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Table -->
     <Table>
      <template #actions="{record}">
        <div class="flex gap-2">
          <UiButton type="" icon="ant-design:edit-outlined" size="small" @click=""
            colorClass="flex items-center justify-center text-orange-400" />
          <UiButton type="" danger icon="ant-design:delete-outlined"
            colorClass="flex items-center justify-center text-red-700" size="small" @click="" />
        </div>
      </template>
     </Table>
  </div>
</template>

<style scoped>
.position-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
