<template>
  <div class="mt-10">
    <div>
      <!-- Header component -->
      <div
        class="fixed px-6 py-4 top-0 z-40 h-auto bg-white shadow-sm transition-all duration-150 mt-[4rem]"
        :class="topbarStyle"
      >
        <header-component
          header-title="ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ"
          :breadcrumb-items="['ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ', 'ອານຸມັດ']"
          document-prefix="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ"
          :document-number="orderDetails?.getPoNumber() || 'no data'"
          :document-date="formatDate(orderDetails?.getCreatedAt() ?? new Date())"
          :action-buttons="customButtons"
          :document-status="documentStatus.status"
          :document-status-class="documentStatus.statusClass"
        />
      </div>
      <!-- Main Content -->
      <div class="bg-white rounded-lg shadow-sm p-6 mt-36">
        <h2>{{ t("purchase_orders.p_orders") }}</h2>
        <!-- Requester Information -->
        <div class="flex items-start gap-4 mb-2">
          <div
            class="flex items-center justify-center **w-16 h-16** rounded-full **bg-blue-100** **text-4xl**"
          >
            <Icon icon="mdi:user" class="text-6xl" />
          </div>
          <div>
            <h4>{{ orderDetails?.getRequester()?.username || documentDetails.requester.name }}</h4>
            <p class="text-gray-600">
              {{ orderDetails?.getDepartment()?.name || "ພະແນກໄອທີ" }},
              {{ orderDetails?.getPosition()?.[0]?.name || "ພະນັກງານພັດທະນາລະບົບ" }}
            </p>
          </div>
        </div>
        <!-- ຂໍ້ມຸນຜູ້ສະເໜີ -->
        <div>
          <h4>{{ t("purchase_orders.Proposal") }}</h4>
          <div class="grid grid-cols-4">
            <div class="grid grid-rows-2">
              <h5>{{ t("purchase_orders.quantity") }}</h5>
              <span class="text-sm">
                {{ getPurchaseOrderQuantity }}
              </span>
            </div>
            <div class="grid grid-rows-2">
              <h5>{{ t("purchase_orders.department") }}</h5>
              <span class="text-sm">{{ orderDetails?.getDepartment()?.name || "ພະແນກໄອທີ" }}</span>
            </div>
            <div class="grid grid-rows-2">
              <h5>{{ t("purchase_orders.agency") }}</h5>
              <span class="text-sm">{{
                orderDetails?.getPosition()?.[0]?.name || "ຝ່າຍພັດທະນາລະບົບ"
              }}</span>
            </div>
            <div class="grid grid-rows-2">
              <h4 class="text-base font-semibold mb-2">
                {{ t("purchase_orders.Objectivesanditems") }}
              </h4>
              <span class="text-gray-600">
                {{ getPurchaseOrderRemark }}
              </span>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div>
          <h4 class="text-base font-semibold mb-2">{{ t("purchase_orders.list") }}</h4>
          <Table :columns="columns" :dataSource="orderDetails?.getPurchaseOrderItem() || []">
            <template #index="{ index }">
              <span>{{ index + 1 }}</span>
            </template>

            <template #title="{ record }">
              <span>{{ record.getTitle() }}</span>
            </template>

            <template #remark="{ record }">
              <span>{{ record.getRemark() }}</span>
            </template>

            <template #quantity="{ record }">
              <span>{{ record.getQuantity() }}</span>
            </template>

            <template #price="{ record }">
              <span class="text-green-500">{{ formatPrice(record.getPrice()) }} ₭</span>
            </template>
            <template #total="{ record }">
              <span class="text-red-500">{{ formatPrice(record.getTotal()) }} ₭</span>
            </template>
            <template #id_name="{ record }">
              <span class="text-gray-600">
                <div v-if="canManageBudget">
                  <div v-if="selectedBudgets[record.id]">
                    <span class="font-semibold text-blue-700">
                      {{ selectedBudgets[record.id]?.budgetCode }} -
                      {{ selectedBudgets[record.id]?.budgetName }}
                    </span>
                    <UiButton
                      @click="showBudgetDrawer(record)"
                      type="link"
                      class="p-0 text-blue-500"
                    >
                      ແກ້ໄຂ
                    </UiButton>
                  </div>
                  <div v-else>
                    <UiButton
                      @click="showBudgetDrawer(record)"
                      type="default"
                      class="w-full flex justify-between items-center text-blue-600 font-medium"
                    >
                      <div class="flex-grow text-left">ເລືອກປະເພດງົບປະມານ</div>
                      <Icon icon="mdi:chevron-right" class="text-xl" />
                    </UiButton>
                  </div>
                </div>
                <div v-else>
                  <span class="font-semibold text-gray-700">
                    {{ selectedBudgets[record.id]?.budgetCode || "No Budget Code" }}
                  </span>
                </div>
              </span>
            </template>
            <template #Shop="{ record }">
              <UiButton
                type="link"
                icon="ant-design:eye-outlined"
                color-class="flex items-center text-blue-500 hover:!text-blue-900"
                @click="() => showShopDetails(record)"
              >
                ລາຍລະອຽດຮ້ານຄ້າ
              </UiButton>
            </template>
            <template #image="{ record }">
              <span>
                <a-image
                  v-if="record.getQuotationImageUrl()"
                  :src="record.getQuotationImageUrl()"
                  alt="Product Image"
                  :width="50"
                  :height="50"
                  :preview="true"
                />
                <img
                  v-else
                  src="/public/5.png"
                  alt="Default Image"
                  class="w-12 h-12 object-cover"
                />
              </span>
            </template>
          </Table>
          <div>
            <div v-if="orderDetails">
              <div class="grid grid-cols-[auto_130px] gap-2 text-right">
                <div class="font-medium">ລາຄາລວມ:</div>
                <div class="text-green-500">{{ formatPrice(getTotalAmount) }} ₭</div>

                <div class="font-medium">ພາສີມູນຄ່າເພີ່ມ (VAT):</div>
                <div class="text-yellow-500">{{ formatPrice(orderDetails.getVat()) }} ₭</div>

                <div class="font-medium">ລາຄາລວມທັງໝົດ:</div>
                <div class="text-red-500 font-bold">
                  {{ formatPrice(orderDetails.getTotal()) }} ₭
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Signatures -->
        <div class="shadow-sm rounded-md p-2">
          <h2 class="text-md font-semibold mb-2">
            {{ t("purchase-rq.signature") }}
          </h2>

          <!-- ✅ เปลี่ยนจาก grid เป็น flex flex-wrap -->
          <div class="flex flex-wrap gap-4">
            <!-- Approval Steps -->
            <template v-for="(step, index) in approvalStep" :key="step.id">
              <div class="flex flex-col items-center">
                <!-- Step Title -->
                <p class="text-slate-500 text-sm mb-2 text-center">
                  {{ getStepTitle(index, step) }}
                </p>

                <!-- Signature Display - Fixed Container -->
                <div
                  class="w-[120px] h-[80px] flex items-center justify-center"
                >
                  <template v-if="step.status_id === 2 && step.approver?.user_signature">
                    <!-- Approved signature -->
                    <img
                      :src="step.approver.user_signature.signature_url"
                      alt="signature"
                      class="max-w-[110px] max-h-[70px] object-contain"
                    />
                  </template>
                  <template v-else-if="step.status_id === 1">
                    <!-- Pending signature -->
                    <span class="text-gray-400 text-sm text-center px-2">
                      {{ t("purchase-rq.pending") }}
                    </span>
                  </template>
                </div>

                <!-- Approver Info -->
                <div class="info text-sm text-slate-600 mt-2 text-center min-w-[120px]">
                  <template v-if="step.approver">
                    <p class="font-medium">{{ step.approver.username }}</p>
                    <p class="text-xs text-gray-500">{{ step.position?.name || "-" }}</p>
                  </template>
                  <template v-else-if="step.doc_approver?.[0]?.user">
                    <p class="text-xs text-gray-500">
                      {{ t("purchase-rq.pending") }}
                    </p>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div>
          <span class="font-medium">{{ $t("disbursement.field.doc_attachment") }}</span>
          <HeaderComponent
            header-title="ໃບສະເໜີຈັດຊື້ - ເລກທີ 0036/ຈຊ/ຮລຕ/ນຄຫຼ"
            header-title-color="blue-600"
            prefix-icon="mdi:file-document-outline"
            suffix-icon="mdi:arrow-top-right"
            prefix-icon-class="text-blue-500"
            suffix-icon-class="text-blue-500"
            :suffix-icon-clickable="true"
            :show-document-date="false"
            :show-document-number="false"
            :show-document-prefix="false"
            :show-breadcrumb="false"
            class="cursor-pointer"
            @click="showDrawer"
          />
        </div>
      </div>
    </div>
  </div>
  <!-- Approve Modal -->
  <UiModal
    title="ປະຕິເສດ"
    :visible="isApproveModalVisible"
    :confirm-loading="confirmLoading"
    @update:visible="isApproveModalVisible = false"
  >
    <p>ທ່ານຕ້ອງການຢືນຢັນຄຳຂໍຈັດຊື້ ແທ້ ຫຼື ບໍ່?</p>
    <template #footer>
      <div class="flex">
        <UiButton @click="isApproveModalVisible = false" type="default" color-class="w-full"
          >ຍົກເລີກ</UiButton
        >
        <UiButton
          @click="handleReject"
          type="primary"
          :loading="confirmLoading"
          color-class="w-full"
          >ຢືນຢັນ</UiButton
        >
      </div>
    </template>
  </UiModal>
  <!-- OTP Modal -->
  <OtpModal
    :visible="isOtpModalVisible"
    :title="t('purchase-rq.otp-verification')"
    :approval-step-id="currentApprovalStep?.id"
    :loading="confirmLoading"
    @confirm="handleOtpConfirm"
    @close="handleModalCancel"
    @resend="handleResendOtp"
  />
  <!-- Signature Modal -->
  <UiModal
    title="ລາຍເຊັນ"
    title-icon="material-symbols-light:signature"
    :visible="isSignatureModalVisible"
    :confirm-loading="confirmLoading"
    @update:visible="isSignatureModalVisible = $event"
    @ok="handleSuccessConfirm"
    @cancel="handleModalCancel"
  >
    <div>
      <div>
        <p>{{ userInfo.name }} {{ userInfo.department }}</p>
      </div>

      <div>
        <p class="text-xl font-bold">ລາຍເຊັນ</p>
        <p>ລາຍເຊັນຂອງທ່ານຈະຖືກນຳໃຊ້ໃນການຢືນຢັນເອກະສານ</p>

        <!-- Signature Pad -->
        <div class="flex justify-center w-full">
          <img src="/public/2.png" class="w-52" />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex">
        <UiButton
          @click="handleSignatureConfirm"
          type="primary"
          :loading="confirmLoading"
          color-class="w-full"
          >ຢືນຢັນ</UiButton
        >
      </div>
    </template>
  </UiModal>
  <!-- Success Modal -->
  <UiModal
    title=""
    :visible="isSuccessModalVisible"
    :confirm-loading="confirmLoading"
    @update:visible="isSuccessModalVisible = $event"
    @ok="handleSuccessConfirm"
    @cancel="handleModalCancel"
  >
    <div>
      <div>
        <Icon icon="mdi:check-decagram" class="text-green-500 text-6xl mx-auto mt-4" />
        <p>ອະນຸມັດສຳເລັດ</p>
        <span
          >ອະນຸມັດຄຳຂໍຈັດຊື້ຂອງທ່ານສຳເລັດ ຂໍ້ມູນຈະຖືກສົ່ງໄປຫາພະແນກການເງິນເພື່ອອະນຸມັດຂໍ້ມູນ</span
        >
      </div>
    </div>
    <template #footer>
      <div class="flex">
        <UiButton
          @click="handleSuccessConfirm"
          type="primary"
          :loading="confirmLoading"
          color-class="w-full"
          >ຢືນຢັນ</UiButton
        >
      </div>
    </template>
  </UiModal>
  <!-- Reject Modal -->
  <UiModal
    title="ປະຕິເສດ"
    :visible="isRejectModalVisible"
    :confirm-loading="confirmLoading"
    @update:visible="isRejectModalVisible = false"
  >
    <div class="space-y-4">
      <p>ໃສ່ເຫດຜົນໃນການປະຕິເສດ</p>
      <div>
        <p class="mb-2 font-semibold">ເຫດຜົນ</p>
        <Textarea v-model="rejectReason" placeholder="ປ້ອນເຫດຜົນ" :rows="4" />
      </div>
    </div>
    <template #footer>
      <div class="flex gap-x-2">
        <UiButton
          @click="handleReject"
          type="primary"
          :loading="confirmLoading"
          color-class="w-full"
          >ຢືນຢັນ</UiButton
        >
      </div>
    </template>
  </UiModal>
  <UiDrawer
    v-model:open="visible"
    title="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ - ເລກທີ 0044/ຈຊນ.ນວ/ບຫ - ວັນທີ 26 ມີນາ 2025"
    placement="right"
    :width="1050"
  >
    <DrawerPr :id="selectedPrId" />
  </UiDrawer>
  <ShowShop v-model:open="isShopDrawerVisible" :shop-details="selectedShopDetails" />
  <SelectDocumentTypeModal v-model:visible="open" :isEdit="true" :itemid="String(selectedData)" />

  <!-- Budget Selection Drawer -->
  <UiDrawer v-model:open="visibleBudget" title="ເລືອກລະຫັດງົບປະມານ" placement="right" :width="500">
    <BudgetApprovalDrawer @confirm="handleBudgetConfirm" />
  </UiDrawer>
  <div class="print-only">
    <PrintPurchaseOrder :purchase-order="orderDetails" />
  </div>
