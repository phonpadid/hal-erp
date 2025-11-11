<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiSelect from "@/common/shared/components/Input/InputSelect.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { Icon } from "@iconify/vue";
import Table, { type TableRecord, type TablePaginationType } from "@/common/shared/components/table/Table.vue";

// Interface for proposal data
interface Proposal {
  id: string;
  requestNumber: string;
  title: string;
  department: string;
  requester: string;
  amount: number;
  requestDate: string;
  status: "pending" | "approved" | "rejected" | "reviewing";
  urgency: "low" | "normal" | "high" | "urgent";
  items: number;
  company: string;
}

const { warning } = useNotification();

// Props
const props = defineProps<{
  companyId: number;
}>();

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");
const selectedYear = ref<number>(new Date().getFullYear());
const selectedPeriod = ref<string>("all");
const selectedDepartment = ref<string>("all");
const selectedStatus = ref<string>("all");
const currentPage = ref<number>(1);
const pageSize = ref<number>(10);

// Generate years for filter
const currentYear = new Date().getFullYear();
const years = computed(() => {
  const yearOptions = [];
  for (let year = currentYear - 5; year <= currentYear + 2; year++) {
    yearOptions.push({ value: year, label: `${year}` });
  }
  return yearOptions;
});

// Period options
const periodOptions = [
  { value: "all", label: "ທຸກໄລຍະ" },
  { value: "q1", label: "ໄຕມາດ 1" },
  { value: "q2", label: "ໄຕມາດ 2" },
  { value: "q3", label: "ໄຕມາດ 3" },
  { value: "q4", label: "ໄຕມາດ 4" },
];

// Department options
const departmentOptions = [
  { value: "all", label: "ທຸກພະແນກ" },
  { value: "it", label: "ພະແນກ IT" },
  { value: "hr", label: "ພະແນກບຸລິຄະມານ" },
  { value: "finance", label: "ພະແນກບັນຊີ" },
  { value: "procurement", label: "ພະແນກຊື້" },
  { value: "operations", label: "ພະແນກປະຕິບັດຕິພັນ" },
  { value: "marketing", label: "ພະແນກການຕະຫຼາດ" },
];

// Status options
const statusOptions = [
  { value: "all", label: "ທຸກສະຖານະ" },
  { value: "pending", label: "ລໍຖ້າອະນຸມັດ" },
  { value: "reviewing", label: "ກຳລັງພິຈາລະນາ" },
  { value: "approved", label: "ອະນຸມັດແລ້ວ" },
  { value: "rejected", label: "ປະຕິເສດ" },
];

