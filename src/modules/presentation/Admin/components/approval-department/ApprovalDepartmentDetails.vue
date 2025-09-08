<template>
  <div class="mt-10">
    <!-- Document Details -->
    <div v-if="showApprovalSuccess">
      <ApprovalsuccessDetails />
    </div>
    <!-- Header Component -->
    <div v-else>
      <!-- Header component -->
      <div
        class="fixed px-6 py-4 top-0 z-40 h-auto bg-white shadow-sm transition-all duration-150 mt-[4rem]"
        :class="topbarStyle"
      >
        <header-component
          header-title="ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ"
          :breadcrumb-items="['ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ', 'ອານຸມັດ']"
          document-prefix="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ"
          :document-number="orderDetails?.getPoNumber() || 'PO-13B786'"
          :document-date="formatDate(orderDetails?.getCreatedAt() || '2025-03-26')"
          :action-buttons="customButtons"
          document-status="ລໍຖ້າຫົວໜ້າພະແນກບໍລິຫານກວດສອບ"
          document-status-class="text-orange-500 font-medium ml-2 bg-orange-50 px-3 py-1 rounded-full"
        />
      </div>

      <!-- Main Content -->
      <div class="bg-white rounded-lg shadow-sm p-6 mt-40">
        <h2>ຂໍ້ມູນສ້າງໃບອານຸມັດຈັດຊື້ - ຈັດຈ້າງ</h2>
        <!-- Requester Information -->
        <div class="flex items-start gap-4 mb-2">
          <img
            :src="documentDetails.requester.avatar"
            alt="Requester Avatar"
            class="w-14 h-14 rounded-full mb-2"
          />
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
          <h4>ສະເໜີ</h4>
          <div class="grid grid-cols-4">
            <div class="grid grid-rows-2">
              <h5>ຂໍ້ສະເໜີເບີກງົບປະມານ</h5>
              <span class="text-sm">{{
                orderDetails?.getPurchaseRequest()?.purchase_request_item[0]?.title ||
                "ສະເໜີຊື້ອຸປະກອນຄອມພິວເຕີ"
              }}</span>
            </div>
            <div class="grid grid-rows-2">
              <h5>ຈຳນວນ</h5>
              <span class="text-sm">
                {{ getPurchaseOrderQuantity || 2 }}
              </span>
            </div>
            <div class="grid grid-rows-2">
              <h5>ພະແນກ</h5>
              <span class="text-sm">{{ orderDetails?.getDepartment()?.name || "ພະແນກໄອທີ" }}</span>
            </div>
            <div class="grid grid-rows-2">
              <h5>ໜ່ວຍງານ</h5>
              <span class="text-sm">{{
                orderDetails?.getPosition()?.[0]?.name || "ຝ່າຍພັດທະນາລະບົບ"
              }}</span>
            </div>
          </div>
        </div>

        <!-- Purpose -->
        <div class="mb-6">
          <h4 class="text-base font-semibold mb-2">ຈຸດປະສົງ ແລະ ລາຍການ</h4>
          <p class="text-gray-600">
            {{ getPurchaseOrderRemark || "ທົດລອງລະບົບບັນທຶກ" }}
          </p>
        </div>

        <!-- Items Table -->
        <div class="mb-6">
          <h4 class="text-base font-semibold mb-2">ລາຍການ</h4>
          <Table :columns="columnsDetails(t)" :dataSource="getItemsForTable">
            <template #index="{ index }">
              <span>{{ index + 1 }}</span>
            </template>
            <template #title="{ record }">
              <span>{{ record.title }}</span>
            </template>
          </Table>
          <div>
            <p class="text-gray-500 mt-2 flex justify-end">
              {{ t("purchase_qequest.table.total") }}:
              <span class="font-semibold"> {{ formatPrice(getTotalAmount) }} ₭ </span>
            </p>
          </div>
        </div>

        <div class="mb-6">
          <h4 class="text-base font-semibold mb-2">ໃບສະເໜີລາຄາ</h4>
          <div class="border rounded-lg p-4">
            <!-- แสดงข้อมูลใบเสนอราคา -->
            <div
              v-if="
                orderDetails &&
                orderDetails.getPurchaseOrderItem() &&
                orderDetails.getPurchaseOrderItem().length > 0
              "
            >
              <div v-for="(item, index) in orderDetails.getPurchaseOrderItem()" :key="index">
                <!-- รูปภาพใบเสนอราคา -->
                <img
                  v-if="item.getQuotationImageUrl()"
                  :src="item.getQuotationImageUrl() ?? undefined"
                  alt="ໃບສະເໜີລາຄາ"
                  class="max-w-md rounded-lg mb-4"
                />
                <img
                  v-else
                  src="/public/5.png"
                  alt="ໃບສະເໜີລາຄາ"
                  class="max-w-md rounded-lg mb-4"
                />

                <!-- ข้อมูลรายละเอียด -->
                <div class="grid grid-cols-2 gap-2 mb-4">
                  <div class="font-medium">ລາຍການ:</div>
                  <div class="text-gray-600">{{ item.getRemark() }}</div>

                  <div class="font-medium">ຈຳນວນ:</div>
                  <div class="text-gray-600">{{ item.getQuantity() }} ລາຍການ</div>

                  <div class="font-medium">ລາຄາຕໍ່ຫົວໜ່ວຍ:</div>
                  <div class="text-gray-600">{{ formatPrice(item.getPrice()) }} ₭</div>

                  <div class="font-medium">ລາຄາລວມ:</div>
                  <div class="text-gray-600">{{ formatPrice(item.getTotal()) }} ₭</div>

                  <div class="font-medium">ພາສີມູນຄ່າເພີ່ມ (VAT):</div>
                  <div class="text-gray-600">
                    {{ item.getIsVat() ? `${formatPrice(item.getVatTotal())} ₭` : "ບໍ່ມີ" }}
                  </div>

                  <div class="font-medium">ລາຄາລວມທັງໝົດ:</div>
                  <div class="text-gray-600 font-bold">
                    {{ formatPrice(item.getTotalWithVat()) }} ₭
                  </div>

                  <div class="font-medium">ຜູ້ຂາຍ:</div>
                  <div class="text-gray-600">{{ item.getVendorName() }}</div>

                  <div class="font-medium">ຂໍ້ມູນຕິດຕໍ່:</div>
                  <div class="text-gray-600">{{ item.getVendorContactInfo() }}</div>
                </div>
              </div>
            </div>
            <div v-else>
              <img src="/public/5.png" alt="ໃບສະເໜີລາຄາ" class="max-w-md rounded-lg" />
              <p class="text-gray-500 mt-2">ບໍ່ມີໃບສະເໜີລາຄາ</p>
            </div>
          </div>
        </div>

        <!-- ຂໍ້ມູນບັນຊີທະນາຄານ -->
        <div class="mb-6">
          <h4 class="text-base font-semibold mb-4">ຂໍ້ມູນບັນຊີຮ້ານ</h4>
          <div
            v-if="
              orderDetails &&
              orderDetails.getPurchaseOrderItem() &&
              orderDetails.getPurchaseOrderItem().length > 0
            "
          >
            <!-- ข้อมูลธนาคารจาก API -->
            <div class="grid grid-cols-2 mb-2">
              <span class="font-medium">ທະນາຄານ:</span>
              <span class="text-gray-600 flex items-center gap-2">
                <img
                  :src="
                    orderDetails.getPurchaseOrderItem()[0].getBankLogo() || '/public/bclone.png'
                  "
                  class="w-8 h-8"
                  alt="ໂລໂກ້ທະນາຄານ"
                />
                <span>{{ orderDetails.getPurchaseOrderItem()[0].getBankName() }}</span>
              </span>
            </div>
            <div class="grid grid-cols-2 mb-2">
              <span class="font-medium">ຊື່ບັນຊີ:</span>
              <span class="text-gray-600">{{
                orderDetails.getPurchaseOrderItem()[0].getAccountName()
              }}</span>
            </div>
            <div class="grid grid-cols-2">
              <span class="font-medium"
                >ເລກບັນຊີ {{ orderDetails.getPurchaseOrderItem()[0].getCurrencyCode() }}:</span
              >
              <span class="text-gray-600">{{
                orderDetails.getPurchaseOrderItem()[0].getAccountNumber()
              }}</span>
            </div>
          </div>
          <div v-else>
            <!-- ข้อมูลธนาคารสำรอง -->
            <div class="grid grid-cols-2 mb-2">
              <span class="font-medium">ທະນາຄານ:</span>
              <span class="text-gray-600 flex items-center gap-2">
                <img src="/public/bclone.png" class="w-8 h-8" alt="ໂລໂກ້ທະນາຄານ" />
                <span>BCEL One ທະນາຄານການຄ້າຕ່າງປະເທດລາວ</span>
              </span>
            </div>
            <div class="grid grid-cols-2 mb-2">
              <span class="font-medium">ຊື່ບັນຊີ:</span>
              <span class="text-gray-600">KHAMTHANOM MALAYSIN MR</span>
            </div>
            <div class="grid grid-cols-2">
              <span class="font-medium">ເລກບັນຊີ LAK:</span>
              <span class="text-gray-600">0302000410086756</span>
            </div>
          </div>
        </div>

        <!-- Signatures -->
        <div class="grid grid-cols-2 gap-6">
          <h4 class="text-base font-semibold mb-4 col-span-2">ລາຍເຊັ່ນ</h4>
          <div v-for="(sig, index) in signatures" :key="index">
            <p class="font-semibold mb-2">{{ sig.role }}</p>
            <img :src="sig.signature" :alt="`${sig.role} signature`" class="h-16 mb-2" />
            <p class="font-semibold">{{ sig.name }}</p>
            <p class="text-gray-600">{{ sig.position }}</p>
          </div>
        </div>
        <div>
          <span>ເອກະສານທີຕິດຂັດ</span>
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
    @ok="handleReject"
  >
    <div class="space-y-4">
      <p>ໃສ່ເຫດຜົນໃນການປະຕິເສດ</p>
      <div>
        <p class="mb-2 font-semibold">ເຫດຜົນ</p>
        <Textarea :modelValue="rejectReason" placeholder="ປ້ອນເຫດຜົນ" :rows="4" />
      </div>
    </div>
    <template #footer>
      <UiButton @click="handleReject" type="primary" :loading="confirmLoading" color-class="w-full"
        >ຢືນຢັນ</UiButton
      >
    </template>
  </UiModal>
  <UiDrawer
    v-model:open="visible"
    title="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ - ເລກທີ 0044/ຈຊນ.ນວ/ບຫ - ວັນທີ 26 ມີນາ 2025"
    placement="right"
    :width="1050"
  >
    <PurchaseOrderShowDrawer />
  </UiDrawer>
