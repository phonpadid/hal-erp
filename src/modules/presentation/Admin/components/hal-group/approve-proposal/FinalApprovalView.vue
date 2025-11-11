<script setup lang="ts">
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiButton from "@/common/shared/components/button/UiButton.vue";

// Interface for item details
interface ItemDetail {
  id: string;
  requestNumber: string;
  title: string;
  company: string;
  amount: number;
  items: number;
  deliveryPoint: string;
  urgency: string;
  requestDate: string;
  requester: string;
  department: string;
  status: "pending" | "approved" | "rejected";
}

// Props
interface Props {
  selectedItems: ItemDetail[];
  isProcessing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isProcessing: false,
});

// Emits
const emit = defineEmits<{
  approve: [itemIds: string[]];
  cancel: [];
  back: [];
}>();

const { warning } = useNotification();

// State
const confirmationText = ref("");
// Computed properties
const totalAmount = computed(() => {
  return props.selectedItems.reduce((sum, item) => sum + item.amount, 0);
});

const totalItems = computed(() => {
  return props.selectedItems.reduce((sum, item) => sum + item.items, 0);
});

const confirmationRequired = computed(() => {
  return props.selectedItems.length > 0;
});

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("LAK", "₭");
};

// Get status badge class
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get status text
const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "ລໍຖ້າອະນຸມັດ";
    case "approved":
      return "ອະນຸມັດແລ້ວ";
    case "rejected":
      return "ປະຕິເສດ";
    default:
      return status;
  }
};

// Handle approve
const handleApprove = () => {
  if (!confirmationRequired.value) {
    warning("ຄຳເຕືອນ", "ກະລຸນາເລືອກລາຍການທີ່ຕ້ອງການອະນຸມັດ");
    return;
  }

  if (props.selectedItems.length > 5 && confirmationText.value !== "ອະນຸມັດ") {
    warning("ຄຳເຕືອນ", "ກະລຸນາປ້ອນ 'ອະນຸມັດ' ເພື່ອຢັ້ງຢືນການອະນຸມັດຫຼາຍກ່ອນ 5 ລາຍການ");
    return;
  }

  const itemIds = props.selectedItems.map(item => item.id);
  emit("approve", itemIds);
};

// Handle cancel
const handleCancel = () => {
  emit("cancel");
};

// Handle back
const handleBack = () => {
  emit("back");
};