// Mock data for proposals - generate company-specific data
const generateMockProposals = (companyId: number): Proposal[] => {
  const baseProposals = [
    {
      baseTitle: "ຈັດຊື້ອຸປະກອນສໍານັກງານ",
      baseDepartment: "procurement",
      baseRequester: "ສົມສະຫວາດ ວົງສາ",
      baseAmount: 2500000,
      baseUrgency: "normal" as const,
    },
    {
      baseTitle: "ຈັດຊື້ວັດຖຸດິບຜ່ານການຜະລິດ",
      baseDepartment: "operations",
      baseRequester: "ຄຳພອນ ໄຊຍະສາດ",
      baseAmount: 5800000,
      baseUrgency: "high" as const,
    },
    {
      baseTitle: "ຈັດຊື້ລົດຈັກບັນຊີ",
      baseDepartment: "finance",
      baseRequester: "ມາລີ ດວງສະຫວັນ",
      baseAmount: 12000000,
      baseUrgency: "normal" as const,
    },
    {
      baseTitle: "ຈັດຊື້ລະບົບຄວາມປອດໄພ",
      baseDepartment: "it",
      baseRequester: "ສົມພອນ ອິນທະວົງ",
      baseAmount: 8500000,
      baseUrgency: "urgent" as const,
    },
    {
      baseTitle: "ຈັດຊື້ອາຫານສັດ",
      baseDepartment: "hr",
      baseRequester: "ເດືອນ ໄຊຍະພອນ",
      baseAmount: 3200000,
      baseUrgency: "normal" as const,
    },
  ];

  const companyNames = [
    "HAL ບໍລິສັດ",
    "HAL Tech",
    "HAL Energy",
    "HAL Service",
    "HAL Logistics",
  ];

  const statuses: Array<"pending" | "approved" | "rejected" | "reviewing"> = ["pending", "approved", "rejected", "reviewing"];
  const urgencies: Array<"low" | "normal" | "high" | "urgent"> = ["low", "normal", "high", "urgent"];

  const proposals: Proposal[] = [];

  // Generate 50 proposals for the company
  for (let i = 0; i < 50; i++) {
    const baseProposal = baseProposals[i % baseProposals.length];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));

    proposals.push({
      id: `PR${String(i + 1).padStart(3, '0')}`,
      requestNumber: `PR${currentYear}-${String(i + 1).padStart(3, '0')}`,
      title: `${baseProposal.baseTitle} ${i > 4 ? '#' + (i - 4) : ''}`,
      department: baseProposal.baseDepartment,
      requester: baseProposal.baseRequester,
      amount: baseProposal.baseAmount + (Math.floor(Math.random() * 10) - 5) * 100000,
      requestDate: date.toISOString().split('T')[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
      items: Math.floor(Math.random() * 20) + 1,
      company: companyNames[Math.min(companyId - 1, companyNames.length - 1)],
    });
  }

  return proposals.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
};

const mockProposals = ref<Proposal[]>([]);

// Load data
const loadData = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 800));
    mockProposals.value = generateMockProposals(props.companyId);
  } catch (error) {
    console.error("Error loading data:", error);
    warning("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
  } finally {
    loading.value = false;
  }
};

// Get filtered proposals
const filteredProposals = computed(() => {
  let filtered = [...mockProposals.value];

  // Filter by year
  if (selectedYear.value) {
    filtered = filtered.filter((proposal) => {
      const proposalYear = new Date(proposal.requestDate).getFullYear();
      return proposalYear === selectedYear.value;
    });
  }

  // Filter by period
  if (selectedPeriod.value !== "all") {
    filtered = filtered.filter((proposal) => {
      const date = new Date(proposal.requestDate);
      const month = date.getMonth() + 1;
      if (selectedPeriod.value === "q1") return month >= 1 && month <= 3;
      if (selectedPeriod.value === "q2") return month >= 4 && month <= 6;
      if (selectedPeriod.value === "q3") return month >= 7 && month <= 9;
      if (selectedPeriod.value === "q4") return month >= 10 && month <= 12;
      return true;
    });
  }

  // Filter by department
  if (selectedDepartment.value !== "all") {
    filtered = filtered.filter((proposal) => proposal.department === selectedDepartment.value);
  }

  // Filter by status
  if (selectedStatus.value !== "all") {
    filtered = filtered.filter((proposal) => proposal.status === selectedStatus.value);
  }

  // Filter by search keyword
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filtered = filtered.filter(
      (proposal) =>
        proposal.title.toLowerCase().includes(keyword) ||
        proposal.requestNumber.toLowerCase().includes(keyword) ||
        proposal.requester.toLowerCase().includes(keyword)
    );
  }

  return filtered;
});

// Paginated proposals
const paginatedProposals = computed(() => {
  const filtered = filteredProposals.value;
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filtered.slice(start, end);
});

// Table columns
const tableColumns = computed(() => [
  {
    title: "ເລກທີ",
    key: "requestNumber",
    dataIndex: "requestNumber",
    width: 120,
  },
  {
    title: "ຈຸດປະສົງ",
    key: "title",
    dataIndex: "title",
    width: 300,
  },
  {
    title: "ພະແນກ",
    key: "department",
    dataIndex: "department",
    width: 120,
  },
  {
    title: "ຈຳນວນເງິນ",
    key: "amount",
    dataIndex: "amount",
    width: 150,
  },
  {
    title: "ຜູ້ຂໍ",
    key: "requester",
    dataIndex: "requester",
    width: 150,
  },
  {
    title: "ສະຖານະ",
    key: "status",
    dataIndex: "status",
    width: 120,
  },
  {
    title: "Action",
    key: "action",
    width: 100,
  },
]);