</template>

<script setup lang="ts">
import type { ButtonType } from "@/modules/shared/buttonType";
import { computed, nextTick, onMounted, ref } from "vue";
import { columnsDetails } from "../../views/approval-department/column/columnDetails";
import { useI18n } from "vue-i18n";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { Icon } from "@iconify/vue";
import { usePurchaseOrderStore } from "@/modules/presentation/Admin/stores/purchase_requests/purchase-order";
import { useRoute } from "vue-router";
import { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import Table from "@/common/shared/components/table/Table.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import PurchaseOrderShowDrawer from "../purchase/purchase_orders/PurchaseOrderShowDrawer.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import ApprovalsuccessDetails from "./ApprovalsuccessDetails.vue";
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
const orderId = ref<number>(parseInt(route.params.id as string, 10));
const { t } = useI18n();
const { success, error } = useNotification();
const isApproveModalVisible = ref(false);
const isRejectModalVisible = ref(false);
const rejectReason = ref("");
const confirmLoading = ref(false);
const visible = ref(false);
const showDrawer = () => {
  visible.value = true;
};
/**************control header****************** */
const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);
const topbarStyle = computed(() => {
  return toggle.value ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full";
});
/**************control header****************** */

/*********************Check State OTP**************************** */
const documentStatusStore = useDocumentStatusStore();
// const requiresOtp = ref(false);
const modalAction = ref("");
// const approvalId = ref<number | null>(null);

