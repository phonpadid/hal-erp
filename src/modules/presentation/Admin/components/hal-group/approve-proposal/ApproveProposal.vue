<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Icon } from "@iconify/vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import FinalApprovalView from "./FinalApprovalView.vue";

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
  selectedCompany?: {
    name: string;
    id: number | string;
  } | null;
  searchKeyword?: string;
  statusFilter?: string;
}

const props = withDefaults(defineProps<Props>(), {
  searchKeyword: "",
  statusFilter: "all",
});

// Emits
const emit = defineEmits<{
  approve: [ids: string[]];
  reject: [ids: string[]];
  selectRequest: [request: ItemDetail];
}>();

// State
const selectedRequests = ref<string[]>([]);
const internalSearchKeyword = ref(props.searchKeyword);
const internalStatusFilter = ref(props.statusFilter);
const selectedCompanyFilter = ref<string>("");
const showRevenueSection = ref<boolean>(false);
const showFinalApproval = ref<boolean>(false);
const isProcessingApproval = ref<boolean>(false);

// Generate mock data based on OverView.vue data
const mockItemDetails: ItemDetail[] = [
  {
    id: "PR001",
    requestNumber: "PR2024-001",
    title: "ຈັດຊື້ອຸປະກອນສໍານັກງານ",
    company: "HAL ບໍລິສັດ",
    amount: 2500000,
    items: 5,
    deliveryPoint: "ສານະສຳນັກງານໃຫຍ່",
    urgency: "normal",
    requestDate: "2024-11-01",
    requester: "ສົມສະຫວາດ ວົງສາ",
    department: "ພະແນກຊື້",
    status: "pending",
  },
  {
    id: "PR002",
    requestNumber: "PR2024-002",
    title: "ຈັດຊື້ວັດຖຸດິບຜ່ານການຜະລິດ",
    company: "HAL ບໍລິສັດ",
    amount: 5800000,
    items: 12,
    deliveryPoint: "ຄັງສົ່ງສິນຄ້າ A",
    urgency: "high",
    requestDate: "2024-11-02",
    requester: "ຄຳພອນ ໄຊຍະສາດ",
    department: "ພະແນກຜະລິດ",
    status: "pending",
  },
  {
    id: "PR003",
    requestNumber: "PR2024-003",
    title: "ຈັດຊື້ລົດຈັກບັນຊີ",
    company: "HAL Tech",
    amount: 12000000,
    items: 3,
    deliveryPoint: "ສານະຫົວໜ້າບໍລິສັດ",
    urgency: "normal",
    requestDate: "2024-11-03",
    requester: "ມາລີ ດວງສະຫວັນ",
    department: "ພະແນກບັນຊີ",
    status: "approved",
  },
  {
    id: "PR004",
    requestNumber: "PR2024-004",
    title: "ຈັດຊື້ລະບົບຄວາມປອດໄພ",
    company: "HAL Energy",
    amount: 8500000,
    items: 8,
    deliveryPoint: "ຮ້ານຈັດຊື້ຫຼັກສັນ",
    urgency: "urgent",
    requestDate: "2024-11-04",
    requester: "ສົມພອນ ອິນທະວົງ",
    department: "ພະແນກ IT",
    status: "pending",
  },
  {
    id: "ITM005",
    requestNumber: "1297/ຈຊນ.ນວ/ບຫ",
    title: "ອຸປະກອນສະຫນັກບໍລິການ",
    company: "HAL Service",
    amount: 3200000,
    items: 15,
    deliveryPoint: "ສານະການສົ່ງສິນຄ້າ",
    urgency: "normal",
    requestDate: "2024-11-05",
    requester: "ເດືອນ ໄຊຍະພອນ",
    department: "ພະແນກຊີການລູກຄ້າ",
    status: "rejected",
  },
  {
    id: "ITM006",
    requestNumber: "1298/ຈຊນ.ນວ/ບຫ",
    title: "ລົດຂົນສົ່ງໃໝ່",
    company: "HAL Logistics",
    amount: 4500000,
    items: 7,
    deliveryPoint: "ສານະສຳນັກງານສາຂາ",
    urgency: "high",
    requestDate: "2024-11-06",
    requester: "ບຸນມີ ຄຳສອນ",
    department: "ພະແນກຂົນສົ່ງ",
    status: "pending",
  },
  {
    id: "ITM007",
    requestNumber: "1299/ຈຊນ.ນວ/ບຫ",
    title: "ວັດຖຸກໍ່າສ້າງ",
    company: "HAL Construction",
    amount: 6700000,
    items: 10,
    deliveryPoint: "ໜ່ານກໍ່າສ້າງ",
    urgency: "normal",
    requestDate: "2024-11-07",
    requester: "ສົມພັນ ວົງສະຫາດ",
    department: "ພະແນກວັດຖຸກໍ່າສ້າງ",
    status: "pending",
  },
  // Add more items for testing scroll functionality
  {
    id: "ITM008",
    requestNumber: "1300/ຈຊນ.ນວ/ບຫ",
    title: "ຄອມພິວເຕີ້ໃໝ່",
    company: "HAL ບໍລິສັດ",
    amount: 3500000,
    items: 4,
    deliveryPoint: "ສານະສຳນັກງານສາຂາ",
    urgency: "normal",
    requestDate: "2024-11-08",
    requester: "ສົມມານ ວົງສາ",
    department: "ພະແນກ IT",
    status: "pending",
  },
  {
    id: "ITM009",
    requestNumber: "REQ-2024-009",
    title: "ໂຕະຖັງສະຫມຸດ",
    company: "HAL Tech",
    amount: 1800000,
    items: 8,
    deliveryPoint: "ສານະຫົວໜ້າບໍລິສັດ",
    urgency: "normal",
    requestDate: "2024-11-09",
    requester: "ຄຳເບົາ ດວງສະຫວັນ",
    department: "ພະແນກຊື້",
    status: "pending",
  },
  {
    id: "ITM010",
    requestNumber: "REQ-2024-010",
    title: "ເຄື່ອງໃຊ້ໃນສຳນັກງານ",
    company: "HAL Energy",
    amount: 2200000,
    items: 20,
    deliveryPoint: "ຄັງສົ່ງສິນຄ້າ B",
    urgency: "normal",
    requestDate: "2024-11-10",
    requester: "ໄຊຍະພອນ ຄຳພອນ",
    department: "ພະແນກຊື້",
    status: "pending",
  },
  {
    id: "ITM011",
    requestNumber: "REQ-2024-011",
    title: "ອຸປະກອນຊັກລ້ຽງ",
    company: "HAL Service",
    amount: 1500000,
    items: 6,
    deliveryPoint: "ສານະສຳນັກງານໃຫຍ່",
    urgency: "normal",
    requestDate: "2024-11-11",
    requester: "ມາລີ ວົງສາ",
    department: "ພະແນກຄວາມສະອາດ",
    status: "pending",
  },
  {
    id: "ITM012",
    requestNumber: "REQ-2024-012",
    title: "ອຸປະກອນແມ່ນ້ຳ",
    company: "HAL Logistics",
    amount: 800000,
    items: 5,
    deliveryPoint: "ສານະສຳນັກງານສາຂາ",
    urgency: "high",
    requestDate: "2024-11-12",
    requester: "ສົມພັນ ອິນທະວົງ",
    department: "ພະແນກຊື້",
    status: "pending",
  },
  {
    id: "ITM013",
    requestNumber: "REQ-2024-013",
    title: "ສານແດນ",
    company: "HAL Construction",
    amount: 9200000,
    items: 15,
    deliveryPoint: "ໜ່ານກໍ່າສ້າງ",
    urgency: "high",
    requestDate: "2024-11-13",
    requester: "ບຸນມີ ຄຳສອນ",
    department: "ພະແນກຊື້",
    status: "pending",
  },
  {
    id: "ITM014",
    requestNumber: "REQ-2024-014",
    title: "ໂຄງການເຄື່ອງໃນຫ້ອງການ",
    company: "HAL ບໍລິສັດ",
    amount: 4300000,
    items: 9,
    deliveryPoint: "ສານະສຳນັກງານໃຫຍ່",
    urgency: "normal",
    requestDate: "2024-11-14",
    requester: "ສົມມານ ວົງສາ",
    department: "ພະແນກບໍາລຸງຕົວເອງ",
    status: "pending",
  },
  {
    id: "ITM015",
    requestNumber: "REQ-2024-015",
    title: "ລະບົບລັກພາ",
    company: "HAL Tech",
    amount: 5600000,
    items: 3,
    deliveryPoint: "ສານະຫົວໜ້າບໍລິສັດ",
    urgency: "high",
    requestDate: "2024-11-15",
    requester: "ຄຳເບົາ ດວງສະຫວັນ",
    department: "ພະແນກປະຕິບັດ",
    status: "pending",
  },
];

