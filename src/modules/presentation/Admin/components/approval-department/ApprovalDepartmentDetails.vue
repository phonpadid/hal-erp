<template>
  <div class="mt-10">
    <div>
      <!-- Header component -->
      <div
        class="fixed px-6 py-4 top-0 z-40 h-auto bg-white shadow-sm transition-all duration-150 mt-[4rem]"
        :class="topbarStyle"
      >
    <UiButton icon="mdi:arrow-left" size="small" class="flex items-center gap-2 text-white bg-blue-600 hover:!bg-blue-900 hover:!text-white" @click="goBack">ກັບຄືນ</UiButton>
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
                <!-- Check if it's a PDF file by checking if URL contains po_file_name path -->
                <a
                  v-if="record.getQuotationImageUrl() && record.getQuotationImageUrl().includes('po_file_name/')"
                  :href="record.getQuotationImageUrl()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                >
                  <Icon icon="material-symbols:lab-profile-outline-rounded" class="text-red-600 text-2xl" />
                  <span class="text-xs text-red-700 font-medium">ເບິງຂໍ້ມູນໃບສະເໜີ</span>
                </a>
                <!-- Display image for non-PDF files -->
                <a-image
                  v-else-if="record.getQuotationImageUrl()"
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
                    <!-- ເພີ່ມວັນທີເວລາອະນຸມັດ -->
                    <p v-if="step.approved_at" class="text-xs text-blue-500 mt-1">
                      {{ formatDate(step.approved_at) }}
                    </p>
                  </template>
                  <template v-else>
                    <p class="text-xs text-gray-500">
                      {{ t("purchase-rq.pending") }}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                      {{ step.doc_approver?.[0]?.department?.name || "-" }}
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
    v-if="isOtpModalVisible"
    :visible="true"
    :title="t('purchase-rq.otp-verification')"
    :approval-step-id="currentApprovalStep?.id"
    :is-otp="currentPoIsOtp"
    :loading="confirmLoading"
    :key="`otp-modal-po-${currentPoStepId}-${currentPoIsOtp}`"
    @confirm="handleOtpConfirm"
    @close="handleOtpClose"
    @resend="handleResendOtp"
  />
  <!-- Signature Modal -->
  <UiModal
    title="ລາຍເຊັນ"
    title-icon="material-symbols-light:signature"
    :visible="isSignatureModalVisible"
    :confirm-loading="confirmLoading"
    @update:visible="isSignatureModalVisible = $event"
    @ok="handleSignatureConfirm"
    @cancel="handleModalCancel"
  >
    <div>
      <div class="flex gap-2 items-center">
        <span class="font-medium">{{ userInfo.name }}</span>
        <span class="text-sm text-gray-600">{{ userInfo.department }}</span>
      </div>

      <div>
        <p class="text-xl font-bold">ລາຍເຊັນ</p>
        <p>ລາຍເຊັນຂອງທ່ານຈະຖືກນຳໃຊ້ໃນການຢືນຢັນເອກະສານ</p>

        <!-- Signature Display - User's actual signature -->
        <div class="flex justify-center w-full mt-4">
          <img
            :src="userSignature"
            alt="Digital Signature"
            class="max-w-[270px] max-h-[120px] object-contain"
            @error="handleImageError"
          />
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
    <BudgetApprovalDrawer :departmentId="orderDetails?.getPurchaseRequest()?.document?.department?.id" @confirm="handleBudgetConfirm" />
  </UiDrawer>
  <div class="print-only">
    <PrintPurchaseOrder :purchase-order="orderDetails" />
  </div>
</template>

<script setup lang="ts">
import type { ButtonType } from "@/modules/shared/buttonType";
import { computed, onMounted, ref, watch, nextTick } from "vue";
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

// ✅ เพิ่ม state สำหรับ OTP (เหมือนกับ PR)
const currentPoIsOtp = ref<boolean>(false);
const currentPoStepId = ref<number | null>(null);

// Super Admin Authentication Check
const isSuperAdmin = computed(() => {
  return userRoles.value.includes('super-admin');
});