// Get urgency badge class
const getUrgencyBadgeClass = (urgency: string) => {
  switch (urgency) {
    case "urgent":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "normal":
      return "bg-blue-100 text-blue-800";
    case "low":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get urgency text
const getUrgencyText = (urgency: string) => {
  switch (urgency) {
    case "urgent":
      return "ດ່ວນ";
    case "high":
      return "ສູງ";
    case "normal":
      return "ປົກກາງ";
    case "low":
      return "ຕໍ່າ";
    default:
      return urgency;
  }
};
</script>

<template>
  <div class="final-approval-container bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-green-100 rounded-full">
            <Icon icon="mdi:check-circle" class="text-2xl text-green-600" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">ຢັ້ງຢືນການອະນຸມັດໃບສະເໜີ</h1>
            <p class="text-gray-600">ກະລຸນາກວດສອບລາຍການທີ່ຈະອະນຸມັດກ່ອນການດຳເນີນການ</p>
          </div>
        </div>
        <UiButton
          @click="handleBack"
          variant="outline"
          class="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Icon icon="mdi:arrow-left" />
          ກັບຄືນ
        </UiButton>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-blue-600 font-medium">ຈຳນວນລາຍການ</p>
              <p class="text-2xl font-bold text-blue-900">{{ selectedItems.length }}</p>
            </div>
            <Icon icon="mdi:file-document" class="text-2xl text-blue-500" />
          </div>
        </div>

        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-green-600 font-medium">ລາຍການສິນຄ້າ</p>
              <p class="text-2xl font-bold text-green-900">{{ totalItems }}</p>
            </div>
            <Icon icon="mdi:package-variant" class="text-2xl text-green-500" />
          </div>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-yellow-600 font-medium">ມູນຄ່າລວມ</p>
              <p class="text-2xl font-bold text-yellow-900">{{ formatCurrency(totalAmount) }}</p>
            </div>
            <Icon icon="mdi:cash-multiple" class="text-2xl text-yellow-500" />
          </div>
        </div>

        <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-purple-600 font-medium">ສະຖານະ</p>
              <p class="text-lg font-bold text-purple-900">ລໍຖ້າອະນຸມັດ</p>
            </div>
            <Icon icon="mdi:clock" class="text-2xl text-purple-500" />
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Items Table -->
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Icon icon="mdi:format-list-bulleted" class="text-gray-600" />
          ລາຍກາທີ່ເລືອກສຳລັບອະນຸມັດ
        </h2>
      </div>

      <div class="overflow-x-auto">
        <div class="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table class="min-w-full">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ລຳດັບ
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ເລກທີເອກະສານ
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ບໍລິສັດ
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຫົວຂໍ້
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຜູ້ຂໍ
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຈຳນວນ
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ມູນຄ່າ
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຄວາມດ່ວນ
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ສະຖານະ
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(item, index) in selectedItems"
                :key="item.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ index + 1 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ item.requestNumber }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ item.company }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ item.title }}</div>
                  <div class="text-xs text-gray-500">{{ item.deliveryPoint }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ item.requester }}</div>
                  <div class="text-xs text-gray-500">{{ item.department }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span class="text-sm font-medium text-gray-900">{{ item.items }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="text-sm font-bold text-gray-900">
                    {{ formatCurrency(item.amount) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getUrgencyBadgeClass(item.urgency)"
                  >
                    {{ getUrgencyText(item.urgency) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getStatusBadgeClass(item.status)"
                  >
                    {{ getStatusText(item.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 sticky bottom-0">
              <tr>
                <td colspan="6" class="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                  ມູນຄ່າລວມ:
                </td>
                <td class="px-6 py-4 text-lg font-bold text-green-600 text-right">
                  {{ formatCurrency(totalAmount) }}
                </td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Confirmation Section -->
    <div v-if="selectedItems.length > 5" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div class="flex items-start gap-3">
        <Icon icon="mdi:alert" class="text-yellow-600 text-xl mt-0.5" />
        <div>
          <h3 class="text-sm font-semibold text-yellow-800 mb-1">ການຢັ້ງຢືນພິເສດ</h3>
          <p class="text-sm text-yellow-700 mb-2">
            ທ່ານກຳລັງຈະອະນຸມັດຫຼາຍກ່ອນ 5 ລາຍການ. ກະລຸນາປ້ອນ "ອະນຸມັດ" ເພື່ອຢັ້ງຢືນການດຳເນີນການ.
          </p>
          <div class="flex items-center gap-2">
            <input
              v-model="confirmationText"
              type="text"
              placeholder="ພິມ 'ອະນຸມັດ'"
              class="px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center justify-between bg-gray-50 rounded-lg p-4">
      <div class="text-sm text-gray-600">
        <Icon icon="mdi:information" class="inline mr-1" />
        ການອະນຸມັດຈະສົ່ງອີເມວ໌ແຈ້ງໃຫ້ຜູ້ຂໍ ແລະ ບັນທຶກລົງໃນລະບົບ
      </div>

      <div class="flex items-center gap-3">
        <UiButton
          @click="handleCancel"
          variant="outline"
          :disabled="isProcessing"
          class="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Icon icon="mdi:close" />
          ຍົກເລີກ
        </UiButton>

        <UiButton
          @click="handleApprove"
          :disabled="isProcessing || (selectedItems.length > 5 && confirmationText !== 'ອະນຸມັດ')"
          class="px-6 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon
            :icon="isProcessing ? 'mdi:loading' : 'mdi:check-circle'"
            :class="{ 'animate-spin': isProcessing }"
          />
          {{ isProcessing ? 'ກຳລັງດຳເນີນການ...' : `ອະນຸມັດ ${selectedItems.length} ລາຍການ` }}
        </UiButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.final-approval-container {
  min-height: 600px;
}

/* Smooth scrollbar styling */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Sticky header and footer */
.sticky {
  position: sticky;
  z-index: 10;
}

/* Smooth transitions for table rows */
table tbody tr {
  transition: background-color 0.15s ease-in-out;
}

/* Enhanced hover effect */
table tbody tr:hover {
  background-color: #f8fafc !important;
}

/* Loading animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>