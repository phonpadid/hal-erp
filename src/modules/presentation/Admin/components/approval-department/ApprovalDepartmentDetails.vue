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
          <Table
            :columns="columnsDetails(t)"
            :dataSource="orderDetails?.getPurchaseOrderItem() || []"
          >
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
              <span>{{ formatPrice(record.getPrice()) }} ₭</span>
            </template>

            <template #Shop="{ record }">
              <UiButton
                type="link"
                icon="ant-design:eye-outlined"
                color-class="flex items-center text-red-500 hover:!text-red-900"
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
              <span class="text-gray-500 mt-2 flex justify-end">
                <div class="font-medium">ລາຄາລວມ:</div>
                <div class="text-gray-600">{{ formatPrice(getTotalAmount) }} ₭</div>
              </span>
              <span class="text-gray-500 mt-2 flex justify-end">
                <div class="font-medium">ພາສີມູນຄ່າເພີ່ມ (VAT):</div>
                <div class="text-gray-600">
                  {{ hasVat ? `${formatPrice(getTotalVat)} ₭` : "0" }}
                </div>
              </span>
              <span class="text-gray-500 mt-2 flex justify-end">
                <div class="font-medium">ລາຄາລວມທັງໝົດ:</div>
                <div class="text-gray-600 font-bold">{{ formatPrice(getTotalWithVat) }} ₭</div>
              </span>
            </div>
          </div>
        </div>
        <!-- Signatures -->
        <div class="flex flex-wrap gap-4">
          <!-- Approval Steps -->
          <template v-for="(step, index) in approvalStep" :key="step.id">
            <div>
              <!-- Step Title -->
              <p class="text-slate-500 text-sm mb-2 text-center">
                {{ getStepTitle(index, step) }}
              </p>

              <!-- Signature Display -->
              <div class="w-[80px] h-[80px]">
                <template v-if="step.status_id === 2 && step.approver?.user_signature">
                  <!-- Approved signature -->
                  <a-image
                    :src="step.approver.user_signature.signature_url"
                    alt="signature"
                    :width="80"
                    :height="60"
                    :preview="false"
                    class="block"
                  />
                </template>
                <template v-else-if="step.status_id === 1">
                  <!-- Pending signature -->
                  <div class="h-full flex items-center justify-center bg-gray-50">
                    <span class="text-gray-400 text-center">{{ t("purchase-rq.pending") }}</span>
                  </div>
                </template>
              </div>

              <!-- Approver Info -->
              <div class="info text-sm text-slate-600 -space-y-1 text-center">
                <template v-if="step.approver">
                  <p class="font-medium">{{ step.approver.username }}</p>
                  <!-- <p class="text-xs">{{ step.position?.name || "-" }}</p> -->
                  <!-- <p class="text-xs" v-if="step.approved_at">
                    {{ formatDate(step.approved_at) }}
                  </p> -->
                </template>
                <template v-else-if="step.doc_approver?.[0]?.user">
                  <p class="font-medium">{{ step.doc_approver[0].user.username }}</p>
                  <p class="text-xs">{{ t("purchase-rq.pending") }}</p>
                </template>
              </div>
            </div>
          </template>
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
  <!-- OTP -->
  <UiModal
    title="ລາຍເຊັນ"
    title-icon="material-symbols-light:signature"
    :visible="isOtpModalVisible"
    :confirm-loading="confirmLoading"
    @update:visible="isOtpModalVisible = $event"
    @cancel="handleModalCancel"
  >
    <div class="p-4">
      <div>
        <p>{{ userInfo.name }} {{ userInfo.department }}</p>
      </div>
      <div>
        <p class="text-gray-950 text-xl">ກວດສອບຂໍ້ຄວາມ</p>
        <p class="text-sm text-gray-500 mb-4">
          ລະຫັດຢືນຢັນ 6 ຕົວ ໄດ້ສົ່ງໄປທີ່ເບີໂທລະສັບ +856 20 5555 5555
        </p>
        <!-- OTP Input -->
        <div class="flex justify-center gap-2">
          <template v-for="i in 6" :key="i">
            <UiInput
              :ref="(el) => setOtpInputRef(el, i - 1)"
              v-model="otpValue[i - 1]"
              class="w-12 h-12 text-center text-xl"
              :maxlength="1"
              type="text"
              pattern="[0-9]*"
              inputmode="numeric"
              @input="(value) => handleOtpInput(value, i - 1)"
              @keydown="(event) => handleOtpKeydown(event, i - 1)"
              @paste="handlePaste"
            />
          </template>
        </div>
      </div>

      <div class="text-center mt-4">
        <p class="text-sm text-gray-500">
          ບໍ່ໄດ້ຮັບລະຫັດ?
          <a-button type="link" class="p-0" @click="handleResendOtp">ສົ່ງອີກຄັ້ງ</a-button>
        </p>
      </div>
    </div>
    <template #footer>
      <div class="flex">
        <UiButton @click="submitOtp" type="primary" :loading="confirmLoading" color-class="w-full"
          >ຢືນຢັນ</UiButton
        >
      </div>
    </template>
  </UiModal>
  <!-- OTP -->
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
</template>