const goBack = () => {
  router.back();
};
// Enhanced access control function for approval workflow
const hasApprovalAccess = computed(() => {
  const userDataStr = localStorage.getItem("userData");
  const userData = userDataStr ? JSON.parse(userDataStr) : null;

  if (!userData) {
    return false;
  }



  // Super admins always have approval access
  if (isSuperAdmin.value) {
    return true;
  }

  // Check if user has company admin role
  const isCompanyAdmin = userData.roles?.some((role: unknown) => {
    if (typeof role === 'object' && role !== null) {
      const roleObj = role as Record<string, string>;
      return roleObj.name === 'company_admin' ||
             roleObj.name === 'company-admin' ||
             roleObj.display_name === 'company_admin' ||
             roleObj.display_name === 'company-admin';
    }
    return false;
  });

  // Company admins also have broader access
  if (isCompanyAdmin) {
    return true;
  }

  // Regular users follow the same authorization logic
  return canApprove.value;
});
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
const getStepTitle = (index: number, step: any) => {
  if (index === 0) {
    return t("purchase-rq.proposer");
  }
  // ໃຊ້ຊື່ແຜນກຈາກ doc_approver[0].department.name
  const deptName = step.doc_approver?.[0]?.department?.name;
  return deptName || `${t("purchase-rq.approver")} ${index}`;
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

  // ✅ Super admins can approve specific steps they are authorized for
  if (hasApprovalAccess.value) {
    const previousApprovedStep = getPreviousApprovedStep.value;
    const nextStepNumber = (previousApprovedStep?.step_number ?? 0) + 1;

    const pendingStep = approvalSteps.value.find(
      (step) =>
        step.status_id === 1 && // PENDING
        step.step_number === nextStepNumber
    );



    // ✅ For Super Admins: Check if they are explicitly authorized in doc_approver OR if no specific approvers are set
    if (pendingStep) {
      const userDataStr = localStorage.getItem("userData");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;

      // Special case for Super Admin: If no doc_approver is set for this step, allow approval
      if (isSuperAdmin.value && (!pendingStep.doc_approver || pendingStep.doc_approver.length === 0)) {
        return pendingStep;
      }

      // Check if Super Admin is explicitly authorized in doc_approver
      const isExplicitlyAuthorized = pendingStep.doc_approver?.some((approver) => {
        const userMatches = approver.user?.username === userData?.username;
        const departmentMatches = approver.department?.name === userData?.department_name;
        // For Super Admin, allow username match only (department can be null)
        if (isSuperAdmin.value) {
          return userMatches;
        }
        return userMatches || departmentMatches;
      });

      if (isExplicitlyAuthorized) {

        return pendingStep;
      } else {

        return null;
      }
    }

    return null;
  }

  // ✅ ເພີ່ກວດສອບວ່າ user ປະຈຸບັນເປັນ requester ຂອງ PO ຫຼືບໍ່ (ສຳລັບ step 0)
  const poRequesterFromOrder = orderDetails.value?.getRequester()?.username;

  // ✅ ຕຣວຈອບຈາກ document data ໂດຍກົງ (fallback ຖ້າ getRequester ບໍ່ທຳງານ)
  const poRequesterFromDoc = orderDetails.value?.getDocument()?.requester?.username;
  const poRequester = poRequesterFromOrder || poRequesterFromDoc;

  const isPORequester = poRequester === userData.username;
  const isPOFirstStep = approvalSteps.value.some(step => step.step_number === 0 && step.status_id === 1);



  // ✅ ຖ້າເປັນ requester ແລະ step ທຳອິດຍັງບໍ່ອະນຸມັດ → ໃຫ້ອະນຸມັດໄດ້
  if (isPORequester && isPOFirstStep) {
    const firstStep = approvalSteps.value.find(step => step.step_number === 0);

    return firstStep || null;
  }

  // Regular users follow existing approval logic
  const previousApprovedStep = getPreviousApprovedStep.value;
  const nextStepNumber = (previousApprovedStep?.step_number ?? 0) + 1;

  const pendingStep = approvalSteps.value.find(
    (step) =>
      step.status_id === 1 && // PENDING
      step.step_number === nextStepNumber
  );

  if (!pendingStep) {

    return null;
  }

  const isAuthorized = pendingStep.doc_approver?.some((approver) => {
    const userMatches = approver.user?.username === userData.username;
    const departmentMatches = approver.department?.name === userData.department_name;
    // For Super Admin, allow username match only (department can be null)
    if (isSuperAdmin.value) {
      return userMatches;
    }
    return userMatches && departmentMatches;
  });


  return isAuthorized ? pendingStep : null;
});
const canCreatePaymentDocument = computed(() => {
  if (!orderDetails.value || !approvalSteps.value.length) {
    return false;
  }

  // Super admins and company admins can create payment documents when fully approved
  if (hasApprovalAccess.value) {
    const allStepsApproved = approvalSteps.value.every((step) => step.status_id === 2);
    return allStepsApproved;
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

  // Check if user is in any step's doc_approver (not just the last step)
  const isAuthorized = approvalSteps.value.some((step) => {
    return step.doc_approver?.some((approver) => {
      const userMatches = approver.user?.username === userData.username;
      const departmentMatches = approver.department?.name === userData.department_name;
      return userMatches && departmentMatches;
    });
  });

  return isAuthorized;
});

const getPreviousApprovedStep = computed(() => {
  return [...approvalSteps.value]
    .filter((step) => step.status_id === 2) // APPROVED
    .sort((a, b) => b.step_number - a.step_number)[0];
});

const canApprove = computed(() => {
  // Super admins and company admins need explicit authorization in doc_approver
  if (hasApprovalAccess.value && currentApprovalStep.value) {
    const userDataStr = localStorage.getItem("userData");
    const userData = userDataStr ? JSON.parse(userDataStr) : null;

    // Special case for Super Admin: If no doc_approver is set for this step, allow approval
    if (isSuperAdmin.value && (!currentApprovalStep.value.doc_approver || currentApprovalStep.value.doc_approver.length === 0)) {
      return true;
    }

    // Check if current user (Super Admin or Company Admin) is explicitly authorized in doc_approver
    const isExplicitlyAuthorized = currentApprovalStep.value.doc_approver?.some((approver) => {
      const userMatches = approver.user?.username === userData?.username;
      const departmentMatches = approver.department?.name === userData?.department_name;
      // For Super Admin, allow username match only (department can be null)
      if (isSuperAdmin.value) {
        return userMatches;
      }
      return userMatches || departmentMatches; // For Company Admin, allow username OR department match
    });



    return isExplicitlyAuthorized;
  }

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



  // ✅ ຖ້າມີ step ທີ່ຖືກປະຕິເສດ -> ບໍ່ຖືກອະນຸມັດຄົບ
  const hasRejectedStep = approvalSteps.value.some(step => step.status_id === 3);
  if (hasRejectedStep) {
    return false;
  }

  // ✅ ເຊ็คວ່າທຸກ step ມີສະຖານະ APPROVED (status_id === 2)
  const allStepsApproved = approvalSteps.value.every(step => step.status_id === 2);



  return allStepsApproved;
});

const customButtons = computed(() => {


  // ✅ ເພີ່ກວດສອບສະຖານະພິເສດຂອງ PO Requester ທີ່ຕ້ອງອະນຸມັດຂັ້ນຕອນທຳອິດ
  const userDataStr = localStorage.getItem("userData");
  const userData = userDataStr ? JSON.parse(userDataStr) : null;

  // ✅ ກວດສອບຈາຫຼາຍທາງ - ຖ້າເປັນ PO Requester ຈາກ doc_approver ຂອງ step 0
  let poRequester = null;
  const firstStep = approvalSteps.value.find(step => step.step_number === 0);
  if (firstStep?.doc_approver?.[0]?.user?.username) {
    poRequester = firstStep.doc_approver[0].user.username;
  }

  // ✅ Fallback ຖ້າບໍ່ພົບຈາກ doc_approver
  if (!poRequester) {
    const poRequesterFromOrder = orderDetails.value?.getRequester()?.username;
    const poRequesterFromDoc = orderDetails.value?.getDocument()?.requester?.username;
    poRequester = poRequesterFromOrder || poRequesterFromDoc;
  }

  const isPORequester = poRequester === userData?.username;
  const isPOFirstStep = approvalSteps.value.some(step => step.step_number === 0 && step.status_id === 1);



  // ✅ ກວດສອບການອະນຸມັດທັງຫມົດກ່ອນສ້າງ PO
  // ຖ້າຍັງບໍ່ອະນຸມັດຄົບບໍ່ໃຫ້ສ້າງ PO
  if (!isFullyApproved.value) {}

  // ✅ ຖ້າອະນຸມັດຄົບແລ້ວ ແລະ ເປັນ user ທີ່ມີສິດສ້າງໃບເບີກຈ່າຍ (ມາກ່ອນເສມອດ!)
  if (canCreatePaymentDocument.value && isFullyApproved.value) {
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

  // ✅ ແສດງປຸ່ມ Export ແລະ Print ເມື່ອອະນຸມັດສຳເລັດຫຼື ເອກະສານອະນຸມັດຄົບແລ້ວ
  if (isApproved.value || isFullyApproved.value) {
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

  // ✅ ຖ້າເປັນ PO Requester ແລະມີ current step (ຂັ້ນຕອນທຳອິດ) → ແສດງປຸ່ມອະນຸມັດ
  if (isPORequester && isPOFirstStep && currentApprovalStep.value) {


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
  }

  // ✅ ຖ້າບໍ່ມີສິດອະນຸມັດ ແລະ ເອກະສາຍຍັງບໍ່ອະນຸມັດຄົບ - ບໍ່ແສດງປຸ່ມ
  if (!canApprove.value) {
    return [];
  }

  const currentStep = currentApprovalStep.value;
  if (!currentStep) {
    return [];
  }

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

// ✅ เพิ่ม watch หลังจากที่ประกาศตัวแปรแล้ว
watch(() => currentPoIsOtp.value, (newVal) => {
  console.log('🔍 [PO] currentPoIsOtp.value changed:', newVal);
});

watch(() => isOtpModalVisible.value, (newVal) => {
  console.log('🔍 [PO] isOtpModalVisible.value changed to:', newVal, 'currentPoIsOtp.value =', currentPoIsOtp.value);
});
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

// ✅ Get user info from auth store instead of static data
const userInfo = computed(() => {
  const userData = authStore.user;
  const department = orderDetails.value?.getDepartment()?.name || "";

  return {
    name: userData?.getUsername() || "ບໍ່ພົບຜູ້ໃຊ້",
    department: department,
  };
});

// ✅ Get user signature from auth store or localStorage
const userSignature = computed(() => {
  // Try to get signature from auth store user data first
  if (authStore.user?.getSignature()) {
    return authStore.user.getSignature();
  }

  // Fallback to localStorage directly
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData.signature;
    }
  } catch (error) {
    console.error('Error parsing userData from localStorage:', error);
  }

  // Fallback to default signature image if no signature found
  return '/2.png';
});

// ✅ Handle signature image error
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // Fallback to default signature image if user signature fails to load
  img.src = '/2.png';
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

      // ✅ ກວດສອບວ່າເປັນຂັ້ນຕອນທໍາອິດ (step 0) ຫຼືບໍ່
      if (currentApprovalStep.value.step_number === 0) {
        // console.log("🔄 First step approved, redirecting to PR list...");
        // ຖ້າເປັນຂັ້ນຕອນທໍາອິດ ໃຫ້ກັບໄປຫນ້າ PR list
          router.push({ name: "approval_department_panak" }); // ປັ່ຽນຊື່ route ໃຫ້ຖືກຕ້ອງ
      }
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

    // ✅ ກວດສອບຂັ້ນຕອນກ່ອນສົ່ງ OTP
    const isFirstStep = currentApprovalStep.value.step_number === 0;

    console.log('🔍 [PO] handleApprove: currentApprovalStep.is_otp =', currentApprovalStep.value.is_otp);

    if (currentApprovalStep.value.is_otp) {
      // ✅ ตั้งค่า is_otp ก่อนเปิด modal
      console.log('🔍 [PO] STEP 1: Setting currentPoIsOtp.value =', currentApprovalStep.value.is_otp);
      currentPoIsOtp.value = currentApprovalStep.value.is_otp;
      currentPoStepId.value = currentApprovalStep.value.id;

      // รอ Vue update
      await nextTick();

      console.log('🔍 [PO] STEP 2: After nextTick, currentPoIsOtp.value =', currentPoIsOtp.value);

      // ส่ง OTP
      const otpResult = await approvalStepStore.sendOtp(currentApprovalStep.value.id);
      if (otpResult) {
        // รอ Vue update อีกครั้ง
        await nextTick();
        console.log('🔍 [PO] STEP 3: Opening modal, currentPoIsOtp.value =', currentPoIsOtp.value);
        isOtpModalVisible.value = true;
      }
      return false;
    } else {
      // ✅ When is_otp: false, show signature modal first for confirmation
      console.log('🔍 [PO] is_otp is false, showing signature modal for confirmation');
      isSignatureModalVisible.value = true;
      return false;
    }
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
  if (!orderDetails.value || !currentApprovalStep.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນເອກະສານ");
    return;
  }

  if (!approvedStatusId.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບສະຖານະການອະນຸມັດ");
    return;
  }

  try {
    confirmLoading.value = true;

    // ✅ Prepare purchase order items payload
    const purchaseOrderItemsPayload = Object.keys(selectedBudgets.value).map((itemId) => {
      const budgetData = selectedBudgets.value[itemId];
      return {
        id: Number(budgetData.purchaseOrderItemId),
        budget_item_id: budgetData.budgetId,
      };
    });

    // ✅ Submit approval with is_otp: false
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
      isSignatureModalVisible.value = false;
      isSuccessModalVisible.value = true;
      isApproved.value = true;

      // ✅ Check if it's the first step - redirect to list
      const isFirstStep = currentApprovalStep.value.step_number === 0;
      if (isFirstStep) {
        router.push({ name: "purchase-requests" });
      }
    }
  } catch (err) {
    console.error("Error in handleSignatureConfirm:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
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

// ✅ เพิ่ม function สำหรับปิด OTP modal
const handleOtpClose = () => {
  console.log('🔍 [PO] Modal closed, reset currentPoIsOtp to false');
  isOtpModalVisible.value = false;
  currentPoIsOtp.value = false;
  currentPoStepId.value = null;
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