// Handle search
const handleSearch = (value: string) => {
  searchKeyword.value = value;
  currentPage.value = 1;
};

// Handle filter changes
const handleFilterChange = () => {
  currentPage.value = 1;
};

// Handle pagination change
const handlePaginationChange = (pagination: TablePaginationType, _filters: Record<string, string[]>) => {
  currentPage.value = pagination.current || 1;
  pageSize.value = pagination.pageSize || 10;
};

// Handle row click
const handleRowClick = (record: TableRecord) => {
  console.log("Proposal clicked:", record);
};
// Handle approve
const handleApprove = (record: Proposal) => {
  console.log("Approve proposal:", record);
  // Update status
  const proposal = mockProposals.value.find(p => p.id === record.id);
  if (proposal) {
    proposal.status = "approved";
  }
};

// Handle reject
const handleReject = (record: Proposal) => {
  console.log("Reject proposal:", record);
  // Update status
  const proposal = mockProposals.value.find(p => p.id === record.id);
  if (proposal) {
    proposal.status = "rejected";
  }
};

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

// Get department label
const getDepartmentLabel = (department: string) => {
  const deptMap: { [key: string]: string } = {
    it: "ພະແນກ IT",
    hr: "ພະແນກບຸລິຄະມານ",
    finance: "ພະແນກບັນຊີ",
    procurement: "ພະແນກຊື້",
    operations: "ພະແນກປະຕິບັດຕິພັນ",
    marketing: "ພະແນກການຕະຫຼາດ",
  };
  return deptMap[department] || department;
};

// Get status badge classes
const getStatusBadgeClass = (status: string) => {
  const statusMap: { [key: string]: string } = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewing: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return statusMap[status] || "bg-gray-100 text-gray-800";
};

// Get status label
const getStatusLabel = (status: string) => {
  const statusMap: { [key: string]: string } = {
    pending: "ລໍຖ້າອະນຸມັດ",
    reviewing: "ກຳລັງພິຈາລະນາ",
    approved: "ອະນຸມັດແລ້ວ",
    rejected: "ປະຕິເສດ",
  };
  return statusMap[status] || status;
};

// Get urgency badge classes
const getUrgencyBadgeClass = (urgency: string) => {
  const urgencyMap: { [key: string]: string } = {
    low: "bg-gray-100 text-gray-800",
    normal: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };
  return urgencyMap[urgency] || "bg-gray-100 text-gray-800";
};

