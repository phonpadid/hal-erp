<template>
  <div class="w-full">
    <!-- Header Title -->
    <h5 v-if="showTitle">{{ headerTitle }}</h5>

    <!-- Breadcrumb navigation -->
    <a-breadcrumb v-if="showBreadcrumb" class="mb-4">
      <a-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index">
        {{ item }}
      </a-breadcrumb-item>
    </a-breadcrumb>

    <!-- Header section with document info and buttons -->
    <div class="flex justify-between items-center">
      <!-- Document reference number and date -->
      <div class="flex items-center gap-2">
        <span v-if="showDocumentPrefix" class="text-blue-600">{{ documentPrefix }}</span>
        <span v-if="showDocumentNumber">- {{ documentNumber }}</span>
        <span v-if="showDocumentDate">- {{ formatDate(documentDate) }}</span>
      </div>

      <!-- Action buttons -->
      <div v-if="showActionButtons" class="flex gap-2">
        <template v-for="(button, index) in visibleButtons" :key="index">
          <a-button :type="button.type" @click="button.onClick" :class="button.class">
            <template v-if="button.icon" #icon>
              <Icon :icon="button.icon" />
            </template>
            {{ button.label }}
          </a-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import dayjs from "dayjs";
import { Icon } from "@iconify/vue";

// Define the allowed button types
type ButtonType = "default" | "primary" | "dashed" | "text" | "link" | "danger";

interface ActionButton {
  label: string;
  type: ButtonType;
  onClick: () => void;
  show?: boolean; // Optional flag to control button visibility
  icon?: string; // Optional icon
  class?: string; // Optional CSS classes
}

interface Props {
  headerTitle?: string;
  breadcrumbItems?: string[];
  documentPrefix?: string;
  documentNumber?: string;
  documentDate?: Date;
  actionButtons?: ActionButton[];
  // Control visibility of components
  showTitle?: boolean;
  showBreadcrumb?: boolean;
  showDocumentPrefix?: boolean;
  showDocumentNumber?: boolean;
  showDocumentDate?: boolean;
  showActionButtons?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  headerTitle: "ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ",
  breadcrumbItems: () => ["ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ", "ອະນຸມັດ"],
  documentPrefix: "ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ",
  documentNumber: "0036/ພລ - ວັນທີ",
  documentDate: () => new Date(),
  actionButtons: () => [],
  // Default visibility settings
  showTitle: true,
  showBreadcrumb: true,
  showDocumentPrefix: true,
  showDocumentNumber: true,
  showDocumentDate: true,
  showActionButtons: true,
});

// Computed property to filter visible buttons
const visibleButtons = computed(() => {
  return props.actionButtons.filter((button) => button.show !== false);
});

// Format date helper function
const formatDate = (date: Date): string => {
  return dayjs(date).format("DD MMM YYYY");
};
</script>
