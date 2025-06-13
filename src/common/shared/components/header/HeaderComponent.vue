<template>
  <div class="w-full">
    <!-- Header Title -->
    <h5>{{ headerTitle }}</h5>

    <!-- Breadcrumb navigation -->
    <a-breadcrumb class="mb-4">
      <a-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index">
        {{ item }}
      </a-breadcrumb-item>
    </a-breadcrumb>

    <!-- Header section with document info and buttons -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <!-- Document reference number and date -->
        <span class="text-blue-600">{{ documentPrefix }}</span>
        <span>- {{ documentNumber }}</span>
        <span>- {{ formatDate(documentDate) }}</span>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-2">
        <a-button
          v-for="(button, index) in actionButtons"
          :key="index"
          :type="button.type"
          @click="button.onClick"
        >
          {{ button.label }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import dayjs from "dayjs";

// Define the allowed button types
type ButtonType = "default" | "primary" | "dashed" | "text" | "link" | "danger";

interface ActionButton {
  label: string;
  type: ButtonType;
  onClick: () => void;
}

interface Props {
  headerTitle?: string;
  breadcrumbItems?: string[];
  documentPrefix?: string;
  documentNumber?: string;
  documentDate?: Date;
  actionButtons?: ActionButton[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
  headerTitle: "ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ",
  breadcrumbItems: () => ["ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ", "ອະນຸມັດ"],
  documentPrefix: "ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ",
  documentNumber: "0036/ພລ - ວັນທີ",
  documentDate: () => new Date(),
  actionButtons: () => [
    {
      label: "ປະຕິເສດ",
      type: "default" as ButtonType,
      onClick: () => console.log("Cancel clicked"),
    },
    {
      label: "ອະນຸມັດ",
      type: "primary" as ButtonType,
      onClick: () => console.log("Submit clicked"),
    },
  ],
});

// Format date helper function
const formatDate = (date: Date): string => {
  return dayjs(date).format("DD MMM YYYY");
};
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
