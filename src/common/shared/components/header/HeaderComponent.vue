<template>
  <div class="w-full">
    <!-- Header Title -->
    <!-- <h5 v-if="showTitle">{{ headerTitle }}</h5> -->
    <div v-if="showTitle" class="flex items-center gap-2 mb-4">
      <!-- Prefix Icon -->
      <Icon
        v-if="prefixIcon"
        :icon="prefixIcon"
        :class="[
          'text-xl',
          prefixIconClickable ? 'cursor-pointer hover:text-blue-500' : '',
          prefixIconClass,
        ]"
        @click="prefixIconClickable && emit('prefixIconClick')"
      />

      <!-- Title -->
      <h5
        class="m-0"
        :class="[headerTitleClass, { [`text-${headerTitleColor}`]: headerTitleColor }]"
        :style="
          headerTitleColor && !headerTitleColor.startsWith('text-')
            ? { color: headerTitleColor }
            : {}
        "
      >
        {{ headerTitle }}
      </h5>

      <!-- Suffix Icon -->
      <Icon
        v-if="suffixIcon"
        :icon="suffixIcon"
        :class="[
          'text-xl',
          suffixIconClickable ? 'cursor-pointer hover:text-blue-500' : '',
          suffixIconClass,
        ]"
        @click="suffixIconClickable && emit('suffixIconClick')"
      />
    </div>
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
        <span v-if="showDocumentDate">- {{ documentDate }}</span>
        <span v-if="showDocumentStatus && documentStatus" :class="['ml-2', documentStatusClass]">
          {{ documentStatus }}
        </span>
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
  documentDate?: string ;
  actionButtons?: ActionButton[];
  // Control visibility of components
  headerTitleColor?: string;
  headerTitleClass?: string;
  showTitle?: boolean;
  showBreadcrumb?: boolean;
  showDocumentPrefix?: boolean;
  showDocumentNumber?: boolean;
  showDocumentDate?: boolean;
  showActionButtons?: boolean;
  prefixIcon?: string;
  suffixIcon?: string;
  prefixIconClass?: string;
  suffixIconClass?: string;
  prefixIconClickable?: boolean;
  suffixIconClickable?: boolean;
  documentStatus?: string;
  documentStatusClass?: string;
  showDocumentStatus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  headerTitle: "ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ",
  breadcrumbItems: () => ["ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ", "ອະນຸມັດ"],
  documentPrefix: "ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ",
  documentNumber: "0036/ພລ - ວັນທີ",
  documentDate: "2025-03-26",
  actionButtons: () => [],
  // Default visibility settings
  headerTitleColor: "",
  headerTitleClass: "",
  showTitle: true,
  showBreadcrumb: true,
  showDocumentPrefix: true,
  showDocumentNumber: true,
  showDocumentDate: true,
  showActionButtons: true,
  prefixIcon: "",
  suffixIcon: "",
  prefixIconClass: "",
  suffixIconClass: "",
  prefixIconClickable: false,
  suffixIconClickable: false,
  documentStatus: "",
  documentStatusClass: "",
  showDocumentStatus: true,
});

// Computed property to filter visible buttons
const visibleButtons = computed(() => {
  return props.actionButtons.filter((button) => button.show !== false);
});

const emit = defineEmits<{
  (e: "prefixIconClick"): void;
  (e: "suffixIconClick"): void;
}>();

</script>