<script setup lang="ts">
import type { ButtonType } from "@/modules/shared/buttonType";
import { computed, nextTick, onMounted, ref } from "vue";
import { columnsDetails } from "../../views/approval-department/column/columnDetails";
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
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import ShowShop from "./ShowShop.vue";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { formatDate } from "@/modules/shared/formatdate";
import { useToggleStore } from "../../stores/storage.store";
import { storeToRefs } from "pinia";
import { useApprovalStepStore } from "../../stores/approval-step.store";
import { useDocumentStatusStore } from "../../stores/document-status.store";
import type { SubmitApprovalStepInterface } from "@/modules/interfaces/approval-step.interface";
// import OtpModal from "../purchase-requests/modal/OtpModal.vue";

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

const getTotalVat = computed(() => {
  if (!orderDetails.value?.getPurchaseOrderItem()) return 0;
  return orderDetails.value.getPurchaseOrderItem().reduce((sum, item) => {
    return sum + (item.getIsVat() ? item.getVatTotal() : 0);
  }, 0);
});

const getTotalWithVat = computed(() => {
  if (!orderDetails.value?.getPurchaseOrderItem()) return 0;
  return orderDetails.value.getPurchaseOrderItem().reduce((sum, item) => {
    return sum + item.getTotalWithVat();
  }, 0);
});

const hasVat = computed(() => {
  if (!orderDetails.value?.getPurchaseOrderItem()) return false;
  return orderDetails.value.getPurchaseOrderItem().some((item) => item.getIsVat());
});

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

const submitOtp = async () => {
  const otpString = otpValue.value.join("");
  if (otpString.length !== 6) {
    error("ເກີດຂໍ້ຜິດພາດ", "ກະລຸນາປ້ອນ OTP ໃຫ້ຄົບ 6 ຫຼັກ");
    return;
  }
  await handleOtpConfirm(otpString);
};