</template>

<script setup lang="ts">
import type { ButtonType } from "@/modules/shared/buttonType";
import { computed, onMounted, ref } from "vue";
import { columnsApprovalDetails } from "../../views/budget/budget-approval/column/columnDetails";
import { useI18n } from "vue-i18n";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { Icon } from "@iconify/vue";
import { usePurchaseOrderStore } from "@/modules/presentation/Admin/stores/purchase_requests/purchase-order";
import { useRoute, useRouter } from "vue-router";
import { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";
import DrawerPr from "../drawer-pr-and-po/DrawerPr.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import Table from "@/common/shared/components/table/Table.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import ShowShop from "./ShowShop.vue";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { formatDate } from "@/modules/shared/formatdate";
import { useToggleStore } from "../../stores/storage.store";
import { storeToRefs } from "pinia";
import { useApprovalStepStore } from "../../stores/approval-step.store";
import { useDocumentStatusStore } from "../../stores/document-status.store";
import type { SubmitApprovalStepInterface } from "@/modules/interfaces/approval-step.interface";
import { useAuthStore } from "../../stores/authentication/auth.store";
import { useReportPoStore } from "../../stores/reports/report-po.store";
import PrintPurchaseOrder from "./PrintPurchaseOrder.vue";
import BudgetApprovalDrawer from "../budget-approval/BudgetApprovalDrawer.vue";
import SelectDocumentTypeModal from "../receipt/modal/SelectDocumentTypeModal.vue";
import OtpModal from "../purchase-requests/modal/OtpModal.vue";

/********************************************************* */
const purchaseOrderStore = usePurchaseOrderStore();
const approvalStepStore = useApprovalStepStore();
// const approvalStepId = ref<number | null>(null);
const route = useRoute();
const router = useRouter();
const orderId = ref<number>(parseInt(route.params.id as string, 10));
const { t } = useI18n();
const { success, error } = useNotification();
const isApproveModalVisible = ref(false);
const isRejectModalVisible = ref(false);
const rejectReason = ref("");
const confirmLoading = ref(false);
const visible = ref(false);
const selectedPrId = ref<number | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedBudgets = ref<Record<string, any>>({});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activeItemRecord = ref<any>(null);
const loading = ref(true);
const visibleBudget = ref(false);
const authStore = useAuthStore();
const { userRoles } = storeToRefs(authStore);
const reportExcelPoStore = useReportPoStore();
const canManageBudget = computed(() => {
  return userRoles.value.includes("budget-admin") || userRoles.value.includes("budget-user");
});
const columns = computed(() => columnsApprovalDetails(t, userRoles.value));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const showBudgetDrawer = (record: any) => {
  activeItemRecord.value = record;
  visibleBudget.value = true;
};
const handleExport = async () => {
  try {
    const documentId = route.params.id as string;
    if (!documentId) {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບເລກທີເອກະສານ");
      return;
    }

    loading.value = true;
    await reportExcelPoStore.reportPoExport(documentId);
  } catch (err) {
    console.error("Export error:", err);
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດ Export ໄດ້");
  } finally {
    loading.value = false;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleBudgetConfirm = (data: any) => {
  if (activeItemRecord.value) {
    selectedBudgets.value[activeItemRecord.value.id] = {
      purchaseOrderItemId: activeItemRecord.value.id,
      budgetId: data.id,
      budgetCode: data.budget_account?.code || "No Code",
      budgetName: data.budget_account?.name,
      budgetAmount: data.allocated_amount,
      remainingAmount: data.balance_amount,
      usedAmount: data.used || data.use_amount,
    };
    // console.log("Selected budgets after confirm:", selectedBudgets.value);
  }
  visibleBudget.value = false;
};

const showDrawer = () => {
  // Get the PR ID from your order details
  selectedPrId.value = orderDetails.value?.getPurchaseRequest()?.id ?? null;
  visible.value = true;
};

const isShopDrawerVisible = ref(false);
const selectedShopId = ref<number | undefined>(undefined);
const selectedShopDetails = computed(() => {
  if (!selectedShopId.value || !orderDetails.value) return null;
  return orderDetails.value
    .getPurchaseOrderItem()
    .find((item) => item.getId() === selectedShopId.value);
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const showShopDetails = (record: any) => {
  selectedShopId.value = record.getId();
  isShopDrawerVisible.value = true;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStepTitle = (index: number, step: any) => {
  if (index === 0) {
    return t("purchase-rq.proposer");
  }
  return `${t("purchase-rq.approver")} ${index}`;
};

// ລາຄາ
const getTotalAmount = computed(() => {
  if (!orderDetails.value?.getPurchaseOrderItem()) return 0;
  return orderDetails.value.getPurchaseOrderItem().reduce((sum, item) => {
    return sum + item.getTotal();
  }, 0);
});
const loadInitialBudgets = () => {
  if (orderDetails.value?.getPurchaseOrderItem()) {
    orderDetails.value.getPurchaseOrderItem().forEach((item) => {
      if (item.getBudgetItem()) {
        selectedBudgets.value[item.getId()] = {
          purchaseOrderItemId: item.getId(),
          budgetId: item.getBudgetItem().id,
          budgetCode: item.getBudgetItem().budget_account?.code || "No Code",
          budgetName: item.getBudgetItem().budget_account?.name,
          budgetAmount: item.getBudgetItem().allocated_amount,
          remainingAmount: item.getBudgetItem().balance_amount,
          usedAmount: item.getBudgetItem().used || item.getBudgetItem().use_amount,
        };
      }
    });
  }
};

const isApproved = ref(false);
/**************control header****************** */
const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);
const topbarStyle = computed(() => {
  return toggle.value ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full";
});

/*********************Check State OTP**************************** */
const documentStatusStore = useDocumentStatusStore();
// const requiresOtp = ref(false);
const modalAction = ref("");
// const approvalId = ref<number | null>(null);
const approvedStatusId = computed(() => {
  return documentStatusStore.document_Status.find((s) => s.getName() === "APPROVED")?.getId();
});
const rejectedStatusId = computed(() => {
  return documentStatusStore.document_Status.find((s) => s.getName() === "REJECTED")?.getId();
});
// Status check to header
const documentStatus = computed(() => {
  const rejectedStep = orderDetails.value
    ?.getUserApproval()
    ?.approval_step?.find((step) => step.status_id === 3);

  if (rejectedStep) {
    return {
      status: `ຖືກປະຕິເສດ`,
      // ໂດຍ ${rejectedStep.approver?.username || ''} ${rejectedStep.position?.name || ''
      statusClass: "text-red-500 font-medium ml-2 bg-red-50 px-3 py-1 rounded-full",
    };
  }
  const pendingStep = orderDetails.value
    ?.getUserApproval()
    ?.approval_step?.find((step) => step.status_id === 1);

  if (!pendingStep) {
    return {
      status: "ອະນຸມັດສຳເລັດ",
      statusClass: "text-green-500 font-medium ml-2 bg-green-50 px-3 py-1 rounded-full",
    };
  }
  // const nextApprover = pendingStep.doc_approver?.[0]?.user?.username;
  const nextDepartment = pendingStep.doc_approver?.[0]?.department?.name;

  return {
    status: `ລໍຖ້າ ${nextDepartment || ""} ກວດສອບ`,
    // ${nextApprover || ''}
    statusClass: "text-orange-500 font-medium ml-2 bg-orange-50 px-3 py-1 rounded-full",
  };
});


const handleResendOtp = async () => {
  if (!currentApprovalStep.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນຂັ້ນຕອນການອະນຸມັດ");
    return;
  }

  try {
    const result = await approvalStepStore.sendOtp(currentApprovalStep.value.id);
    if (result) {
      success("ສຳເລັດ", "ສົ່ງລະຫັດ OTP ໃໝ່ສຳເລັດ");
    }
  } catch (err: unknown) {
    console.error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດສົ່ງລະຫັດ OTP ໄດ້", err);
  }
};
/*********************Check State OTP**************************** */

/*********************check show button to data ********************* */
const approvalSteps = computed(() => orderDetails.value?.getUserApproval()?.approval_step ?? []);

const approvalStep = computed(() => {
  const steps = orderDetails.value?.getUserApproval()?.approval_step ?? [];
  return [...steps].sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0));
});

// check button approve/reject

const currentApprovalStep = computed(() => {
  if (!orderDetails.value || !approvalSteps.value.length) {
    return null;
  }

  // ดึงข้อมูล user จาก localStorage
  const userDataStr = localStorage.getItem("userData");
  const userData = userDataStr ? JSON.parse(userDataStr) : null;

  if (!userData) {
    return null;
  }

  // หา step ที่มีสถานะ pending
  const pendingStep = approvalSteps.value.find(
    (step) =>
      step.status_id === 1 && // PENDING
      step.step_number === (getPreviousApprovedStep.value?.step_number ?? 0) + 1
  );

  if (!pendingStep) {
    return null;
  }
  const isAuthorized = pendingStep.doc_approver?.some((approver) => {
    const userMatches = approver.user?.username === userData.username;
    const departmentMatches = approver.department?.name === userData.department_name;
    return userMatches && departmentMatches;
  });

  return isAuthorized ? pendingStep : null;
});
const canCreatePaymentDocument = computed(() => {
  if (!orderDetails.value || !approvalSteps.value.length) {
    return false;
  }

  const userDataStr = localStorage.getItem("userData");
  const userData = userDataStr ? JSON.parse(userDataStr) : null;

  if (!userData) {
    return false;
  }

  const allStepsApproved = approvalSteps.value.every((step) => step.status_id === 2);
  if (!allStepsApproved) {
    return false;
  }
  const lastStep = [...approvalSteps.value].sort((a, b) => b.step_number - a.step_number)[0];

  const isAuthorized = lastStep.doc_approver?.some((approver) => {
    const userMatches = approver.user?.username === userData.username;
    const departmentMatches = approver.department?.name === userData.department_name;
    return userMatches && departmentMatches;
  });

  return isAuthorized;
});

const getPreviousApprovedStep = computed(() => {
  return [...approvalSteps.value]
    .filter((step) => step.status_id === 2) // APPROVED
    .sort((a, b) => b.step_number - a.step_number)[0];
});

const canApprove = computed(() => {
  const currentStep = currentApprovalStep.value;
  if (!currentStep) {
    return false;
  }
  if (currentStep.step_number === 0) {
    return true;
  }
  const previousStep = getPreviousApprovedStep.value;
  const canApprove =
    previousStep &&
    previousStep.status_id === 2 &&
    previousStep.step_number === currentStep.step_number - 1;

  return canApprove;
});

const isFullyApproved = computed(() => {
  if (!orderDetails.value || !approvalSteps.value.length) {
    return false;
  }

  // เช็คว่าทุก step (ยกเว้น step 0) มีสถานะ APPROVED (status_id === 2)
  return approvalSteps.value
    .filter((step) => step.step_number !== 0)
    .every((step) => step.status_id === 2);
});

const customButtons = computed(() => {
  // Debug logs
  // console.log("=== DEBUG CUSTOM BUTTONS ===");
  // console.log("isApproved:", isApproved.value);
  // console.log("isFullyApproved:", isFullyApproved.value);
  // console.log("canApprove:", canApprove.value);
  // console.log("canCreatePaymentDocument:", canCreatePaymentDocument.value);
  // console.log("approvalSteps:", approvalSteps.value);

  // // Debug user data
  // const userDataStr = localStorage.getItem("userData");
  // const userData = userDataStr ? JSON.parse(userDataStr) : null;
  // console.log("User data from localStorage:", userData);

  // ✅ ถ้าอนุมัติครบแล้วและเป็น user ที่มีสิทธิ์สร้างใบเบิกจ่าย (มาก่อนเสมอ!)
  if (canCreatePaymentDocument.value) {
    // console.log("Showing payment document buttons - case 2 (PRIORITY)");
    return [
      {
        label: "Export",
        icon: "ant-design:file-excel-outlined",
        class: "bg-green-600 flex items-center gap-2 hover:bg-green-800 mr-4",
        type: "default" as ButtonType,
        onClick: handleExport,
      },
      {
        label: "Print",
        icon: "ant-design:printer-outlined",
        class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
        type: "default" as ButtonType,
        onClick: handlePrint,
      },
      {
        label: `ສ້າງໃບເບີກຈ່າຍ`,
        type: "primary" as ButtonType,
        onClick: () => {
          onChooseDocumentType();
        },
      },
    ];
  }

  // ✅ แสดงปุ่ม Export และ Print เมื่ออนุมัติสำเร็จหรือเอกสารอนุมัติครบแล้ว (หลัง case 2)
  if (isApproved.value || isFullyApproved.value) {
    // console.log("Showing basic buttons (Export, Print) - case 1");
    return [
      {
        label: "Export",
        icon: "ant-design:file-excel-outlined",
        class: "bg-green-600 flex items-center gap-2 hover:bg-green-800 mr-4",
        type: "default" as ButtonType,
        onClick: handleExport,
      },
      {
        label: "Print",
        icon: "ant-design:printer-outlined",
        class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
        type: "default" as ButtonType,
        onClick: handlePrint,
      },
    ];
  }

  // ✅ ถ้าไม่มีสิทธิ์อนุมัติ แต่เอกสารอนุมัติครบแล้ว ให้ตรวจสอบว่าเป็นผู้อนุมัติคนสุดท้ายหรือไม่
  if (!canApprove.value && isFullyApproved.value) {
    // console.log("Cannot approve - no permissions, but document is fully approved - case 3");

    // ตรวจสอบว่าเป็นผู้อนุมัติขั้นตอนสุดท้ายหรือไม่
    if (canCreatePaymentDocument.value) {
      // console.log("User can create payment document - showing all buttons");
      return [
        {
          label: "Export",
          icon: "ant-design:file-excel-outlined",
          class: "bg-green-600 flex items-center gap-2 hover:bg-green-800 mr-4",
          type: "default" as ButtonType,
          onClick: handleExport,
        },
        {
          label: "Print",
          icon: "ant-design:printer-outlined",
          class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
          type: "default" as ButtonType,
          onClick: handlePrint,
        },
        {
          label: `ສ້າງໃບເບີກຈ່າຍ`,
          type: "primary" as ButtonType,
          onClick: () => {
            onChooseDocumentType();
          },
        },
      ];
    }

    // ถ้าไม่มีสิทธิ์สร้างใบเบิกจ่ายก็แสดงแค่ปุ่ม Export และ Print
    // console.log("User cannot create payment document - showing basic buttons only");
    return [
      {
        label: "Export",
        icon: "ant-design:file-excel-outlined",
        class: "bg-green-600 flex items-center gap-2 hover:bg-green-800 mr-4",
        type: "default" as ButtonType,
        onClick: handleExport,
      },
      {
        label: "Print",
        icon: "ant-design:printer-outlined",
        class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
        type: "default" as ButtonType,
        onClick: handlePrint,
      },
    ];
  }

  // ✅ ถ้าไม่มีสิทธิ์อนุมัติและเอกสารยังไม่อนุมัติครบ - ไม่แสดงปุ่ม
  if (!canApprove.value) {
    // console.log("Cannot approve - no permissions and document not fully approved - case 4");
    return [];
  }

  const currentStep = currentApprovalStep.value;
  if (!currentStep) {
    // console.log("No current step available for buttons");
    return [];
  }

  // ✅ ถ้ามีสิทธิ์อนุมัติ - แสดงปุ่ม Export, Print, Reject, Approve
  return [
    {
      label: "Export",
      icon: "ant-design:file-excel-outlined",
      class: "bg-green-500 flex items-center gap-2 hover:bg-green-600 mr-4",
      type: "default" as ButtonType,
      onClick: handleExport,
    },
    {
      label: "Print",
      icon: "ant-design:printer-outlined",
      class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
      type: "default" as ButtonType,
      onClick: handlePrint,
    },
    {
      label: t("purchase-rq.card_title.refused"),
      type: "default" as ButtonType,
      onClick: () => {
        modalAction.value = "reject";
        isRejectModalVisible.value = true;
      },
    },
    {
      label: t("purchase-rq.btn.approval"),
      type: "primary" as ButtonType,
      onClick: async () => {
        modalAction.value = "approve";
        const success = await handleApprove();
        if (!success) {
          modalAction.value = "";
        }
      },
    },
  ];
});
/*******************************************/

const orderDetails = ref<PurchaseOrderEntity | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const orderItems = ref<any[]>([]);
const showApprovalSuccess = ref(false);
const isOtpModalVisible = ref(false);
const isSignatureModalVisible = ref(false);
const isSuccessModalVisible = ref(false);
const signatureData = ref("");
const open = ref<boolean>(false);
const selectedData = ref<string | null>(null);
const purchaseOrderId = route.params.id as string;
const onChooseDocumentType = () => {
  selectedData.value = purchaseOrderId;
  open.value = true;
};

const getPurchaseOrderRemark = computed(() => {
  if (
    orderDetails.value &&
    orderDetails.value.getPurchaseOrderItem &&
    orderDetails.value.getPurchaseOrderItem().length > 0
  ) {
    return orderDetails.value.getPurchaseOrderItem()[0].getRemark();
  }

  return (
    orderDetails.value?.getPurchaseRequest()?.purchase_request_item?.[0]?.remark ||
    "ທົດລອງລະບົບບັນທຶກ"
  );
});

const getPurchaseOrderQuantity = computed(() => {

  const poItems = orderDetails.value?.getPurchaseOrderItem?.() ?? [];
  if (Array.isArray(poItems) && poItems.length > 0) {
    return poItems.reduce((sum, item) => {

      const quantity = item.getQuantity?.() ?? 0;
      return sum + Number(quantity);
    }, 0);
  }
  const prItems = orderDetails.value?.getPurchaseRequest?.()?.purchase_request_item ?? [];
  if (Array.isArray(prItems) && prItems.length > 0) {
    return prItems.reduce((sum, item) => {
      const quantity = item.quantity ?? 0;
      return sum + Number(quantity);
    }, 0);
  }
  return 0;
});

// const items = computed(() => orderDetails.value?.getItems() ?? []);
// console.log("Items:", items.value);

/**********************Data Detials Order*************************** */
const fetchOrderDetails = async () => {
  try {
    if (!orderId.value) {
      error("ບໍ່ພົບລະຫັດເອກະສານ");
      return;
    }

    const result = await purchaseOrderStore.fetchById(orderId.value);
    if (result) {
      orderDetails.value = result;

      if (result.getItems && result.getItems()) {
        orderItems.value = result.getItems();
      }

      // console.log("Purchase order items:", result.getPurchaseOrderItem());
      // console.log("Order details fetched:", result);
    } else {
      error("ບໍ່ພົບຂໍ້ມູນເອກະສານ");
    }
  } catch (err) {
    console.error("Error fetching order details:", err);
    error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ");
  }
};

onMounted(async () => {
  await documentStatusStore.fetctDocumentStatus();
  await fetchOrderDetails();
  loadInitialBudgets();
});

const handlePrint = () => {
  window.print();
};

const userInfo = {
  name: "ນາງ ປາກາລີ ລາຊະບູລີ",
  department: "ພະແນກໄອທີ, ພະບໍລິມາດ",
};

const handleOtpConfirm = async (otpCode: string) => {
  if (!orderDetails.value || !currentApprovalStep.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນທີ່ຈຳເປັນ");
    return;
  }

  if (!approvedStatusId.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບສະຖານະການອະນຸມັດ");
    return;
  }
  const purchaseOrderItemsPayload = Object.keys(selectedBudgets.value).map((itemId) => {
    const budget = selectedBudgets.value[itemId];
    return {
      id: Number(itemId),
      budget_item_id: budget.budgetId,
    };
  });

  try {
    confirmLoading.value = true;
    const payload: SubmitApprovalStepInterface = {
      type: "po",
      statusId: Number(approvedStatusId.value),
      remark: "ຢືນຢັນສຳເລັດ",
      approvalStepId: Number(currentApprovalStep.value.id),
      approval_id: Number(approvalStepStore.otpResponse?.approval_id),
      is_otp: true,
      otp: otpCode,
      purchase_order_items: purchaseOrderItemsPayload ?? [],
      files: [],
    };
    const documentId = route.params.id as string;
    const success = await approvalStepStore.submitApprovalDepartMent(documentId, payload);

    if (success) {
      isOtpModalVisible.value = false;
      isSuccessModalVisible.value = true;
      isApproved.value = true;
    }
  } catch (err) {
    console.error("Error in handleOtpConfirm:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
  } finally {
    confirmLoading.value = false;
  }
};

const handleApprove = async () => {
  if (!orderDetails.value || !currentApprovalStep.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນເອກະສານ");
    return false;
  }

  if (!approvedStatusId.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບສະຖານະການອະນຸມັດ");
    return false;
  }

  try {
    const purchaseOrderItemsPayload = Object.keys(selectedBudgets.value).map((itemId) => {
      const budgetData = selectedBudgets.value[itemId];
      return {
        id: Number(budgetData.purchaseOrderItemId),
        budget_item_id: budgetData.budgetId,
      };
    });
    if (currentApprovalStep.value.is_otp) {
      const otpResult = await approvalStepStore.sendOtp(currentApprovalStep.value.id);
      if (otpResult) {
        isOtpModalVisible.value = true;
      }
      return false;
    } else {
      const payload = {
        type: "po" as const,
        statusId: Number(approvedStatusId.value),
        remark: "ຢືນຢັນສຳເລັດ",
        approvalStepId: Number(currentApprovalStep.value.id),
        is_otp: false,
        purchase_order_items: purchaseOrderItemsPayload,
        files: [],
      };

      const documentId = route.params.id as string;
      const success = await approvalStepStore.submitApprovalDepartMent(documentId, payload);

      if (success) {
        isApproveModalVisible.value = false;
        isSuccessModalVisible.value = true;
        isApproved.value = true;
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error("Error in handleApprove:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
    return false;
  }
};
const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    error("ເກີດຂໍ້ຜິດພາດ", "ກະລຸນາລະບຸເຫດຜົນໃນການປະຕິເສດ");
    return;
  }

  if (!rejectedStatusId.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນສະຖານະ 'Rejected' ໃນລະບົບ");
    return;
  }

  if (!orderDetails.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນເອກະສານ");
    return;
  }

  try {
    const userApproval = orderDetails.value.getUserApproval();
    if (!userApproval?.approval_step?.[0]?.id) {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step");
      return;
    }

    const approvalStepId = userApproval.approval_step[0].id;

    const documentId = route.params.id as string;
    const payload = {
      type: "po" as const,
      statusId: Number(rejectedStatusId.value),
      remark: rejectReason.value,
      approvalStepId: Number(approvalStepId),
    };

    // console.log("Sending payload Reject:", payload);

    const success = await approvalStepStore.submitApproval(documentId, payload);
    router.push({ name: "approval_department_panak" });
    if (success) {
      isRejectModalVisible.value = false;
      rejectReason.value = "";
    }
  } catch (err) {
    console.error("Error in handleReject:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
  }
};

// Document details
const documentDetails = {
  requester: {
    name: "ທ່ານ ພົມມະກອນ ຄວາມຄູ",
    position: "ພະນັກງານພັດທະນາລະບົບ, ຝ່າຍໄອທີ",
    avatar: "/public/4.png",
  },
  requestDate: "30 ມີນາ 2025",
  purpose:
    "ເພື່ອໃຫ້ແທດເໝາະ ໃຫ້ຮອງຮັບກັບການປະຕິບັດວຽກງານ ແລະ ເພື່ອອຳນວຍຄວາມສະດວກໃນການປະຕິບັດໜ້າທີ່ວຽກງານ",
};

/********************************************************** */
const handleSignatureConfirm = async () => {
  try {
    confirmLoading.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isSignatureModalVisible.value = false;
    isSuccessModalVisible.value = true;
    success("ການຢືນຢັນສຳເລັດ");
  } catch (err) {
    console.error(err);
    error("ການຢືນຢັນລາຍເຊັນລົ້ມເຫລວ");
  } finally {
    confirmLoading.value = false;
  }
};

const handleSuccessConfirm = async () => {
  try {
    confirmLoading.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isSuccessModalVisible.value = false;
    isApproved.value = true;
    // success("ການຢືນຢັນສຳເລັດ");
    router.push({ name: "approval_department_panak" });
    // currentStep.value = 1;
    showApprovalSuccess.value = true;
  } catch (err) {
    console.error(err);
    error("ການຢືນຢັນລາຍເຊັນລົ້ມເຫລວ");
  } finally {
    confirmLoading.value = false;
  }
};


/********************************** */
const handleModalCancel = () => {
  isOtpModalVisible.value = false;
  isSignatureModalVisible.value = false;
  isSuccessModalVisible.value = false;
  signatureData.value = "";
};
</script>
<style scoped>
.print-only {
  display: none;
}

@media print {
  /* Hide everything except print component */
  body * {
    visibility: hidden;
  }

  .print-only,
  .print-only * {
    visibility: visible;
  }

  .print-only {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  /* Hide scrollbars */
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  /* Remove shadows and borders for print */
  .print-only * {
    box-shadow: none !important;
  }
}
</style>