const approvedStatusId = computed(() => {
  return documentStatusStore.document_Status.find((s) => s.getName() === "APPROVED")?.getId();
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
  } catch (err : unknown) {
   console.error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດສົ່ງລະຫັດ OTP ໄດ້", err);
  }
};
/*********************Check State OTP**************************** */

/*********************check show button to data ********************* */
const approvalSteps = computed(() => orderDetails.value?.getUserApproval()?.approval_step ?? []);
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

  // ถ้าเป็น step แรก
  if (currentStep.step_number === 1) return true;

  return (
    previousStep &&
    previousStep.status_id === 2 &&
    previousStep.step_number === currentStep.step_number - 1
  );
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
const getItemsForTable = computed(() => {
  if (
    orderDetails.value &&
    orderDetails.value.getPurchaseOrderItem &&
    orderDetails.value.getPurchaseOrderItem().length > 0
  ) {
    return orderDetails.value.getPurchaseOrderItem().map((item) => ({
      id: item.getId(),
      title: item.getPurchaseRequestItem()?.getTitle(),
      remark: item.getRemark(),
      quantity: item.getQuantity(),
      price: formatPrice(item.getPrice()),
      total: item.getTotal(),
      is_vat: item.getIsVat(),
      vat_total: item.getVatTotal(),
      total_with_vat: item.getTotalWithVat(),
    }));
  }
  return orderDetails.value?.getItems() ?? [];
});
const getTotalAmount = computed(() => {
  if (
    orderDetails.value &&
    orderDetails.value.getPurchaseOrderItem &&
    orderDetails.value.getPurchaseOrderItem().length > 0
  ) {
    return orderDetails.value.getPurchaseOrderItem().reduce((total, item) => {
      return total + item.getTotalWithVat();
    }, 0);
  }
  return (
    orderDetails.value?.getPurchaseRequest()?.purchase_request_item?.[0]?.total_price ||
    orderDetails.value?.getTotalWithVAT() ||
    22000000
  );
});

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