const itemDetails = ref<ItemDetail[]>(mockItemDetails);

// Get unique companies for filter dropdown
const uniqueCompanies = computed(() => {
  const companies = [...new Set(itemDetails.value.map((item) => item.company))];
  return companies.sort();
});

// Watch for props changes
watch(
  () => props.searchKeyword,
  (newVal) => {
    internalSearchKeyword.value = newVal;
  }
);

watch(
  () => props.statusFilter,
  (newVal) => {
    internalStatusFilter.value = newVal;
  }
);

// Get filtered item details
const filteredItemDetails = computed(() => {
  let filtered = [...itemDetails.value];

  // Filter by company if selected
  if (selectedCompanyFilter.value) {
    filtered = filtered.filter((item) => item.company === selectedCompanyFilter.value);
  }

  // Filter by company from props if selected
  if (props.selectedCompany) {
    filtered = filtered.filter((item) => item.company === props.selectedCompany?.name);
  }

  // Filter by status
  if (internalStatusFilter.value !== "all") {
    filtered = filtered.filter((item) => item.status === internalStatusFilter.value);
  }

  // Filter by search keyword
  if (internalSearchKeyword.value) {
    const keyword = internalSearchKeyword.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.company.toLowerCase().includes(keyword) ||
        item.deliveryPoint.toLowerCase().includes(keyword) ||
        item.requester.toLowerCase().includes(keyword) ||
        item.title.toLowerCase().includes(keyword) ||
        item.requestNumber.toLowerCase().includes(keyword)
    );
  }

  return filtered;
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

// Toggle select all
const toggleSelectAll = () => {
  if (selectedRequests.value.length === filteredItemDetails.value.length) {
    selectedRequests.value = [];
  } else {
    selectedRequests.value = filteredItemDetails.value.map((item) => item.id);
  }
};

// Handle row click
const handleRowClick = (item: ItemDetail) => {
  selectedRequests.value = [item.id];
  emit("selectRequest", item);
};

// Handle approve
const handleApprove = () => {
  if (selectedRequests.value.length > 0) {
    emit("approve", selectedRequests.value);
  }
};

// Handle reject
const handleReject = () => {
  if (selectedRequests.value.length > 0) {
    emit("reject", selectedRequests.value);
  }
};

// Get selected request details
const selectedRequestDetails = computed(() => {
  if (selectedRequests.value.length === 1) {
    return itemDetails.value.find((item) => item.id === selectedRequests.value[0]);
  }
  return null;
});
// Handle next
const handleNext = () => {
  // Logic to navigate to next request
  const currentIndex = itemDetails.value.findIndex((item) =>
    selectedRequests.value.includes(item.id)
  );
  if (currentIndex !== -1 && currentIndex < itemDetails.value.length - 1) {
    const nextItem = itemDetails.value[currentIndex + 1];
    selectedRequests.value = [nextItem.id];
    emit("selectRequest", nextItem);
  }
};

// Toggle revenue section
const toggleRevenueSection = () => {
  showRevenueSection.value = !showRevenueSection.value;
};

// Get selected items for final approval
const selectedItemsForApproval = computed(() => {
  return itemDetails.value.filter(item => selectedRequests.value.includes(item.id));
});

// Handle batch approve - show final approval view
const handleBatchApprove = () => {
  if (selectedRequests.value.length > 0) {
    showFinalApproval.value = true;
  }
};

// Handle final approval
const handleFinalApprove = async (itemIds: string[]) => {
  isProcessingApproval.value = true;
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update statuses in local data
    itemDetails.value = itemDetails.value.map(item => {
      if (itemIds.includes(item.id)) {
        return { ...item, status: 'approved' as const };
      }
      return item;
    });

    // Clear selection
    selectedRequests.value = [];
    showFinalApproval.value = false;

    // Emit to parent
    emit("approve", itemIds);
  } catch (error) {
    console.error("Error approving items:", error);
  } finally {
    isProcessingApproval.value = false;
  }
};