const handleResendOtp = async () => {
  if (!currentApprovalStep.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນຂັ້ນຕອນການອະນຸມັດ");
    return;
  }

  try {
    const result = await approvalStepStore.sendOtp(currentApprovalStep.value.id);
    if (result) {
      success("ສຳເລັດ", "ສົ່ງລະຫັດ OTP ໃໝ່ສຳເລັດ");
      otpValue.value = Array(6).fill("");
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

const currentApprovalStep = computed(() => {
  return approvalSteps.value.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (step: any) =>
      step.status_id === 1 && // PENDING
      !step.approver &&
      step.step_number === (getPreviousApprovedStep.value?.step_number ?? 0) + 1
  );
});

const getPreviousApprovedStep = computed(() => {
  return [...approvalSteps.value]
    .filter((step) => step.status_id === 2) // APPROVED
    .sort((a, b) => b.step_number - a.step_number)[0];
});

const canApprove = computed(() => {
  const currentStep = currentApprovalStep.value;
  const previousStep = getPreviousApprovedStep.value;

  if (!currentStep) return false;
  if (currentStep.step_number === 1) return true;

  return (
    previousStep &&
    previousStep.status_id === 2 &&
    previousStep.step_number === currentStep.step_number - 1
  );
});
// Custom buttons for header
const customButtons = computed(() => {
  if (isApproved.value) {
    // ถ้าอนุมัติแล้ว แสดงเฉพาะปุ่ม print
    return [
      {
        label: "print",
        icon: "ant-design:printer-outlined",
        class: "bg-white flex items-center gap-2 hover:bg-gray-100",
        type: "default" as ButtonType,
        onClick: () => {
          handlePrint();
        },
      },
    ];
  }
  if (!canApprove.value) {
    return [];
  }

  const currentStep = currentApprovalStep.value;
  if (!currentStep) return [];
  return [
    {
      label: "print",
      icon: "ant-design:printer-outlined",
      class: "bg-white flex items-center gap-2 hover:bg-gray-100",
      type: "default" as ButtonType,
      onClick: () => {
        isRejectModalVisible.value = true;
      },
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
const otpValue = ref<string[]>(Array(6).fill(""));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const otpInputRefs = ref<any[]>([]);
const isOtpModalVisible = ref(false);
const isSignatureModalVisible = ref(false);
const isSuccessModalVisible = ref(false);
const signatureData = ref("");
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
  if (
    orderDetails.value &&
    orderDetails.value.getPurchaseOrderItem &&
    orderDetails.value.getPurchaseOrderItem().length > 0
  ) {
    return orderDetails.value.getPurchaseOrderItem()[0].getQuantity();
  }

  return orderDetails.value?.getPurchaseRequest()?.purchase_request_item?.[0]?.quantity || 2;
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
      purchase_order_items: [],
      files: [],
    };
    const documentId = route.params.id as string;
    const success = await approvalStepStore.submitApprovalDepartMent(documentId, payload);

    if (success) {
      isOtpModalVisible.value = false;
      isSuccessModalVisible.value = true;
      isApproved.value = true; // อัพเดทสถานะการอนุมัติ
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
    const purchaseOrderItems = orderDetails.value.getPurchaseOrderItem().map((item) => ({
      id: Number(item.getId()),
      budget_item_id: Number(item.getBudgetItemId() || 1),
    }));
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
        purchase_order_items: purchaseOrderItems,
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
    router.push({ name: "approval-department-panak" });
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
// OTP
const handleOtpInput = (value: string, index: number) => {
  const numericValue = value.replace(/[^0-9]/g, "");
  if (numericValue) {
    otpValue.value[index] = numericValue[0];
    if (index < 5) {
      nextTick(() => {
        const nextInput = otpInputRefs.value[index + 1];
        if (nextInput) {
          const inputElement = nextInput.$el.querySelector("input") || nextInput.$el;
          inputElement?.focus();
        }
      });
    }
  } else {
    otpValue.value[index] = "";
  }
};

//************************************* */
const handleOtpKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === "Backspace" && !otpValue.value[index]) {
    event.preventDefault();
    // ย้ายไป input ก่อนหน้า
    if (index > 0) {
      nextTick(() => {
        const prevInput = otpInputRefs.value[index - 1];
        if (prevInput) {
          const inputElement = prevInput.$el.querySelector("input") || prevInput.$el;
          inputElement?.focus();
          // เคลียร์ค่าของ input ก่อนหน้า
          otpValue.value[index - 1] = "";
        }
      });
    }
  }
  if (
    !/^\d$/.test(event.key) &&
    !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(event.key)
  ) {
    event.preventDefault();
  }
};

/********************************************************** */
const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData("text").replace(/[^0-9]/g, "");
  if (pastedData) {
    const digits = pastedData.split("").slice(0, 6);
    digits.forEach((digit, index) => {
      if (index < 6) {
        otpValue.value[index] = digit;
      }
    });
    const nextIndex = Math.min(digits.length, 5);
    nextTick(() => {
      const nextInput = otpInputRefs.value[nextIndex];
      if (nextInput) {
        const inputElement = nextInput.$el.querySelector("input") || nextInput.$el;
        inputElement?.focus();
      }
    });
  }
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
    success("ການຢືນຢັນສຳເລັດ");
    // currentStep.value = 1;
    showApprovalSuccess.value = true;
  } catch (err) {
    console.error(err);
    error("ການຢືນຢັນລາຍເຊັນລົ້ມເຫລວ");
  } finally {
    confirmLoading.value = false;
  }
};

/******************************************************* */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setOtpInputRef = (el: any, index: number) => {
  if (el) {
    otpInputRefs.value[index] = el;
  }
};

/********************************** */
const handleModalCancel = () => {
  isOtpModalVisible.value = false;
  isSignatureModalVisible.value = false;
  isSuccessModalVisible.value = false;
  otpValue.value = Array(6).fill("");
  signatureData.value = "";
};
</script>