const items = computed(() => orderDetails.value?.getItems() ?? []);
console.log("Items:", items.value);

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

      console.log("Purchase order items:", result.getPurchaseOrderItem());
      console.log("Order details fetched:", result);
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

// Custom buttons for header
const customButtons = computed(() => {
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
    }
    const payload = {
      type: "po" as const,
      statusId: Number(approvedStatusId.value), // ใช้ค่าจาก store
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
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error in handleApprove:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
    return false;
  }
};

// Handle reject
const handleReject = async () => {
  try {
    if (!rejectReason.value.trim()) {
      return;
    }
    confirmLoading.value = true;
    // Your reject logic here
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    isRejectModalVisible.value = false;
    rejectReason.value = "";
  } finally {
    confirmLoading.value = false;
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

// Signatures
const signatures = [
  {
    role: "ຜູ້ສະເໜີ",
    name: "ພົມມະກອນ ຄວາມຄູ",
    position: "ພະນັກງານພັດທະນາລະບົບ",
    signature: "/public/2.png",
  },
];

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
    // โฟกัสที่ช่องถัดจากตัวเลขสุดท้ายที่วาง
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
    isSignatureModalVisible.value = false; // ปิด Modal ลายเซ็น
    isSuccessModalVisible.value = true; // เปิด Modal สำเร็จ
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
