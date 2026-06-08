// In your Vue component - updated script setup section

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { computed, onMounted, ref } from "vue";
import { columnTitle } from "./column";
import { usePurchaseOrderStore } from "../../../../stores/purchase_requests/purchase-order";
import type { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { numberToLaoWords } from "@/modules/shared/utils/read-number-lao";
import { Icon } from "@iconify/vue";
import type { ISelectVendor } from "@/modules/application/dtos/receipt.dto";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import VendorDrawer from "./VendorDrawer.vue";

// Import the print helper
const purchaseOrderStore = usePurchaseOrderStore();
const orderDetails = ref<PurchaseOrderEntity | null>(null);
const dataVendor = ref<ISelectVendor | null>(null);
const openVendor = ref(false);
const previewVisible = ref(false);
const previewUrl = ref("");
const previewTitle = ref("");
  const { error } = useNotification();
const { t } = useI18n();
const props = defineProps<{
  id: number | null;
}>();
const fetchOrderDetails = async () => {
    const result = await purchaseOrderStore.fetchById(Number(props.id));
    if (result) {
      orderDetails.value = result;
    } else {
      error("ບໍ່ພົບຂໍ້ມູນເອກະສານ");
    }
};
const vendorInfo = (data: ISelectVendor) => {
  dataVendor.value = data;
  openVendor.value = true;
};

const isPdfUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return url.includes("po_file_name/") || url.toLowerCase().endsWith(".pdf");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const openProposalPreview = (record: any) => {
  const url: string | null = record?.getQuotationImageUrl?.() ?? null;
  if (!url) return;
  previewUrl.value = url;
  previewTitle.value =
    record?.purchase_request_item?.title || "ໃບສະເໜີ";
  previewVisible.value = true;
};

const previewIsPdf = computed(() => isPdfUrl(previewUrl.value));
// Append PDF viewer hints so the embedded view starts at fit-to-width
// without toolbar clutter. Harmless on non-PDF URLs but only used when isPdf.
const pdfEmbedSrc = computed(() =>
  previewUrl.value
    ? `${previewUrl.value}#toolbar=1&navpanes=0&view=FitH`
    : ""
);

onMounted( async () => {
  await fetchOrderDetails();
});
</script>

<template>
  <div class="container mx-auto py-0 px-0 -mt-2">
    <div class="user-info shadow-sm py-2">
        <h2 class="text-md font-semibold px-6 mb-4">ຂໍ້ມູນສ້າງໃບອະນຸມັດຈັດຊື້ {{ props.id }}</h2>
        <div class="info flex items-center px-6 gap-4 mb-4">
          <div
              class="flex items-center justify-center **w-16 h-16** rounded-full **bg-blue-100** **text-4xl**"
            >
              <Icon icon="mdi:user" class="text-6xl" />
            </div>
          <div class="detail -space-y-2">
            <p class="font-medium">{{ orderDetails?.getRequester().username }}</p>
            <p class="text-gray-500 text-sm">{{ orderDetails?.getDepartment().name }}, {{ orderDetails?.getPosition()[0].name }}</p>
          </div>
        </div>
        <!-- <div class="title md:w-[40rem] -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">ສະເໜີ</h2>
          <a-table
          :columns="columnsTitle(t)"
          :dataSource="orderDetails?.getPurchaseOrderItem()"
          :pagination="false"
          >
            <template #bodyCell="{ column }">
              <template v-if="column.key === 'department'">
                <span>{{ orderDetails?.getDepartment().name }}</span>
              </template>
              <template v-if="column.key === 'work'">
                <span>{{ orderDetails?.getPosition()[0].name  }}</span>
              </template>
            </template>
        </a-table>
        </div> -->

        <div class="purposes -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.purposes") }}</h2>
          <p class="text-gray-600 text-sm pl-4">
            {{ orderDetails?.getPurposes() }}
          </p>
        </div>
        <div class="table -space-y-0 mb-2 w-full px-3 sm:px-4 lg:px-6 shadow-sm rounded-md overflow-x-auto">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.title") }}</h2>
          <a-table
            :columns="columnTitle(t)"
            :dataSource="orderDetails?.getPurchaseOrderItem() ?? []"
            :pagination="false"
            row-key="id"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'id'">
                <span>{{ index + 1}}</span>
              </template>
                <template v-if="column.key === 'image'">
              <span>
                <!-- PDF: open in an embedded preview modal -->
                <button
                  v-if="isPdfUrl(record.getQuotationImageUrl())"
                  type="button"
                  class="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                  @click="openProposalPreview(record)"
                >
                  <Icon icon="material-symbols:lab-profile-outline-rounded" class="text-red-600 text-2xl" />
                  <span class="text-xs text-red-700 font-medium">ເບິງຂໍ້ມູນໃບສະເໜີ</span>
                </button>
                <!-- Image preview -->
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
              <template v-if="column.key === 'unit'">
                <span>{{ record.purchase_request_item.unit.name }}</span>
              </template>
              <template v-if="column.key === 'price_per_unit'">
                <span>₭ {{ formatPrice(record.price) }}</span>
              </template>
              <template v-if="column.key === 'amount'">
                <span>₭ {{ formatPrice(record.total) }}</span>
              </template>
              <template v-if="column.key === 'price_in_words'">
                <span>{{ numberToLaoWords(Number(record?.total)) }}</span>
              </template>
              <template v-if="column.key === 'vendor'">
              <span
                @click="
                  vendorInfo(record.getSelectedVendor())
                "
                class="cursor-pointer text-red-600 hover:text-red-800"
                >ເບິ່ງຮ້ານຄ້າ</span
              >
            </template>
            </template>
          </a-table>
          <div class="total flex justify-end gap-1 text-14 mr-10 text-gray-600">
          <div class="lable flex flex-col items-end mt-4 font-medium">
            <p class="text-sky-500">{{t('receipt.total.sub_total')}}</p>
            <p class="-mt-3 text-orange-500">{{t('receipt.total.vat')}}</p>
            <p class="-mt-3 text-red-500">{{t('receipt.total.total')}}</p>
          </div>
          <div class="lable mt-4">
            <p class="text-sky-500">:</p>
            <p class="-mt-3 text-orange-500">:</p>
            <p class="-mt-3 text-red-500">:</p>
          </div>
          <div class="lable mt-4">
            <p class="text-sky-500">{{ formatPrice(orderDetails?.getSubTotal() || 0) }} LAK</p>
            <p class="-mt-3 text-orange-500"> {{ formatPrice(orderDetails?.getVat() || 0) }} LAK</p>
            <p class="-mt-3 text-red-500">{{ formatPrice(orderDetails?.getTotal() || 0) }} LAK</p>
          </div>
        </div>
        </div>
        <!-- image and signature  -->
        <!-- <div v-for="(vendor , index) in orderDetails?.getPurchaseOrderItem()" :key="index" class="image space-y-4 py-4 shadow-sm px-6 rounded-md">
          <h2 class="text-md font-semibold">ວິເຄາະການຈັດຊື້</h2>
          <div class="grid grid-cols-1 md:grid-cols-1 gap-2 text-sm">
          <div class="flex items-center gap-2">
            <label class="w-40 text-gray-700">ຮ້ານທີ່ເລືອກ:</label>
            <span class="text-gray-700">{{ vendor.getSelectedVendor()?.getVendor()?.name }}</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="w-40 text-gray-700">ທະນາຄານ:</label>
            <span class="text-gray-700"
              >{{vendor.getSelectedVendor()?.getVendorBankAccount()?.bank?.name}}</span
            >
          </div>
          <div class="flex items-center gap-2">
            <label class="w-40 text-gray-700">ຊື່ບັນຊີ:</label>
            <span class="text-gray-700">{{vendor.getSelectedVendor()?.getVendorBankAccount()?.account_name}}</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="w-40 text-gray-700">ເລກບັນຊີ ({{vendor.getSelectedVendor()?.getVendorBankAccount()?.currency?.code}}):</label>
            <span class="text-gray-700">{{vendor.getSelectedVendor()?.getVendorBankAccount()?.account_number}}</span>
          </div>
        </div>
        </div> -->

         <!-- Signature Section -->
      <h2 class="text-md ml-3 mt-4 font-semibold">
        {{ t("purchase-rq.signature") }}
      </h2>
      <div
        class="signature flex flex-wrap items-center justif-start gap-[3rem] shadow-sm px-0 rounded-md pb-4"
      >
        <div
          v-for="(step, index) in [
            ...(orderDetails?.getUserApproval()?.approval_step || []),
          ].sort((a, b) => a.step_number - b.step_number)"
          :key="index"
          class="signature-approver text-center"
        >
          <p v-if="step.doc_approver" class="text-slate-500 text-sm font-bold">
            {{ index === 0 ? "ຜູ້ສ້າງ" : step?.doc_approver[0].department?.name ?? 'ຜູ້ອຳນວຍການ' }}
            <!-- {{ index === 0 ? "ຜູ້ສ້າງ" : t("purchase-rq.approver") + ' ' + (step.step_number) }} -->
          </p>

          <a-image
            v-if="step.approver?.user_signature?.signature_url"
            :src="step.approver?.user_signature?.signature_url"
            alt="signature"
            :width="120"
            :height="60"
            :preview="false"
          />
          <div
            v-else
            class="w-[120px] h-[80px] border border-slate-100 flex items-center justify-center text-xs text-slate-400"
          >
            <!-- No Signature -->
          </div>

          <div class="info text-sm text-slate-600 space-y-1 mt-4">
            <p>{{ step.approver?.username || "-" }}</p>
            <p>{{ step.position?.name || "-" }}</p>
            <p>{{ step?.approved_at || "-" }}</p>
          </div>
        </div>
      </div>
      </div>
  </div>
   <UiDrawer
    v-model:open="openVendor"
    :title="`ຂໍ້ມູນຮ້ານຄ້າ`"
    placement="right"
    :width="470"
  >
    <VendorDrawer :data="dataVendor" />
  </UiDrawer>

  <UiModal
    :title="previewTitle || 'ໃບສະເໜີ'"
    title-icon="material-symbols:lab-profile-outline-rounded"
    :visible="previewVisible"
    :width="980"
    @update:visible="previewVisible = $event"
    @cancel="previewVisible = false"
  >
    <div class="proposal-preview">
      <iframe
        v-if="previewIsPdf"
        :src="pdfEmbedSrc"
        class="proposal-frame"
        frameborder="0"
      ></iframe>
      <img
        v-else-if="previewUrl"
        :src="previewUrl"
        :alt="previewTitle"
        class="proposal-img"
      />
      <div v-else class="text-center text-slate-400 py-10">ບໍ່ມີຂໍ້ມູນ</div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <a
          v-if="previewUrl"
          :href="previewUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-md"
        >ເປີດໃນແທັບໃໝ່</a>
        <button
          type="button"
          class="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
          @click="previewVisible = false"
        >ປິດ</button>
      </div>
    </template>
  </UiModal>
</template>
<style scoped>
::v-deep(.title .ant-table-thead > tr > th) {
  background-color: white; /* bg-blue-400 */
  color: #1f2937;            /* text-gray-800 */
  box-shadow: none !important;
  border: none;
  padding-bottom: 1px !important;
}

::v-deep(.title .ant-table) {
  border: none !important;
}

::v-deep(.title .ant-table table) {
  border: none !important;
}

::v-deep(.title .ant-table td),
::v-deep(.title .ant-table th) {
  border: none !important;
}
::v-deep(.ant-table-tbody > tr > td) {
 padding-top: 12px;
 padding-bottom: 12px;
}

.proposal-preview {
  width: 100%;
  height: 75vh;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.proposal-frame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.proposal-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  margin: auto;
}

</style>