// Handle cancel final approval
const handleCancelFinalApproval = () => {
  showFinalApproval.value = false;
};

// Handle back to selection
const handleBackToSelection = () => {
  showFinalApproval.value = false;
};
</script>

<template>
  <div class="approve-proposal-container flex gap-6 h-full">
    <!-- Show Final Approval View when ready -->
    <FinalApprovalView
      v-if="showFinalApproval"
      :selectedItems="selectedItemsForApproval"
      :isProcessing="isProcessingApproval"
      @approve="handleFinalApprove"
      @cancel="handleCancelFinalApproval"
      @back="handleBackToSelection"
    />

    <!-- Normal ApproveProposal View -->
    <div v-else class="flex gap-6 h-full w-full">
    <!-- Left Panel: Request List -->
    <div
      class="w-1/2 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full"
    >
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">ລາຍການໃບສະເໜີທີ່ລໍຖ້າອະນຸມັດ</h3>
        <p class="text-sm text-gray-600">ຈຳນວນທັງໝົດ: {{ filteredItemDetails.length }} ລາຍການ</p>
      </div>

      <!-- Filters Section -->
      <div class="p-4 border-b border-gray-200 space-y-4 flex-shrink-0">
        <div class="flex gap-4 justify-between">
          <!-- Company Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ບໍລິສັດ</label>
            <select
              v-model="selectedCompanyFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ທັງໝົດ</option>
              <option v-for="company in uniqueCompanies" :key="company" :value="company">
                {{ company }}
              </option>
            </select>
          </div>
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ຄົ້ນຫາ</label>
            <input
              v-model="internalSearchKeyword"
              type="text"
              placeholder="ຄົ້ນຫາ..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Select All and Batch Actions -->
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="selectedRequests.length === filteredItemDetails.length"
              @change="toggleSelectAll"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm font-medium">ເລືອກທັງໝົດ ({{ selectedRequests.length }})</span>
          </label>
          <button
            v-if="selectedRequests.length > 0"
            @click="handleBatchApprove"
            class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Icon icon="ant-design:check-circle-outlined" class="inline mr-1" />
            ອະນຸມັດ({{ selectedRequests.length }})
          </button>
        </div>
      </div>

      <!-- Request Table -->
      <div class="flex-1 overflow-hidden min-h-0">
        <div
          class="h-full max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
        >
          <table class="min-w-full">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <input
                    type="checkbox"
                    :checked="selectedRequests.length === filteredItemDetails.length"
                    @change="toggleSelectAll"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ບໍລິສັດ
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ຈຳນວນເງິນ
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ລາຍການ
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ຈຸດປະສົງ
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ສະຖານະ
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="item in filteredItemDetails"
                :key="item.id"
                class="hover:bg-gray-50 cursor-pointer transition-colors"
                :class="{ 'bg-blue-50': selectedRequests.includes(item.id) }"
                @click="handleRowClick(item)"
              >
                <td class="px-4 py-3 whitespace-nowrap">
                  <input
                    type="checkbox"
                    :value="item.id"
                    v-model="selectedRequests"
                    @click.stop
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ item.company }}</div>
                  <div class="text-xs text-gray-500">{{ item.requestNumber }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ formatCurrency(item.amount) }}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm text-gray-900">{{ item.title }}</div>
                  <div class="text-xs text-gray-500">{{ item.items }} ລາຍການ</div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm text-gray-900">{{ item.deliveryPoint }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getStatusBadgeClass(item.status)"
                  >
                    {{ getStatusText(item.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredItemDetails.length === 0" class="text-center py-12">
        <Icon icon="ant-design:inbox-outlined" class="text-4xl text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-600 mb-2">ບໍ່ພົບຂໍ້ມູນ</h3>
        <p class="text-sm text-gray-500">ບໍ່ພົບລາຍກາສິນຄ້າທີ່ຕົງກັບຕົວກັ່ນ</p>
      </div>
    </div>

    <!-- Vertical Divider -->
    <div class="w-px bg-gray-300 self-stretch"></div>

    <!-- Right Panel: Payment Details -->
    <div class="w-1/2 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
      <!-- Invoice Header -->
      <div v-if="selectedRequestDetails" class="p-2 border-b border-gray-200">
        <div class="flex justify-between">
          <!-- Invoice Title -->
          <div class="text-center">
            <h2 class="text-xl font-bold text-gray-900">ໃບເບີກຈ່າຍ</h2>
          </div>
          <div class="flex items-center gap-2">
            <img src="/logohal.png" alt="HAL Logo" class="w-8 h-8 object-contain" />
            <span>Hal Logistics</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex gap-2">
              <span>ເລກທີ</span>
              <h3 class="text-base font-semibold text-gray-900">
                {{ selectedRequestDetails.requestNumber }}
              </h3>
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="getStatusBadgeClass(selectedRequestDetails.status)"
              >
                {{ getStatusText(selectedRequestDetails.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- Selected Request Info -->
      <div v-if="selectedRequestDetails" class="p-2 border-b border-gray-200">
        <div class="space-y-3">
          <div class="flex items-center gap-4 ">
            <span class="text-base font-bold text-gray-500">ຫົວຂໍ້:</span>
            <span class="font-medium text-gray-900">{{ selectedRequestDetails.title }}</span>
          </div>
        </div>
      </div>

      <!-- Item Details Table -->
      <div v-if="selectedRequestDetails" class="flex-1 overflow-hidden">
        <div
          class="h-full max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
        >
          <table class="min-w-full">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ລຳດັບ
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຫົວຂໍ້
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ລະຫັດງົບປະມານ
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຈຳນວນເງິນ
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(_, index) in selectedRequestDetails.items" :key="index" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 whitespace-nowrap text-sm">{{ index + 1 }}</td>
                <td class="px-4 py-3 text-sm">ສິນຄ້າ {{ String.fromCharCode(65 + index) }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-right">{{ index + 2 }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-right">
                  {{ formatCurrency(Math.floor(selectedRequestDetails.amount / selectedRequestDetails.items)) }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 sticky bottom-0">
              <tr>
                <td colspan="3" class="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                  ລວມ:
                </td>
                <td class="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                  {{ formatCurrency(selectedRequestDetails.amount) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Shop and Revenue Information Section -->
      <div v-if="selectedRequestDetails" class="border-t border-gray-200">
        <!-- Collapsible Header -->
        <div
          @click="toggleRevenueSection"
          class="px-6 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center justify-between transition-colors"
        >
          <span class="text-sm font-medium text-gray-900">ຂໍ້ມູນຮ້ານຄ້າ ແລະ ລາຍຮັບ</span>
          <Icon
            :icon="showRevenueSection ? 'mdi:chevron-up' : 'mdi:chevron-down'"
            class="text-gray-500 transition-transform"
          />
        </div>

        <!-- Collapsible Content -->
        <div v-if="showRevenueSection" class="px-6 py-4 bg-white border-t border-gray-200">
          <div class="grid grid-cols-2 gap-6">
            <!-- Shop Information -->
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-gray-900 border-b pb-2">ຂໍ້ມູນຮ້ານຄ້າ</h4>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">ຊື່ຮ້ານ:</span>
                  <span class="font-medium">ຮ້ານອຸປະກອນສໍານັກງານ HAL</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">ສາຂາ:</span>
                  <span class="font-medium">ສາຂາຫຼັກ</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">ເບີໂທລະສັບ:</span>
                  <span class="font-medium">021 456 789</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">ຜູ້ປະກອບການ:</span>
                  <span class="font-medium">ທ. ສົມສະຫວາດ ວົງສາ</span>
                </div>
              </div>
            </div>

            <!-- Revenue Information -->
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-gray-900 border-b pb-2">ລາຍຮັບປະຈຳວັນ</h4>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">ລາຍຮັບວັນນີ້:</span>
                  <span class="font-medium text-green-600">{{ formatCurrency(8500000) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">ລາຍຮັບວານນີ້:</span>
                  <span class="font-medium text-green-600">{{ formatCurrency(125000000) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">ລາຍຮັບປີນີ້:</span>
                  <span class="font-medium text-green-600">{{ formatCurrency(1500000000) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">ກຳໄລສຸດທິ:</span>
                  <span class="font-medium text-blue-600">{{ formatCurrency(450000000) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Revenue Details -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div class="bg-blue-50 rounded-lg p-3">
                <div class="text-xs text-blue-600 mb-1">ຍອດຂາຍປະຈຳເດືອນ</div>
                <div class="text-lg font-bold text-blue-700">{{ formatCurrency(85000000) }}</div>
              </div>
              <div class="bg-green-50 rounded-lg p-3">
                <div class="text-xs text-green-600 mb-1">ລູກຄ້າໃໝ່ປະຈຳເດືອນ</div>
                <div class="text-lg font-bold text-green-700">45 ຄົນ</div>
              </div>
              <div class="bg-purple-50 rounded-lg p-3">
                <div class="text-xs text-purple-600 mb-1">ອັດຕາການເຕີບໂຕ</div>
                <div class="text-lg font-bold text-purple-700">+12.5%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Request Count -->

      <!-- Action Buttons -->
      <div v-if="selectedRequestDetails" class="p-2 border-t border-gray-200 space-y-3">
        <div v-if="selectedRequestDetails">
          <div class="text-lg text-gray-600 font-bold ">
            ເລືອກລາຍການທີ່ຕ້ອງການອະນຸມັດ: {{ selectedRequests.length }} ລາຍການ
          </div>
        </div>
        <div class="flex justify-end">
          <UiButton
            @click="handleNext"
            class="w-1/4 px-4 py-2 bg-white-600 text-black rounded-lg font-medium hover:bg-white-700 transition-colors flex items-center justify-center"
          >
            ລາຍການຖັດໄປ
            <Icon icon="ant-design:arrow-right-outlined" />
          </UiButton>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="handleReject"
            class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <Icon icon="ant-design:close-circle-outlined" />
            ປະຕິເສດ
          </button>
          <button
            @click="handleApprove"
            class="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Icon icon="ant-design:check-circle-outlined" />
            ອະນຸມັດ
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex-1 flex items-center justify-center p-8">
        <div class="text-center">
          <Icon icon="ant-design:file-text-outlined" class="text-4xl text-gray-300 mx-auto mb-3" />
          <h3 class="text-lg font-medium text-gray-600 mb-2">ກະລຸນາເລືອກລາຍການ</h3>
          <p class="text-sm text-gray-500">ເລືອກລາຍການຈັດຊື້ເພື່ອດູລາຍລະອຽດ</p>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.approve-proposal-container {
  /* Container with custom scrollbar for webkit browsers */
  height: 100%;
}

/* Smooth scrollbar styling like OverView component */
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

.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
  background: #d1d5db;
}

.scrollbar-track-gray-100::-webkit-scrollbar-track {
  background: #f9fafb;
}

.scrollbar-thumb-gray-300:hover.scrollbar-thumb-gray-400::-webkit-scrollbar-thumb {
  background: #9ca3af;
}

/* Sticky header for table */
.sticky {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Ensure text doesn't overflow */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.max-w-xs {
  max-width: 10rem;
}

/* Smooth transitions for table rows */
table tbody tr {
  transition: background-color 0.15s ease-in-out;
}

/* Enhanced hover effect */
table tbody tr:hover {
  background-color: #f8fafc !important;
}

/* Selected row styling */
table tbody tr.bg-blue-50 {
  background-color: #eff6ff !important;
  border-left: 3px solid #3b82f6;
}
</style>
