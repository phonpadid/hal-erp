<script setup lang="ts">
import Table from "@/common/shared/components/table/Table.vue";
import { column } from "../role/column";
import { useI18n } from "vue-i18n";
import { dataDpm } from "@/modules/shared/utils/data.department";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
const { t } = useI18n();
const statusCards = [
  {
    label: "ກຳລັງດຳເນີນ",
    count: 12,
    color: "text-yellow-600",
    icon: "📄",
  },
  {
    label: "ສຳເລັດ",
    count: 12,
    color: "text-green-600",
    icon: "✅",
  },
  {
    label: "ປະຕິເສດ",
    count: 12,
    color: "text-red-600",
    icon: "❌",
  },
];
</script>
<template>
  <div class="container mx-auto py-6">
    <!-- Header Cards -->
    <div class="bg-white rounded-md shadow-sm p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="(card, index) in statusCards"
          :key="index"
          class="flex items-center space-x-4"
        >
          <div class="text-3xl" :class="card.color">
            {{ card.icon }}
          </div>
          <div>
            <p class="text-gray-600">{{ card.label }}</p>
            <p class="text-xl font-semibold" :class="card.color">
              {{ card.count }} ໃບສະເໜີ
            </p>
          </div>
        </div>
      </div>
<div class="search flex justify-between gap-[15rem]">
  <div class="input w-full flex gap-4">
    <InputSelect placeholder="ທັງໝົດ"></InputSelect>
    <InputSelect placeholder="ທັງໝົດ"></InputSelect>
    <UiButton>ຄົ້ນຫາ</UiButton>
  </div>
  <div class="add">
    <UiButton>ສ້າງໃບສັ່ງຊື້</UiButton>
  </div>
</div>
    </div>

    <!-- Table Placeholder -->
    <div class="mt-8 bg-white rounded-md shadow-sm p-6">
      <!-- Replace this with your real table -->
      <p class="text-gray-500">
        <Table
        :columns="column(t)"
      :dataSource="dataDpm"
      :pagination="{ pageSize: 10 }"
      row-key="id"
        >

        </Table>
      </p>
    </div>
  </div>
</template>