// Get urgency label
const getUrgencyLabel = (urgency: string) => {
  const urgencyMap: { [key: string]: string } = {
    low: "ຕໍ່າ",
    normal: "ປົກກາງ",
    high: "ສູງ",
    urgent: "ດ່ວນ",
  };
  return urgencyMap[urgency] || urgency;
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="proposal-list-container">
    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1">
          <InputSearch
            v-model="searchKeyword"
            placeholder="ຄົ້ນຫາເລກທີ, ຫົວຂໍ້, ຫຼື ຜູ້ຂໍ..."
            :disabled="loading"
            @search="handleSearch"
          />
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <UiFormItem>
            <UiSelect
              v-model="selectedYear"
              :options="years"
              placeholder="ເລືອກປີ"
              @change="handleFilterChange"
              :disabled="loading"
            />
          </UiFormItem>

          <UiFormItem>
            <UiSelect
              v-model="selectedPeriod"
              :options="periodOptions"
              placeholder="ໄລຍະ"
              @change="handleFilterChange"
              :disabled="loading"
            />
          </UiFormItem>

          <UiFormItem>
            <UiSelect
              v-model="selectedDepartment"
              :options="departmentOptions"
              placeholder="ພະແນກ"
              @change="handleFilterChange"
              :disabled="loading"
            />
          </UiFormItem>

          <UiFormItem>
            <UiSelect
              v-model="selectedStatus"
              :options="statusOptions"
              placeholder="ສະຖານະ"
              @change="handleFilterChange"
              :disabled="loading"
            />
          </UiFormItem>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">ລໍຖ້າອະນຸມັດ</p>
            <p class="text-2xl font-bold text-yellow-600">
              {{ filteredProposals.filter(p => p.status === 'pending').length }}
            </p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <Icon icon="mdi:clock" class="text-yellow-600 text-xl" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">ກຳລັງພິຈາລະນາ</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ filteredProposals.filter(p => p.status === 'reviewing').length }}
            </p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <Icon icon="mdi:file-eye" class="text-blue-600 text-xl" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">ອະນຸມັດແລ້ວ</p>
            <p class="text-2xl font-bold text-green-600">
              {{ filteredProposals.filter(p => p.status === 'approved').length }}
            </p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <Icon icon="mdi:check-circle" class="text-green-600 text-xl" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">ປະຕິເສດ</p>
            <p class="text-2xl font-bold text-red-600">
              {{ filteredProposals.filter(p => p.status === 'rejected').length }}
            </p>
          </div>
          <div class="p-3 bg-red-100 rounded-full">
            <Icon icon="mdi:close-circle" class="text-red-600 text-xl" />
          </div>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow-sm">
      <Table
        :columns="tableColumns"
        :data-source="paginatedProposals"
        :loading="loading"
        :pagination="{
          current: currentPage,
          pageSize: pageSize,
          total: filteredProposals.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }"
        @row-click="handleRowClick"
        @change="handlePaginationChange"
      >
        <!-- Custom cell renderers -->
        <template #title="{ record }">
          <div>
            <div class="font-medium text-gray-900">{{ record.title }}</div>
            <div class="text-xs text-gray-500">{{ record.items }} ລາຍການ</div>
          </div>
        </template>

        <template #department="{ record }">
          <span class="text-sm">{{ getDepartmentLabel(record.department) }}</span>
        </template>

        <template #amount="{ record }">
          <div class="text-right">
            <div class="font-medium text-gray-900">{{ formatCurrency(record.amount) }}</div>
            <span
              class="text-xs px-2 py-0.5 rounded-full"
              :class="getUrgencyBadgeClass(record.urgency)"
            >
              {{ getUrgencyLabel(record.urgency) }}
            </span>
          </div>
        </template>

        <template #requester="{ record }">
          <div>
            <div class="font-medium text-gray-900">{{ record.requester }}</div>
            <div class="text-xs text-gray-500">{{ record.requestDate }}</div>
          </div>
        </template>

        <template #status="{ record }">
          <span
            class="px-2 py-1 rounded-full text-xs font-medium"
            :class="getStatusBadgeClass(record.status)"
          >
            {{ getStatusLabel(record.status) }}
          </span>
        </template>

        <template #action="{ record }">
          <div class="flex items-center gap-1">
            <button
              v-if="record.status === 'pending'"
              @click.stop="handleApprove(record)"
              class="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="ອະນຸມັດ"
            >
              <Icon icon="mdi:check" class="text-lg" />
            </button>
            <button
              v-if="record.status === 'pending'"
              @click.stop="handleReject(record)"
              class="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="ປະຕິເສດ"
            >
              <Icon icon="mdi:close" class="text-lg" />
            </button>
            <button
              class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="ດູລາຍລະອຽດ"
            >
              <Icon icon="mdi:eye" class="text-lg" />
            </button>
          </div>
        </template>
      </Table>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredProposals.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
      <Icon icon="mdi:file-document-outline" class="text-6xl text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-600 mb-2">ບໍ່ພົບໃບສະເໜີ</h3>
      <p class="text-gray-500">ລອງປັບປ່ຽນຕົວກັ່ນຕອງ ຫຼື ຄຳຄົ້ນຫາ</p>
    </div>
  </div>
</template>

<style scoped>
.proposal-list-container {
  min-height: 400px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-2.md\:grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid-cols-2.md\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>