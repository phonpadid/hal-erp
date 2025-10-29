<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed } from "vue";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { useI18n } from "vue-i18n";
import { formatDate } from "@/modules/shared/formatdate";

const { t } = useI18n();

const props = defineProps<{
  purchaseOrder: any;
}>();

// ✅ ใช้ purchase_order_item จาก JSON
const items = computed(() => props.purchaseOrder?.purchase_order_item ?? []);
const totalAmount = computed(() => props.purchaseOrder?.total ?? 0);
const subTotal = computed(() => props.purchaseOrder?.sub_total ?? 0);
const vat = computed(() => props.purchaseOrder?.vat ?? 0);

// ✅ Approval Steps
const approvalSteps = computed(() => {
  const steps = props.purchaseOrder?.user_approval?.approval_step ?? [];
  return [...steps]
    .filter((step) => step.step_number !== 0)
    .sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0));
});

// ✅ Requester Step (step_number === 0)
const requesterStep = computed(() => {
  const steps = props.purchaseOrder?.user_approval?.approval_step ?? [];
  return steps.find((step: any) => step.step_number === 0);
});

// ✅ Shop Information (จาก selected_vendor)
const shopInfo = computed(() => {
  const firstItem = items.value[0];
  if (!firstItem?.selected_vendor?.length) return null;
  
  const selectedVendor = firstItem.selected_vendor.find((v: any) => v.selected === true);
  return selectedVendor || firstItem.selected_vendor[0];
});
</script>

<template>
  <div class="print-container">
    <div class="po-document">
      <!-- Header -->
      <div class="header">
        <h1 class="title">ໃບສັ່ງຊື້ - PURCHASE ORDER</h1>
        <p class="doc-number">{{ purchaseOrder?.po_number }}</p>
      </div>

      <!-- Staff Information -->
      <table class="info-table">
        <tr>
          <td class="label">Staff Name<br />ຊື່ພະນັກງານ:</td>
          <!-- ✅ ใช้จาก document.requester -->
          <td class="value">{{ purchaseOrder?.document?.requester?.username }}</td>
          <td class="label">Position<br />ຕຳແໜ່ງ:</td>
          <!-- ✅ ใช้จาก document.position[0] -->
          <td class="value">{{ purchaseOrder?.document?.position?.[0]?.name }}</td>
          <td class="label">Department<br />ພະແນກ:</td>
          <!-- ✅ ใช้จาก document.department -->
          <td class="value">{{ purchaseOrder?.document?.department?.name }}</td>
        </tr>
        <tr>
          <td class="label">Order Date<br />ວັນທີສັ່ງຊື້:</td>
          <!-- ✅ ใช้ order_date -->
          <td class="value">{{ formatDate(purchaseOrder?.order_date) }}</td>
          <td class="label">Delivery Date<br />ວັນທີສົ່ງ:</td>
          <!-- ✅ ใช้ expired_date -->
          <td class="value">{{ formatDate(purchaseOrder?.expired_date) }}</td>
          <td class="label">PO No./ເລກທີ:</td>
          <td class="value">{{ purchaseOrder?.po_number }}</td>
        </tr>
      </table>

      <!-- Shop Information -->
      <div class="shop-section" v-if="shopInfo">
        <div class="section-label">Supplier Information/ຂໍ້ມູນຜູ້ສະໜອງ</div>
        <table class="shop-info-table">
          <tr>
            <td class="label">Shop Name<br />ຊື່ຮ້ານ:</td>
            <!-- ✅ ຮ້ານຄອມຄອມ -->
            <td class="value">{{ shopInfo?.vendor?.name }}</td>
            <td class="label">Contact<br />ເບີໂທ:</td>
            <!-- ✅ 2099999993 -->
            <td class="value">{{ shopInfo?.vendor?.contact_info }}</td>
          </tr>
          <tr>
            <td class="label">Bank Info<br />ຂໍ້ມູນທະນາຄານ:</td>
            <td class="value" colspan="3">
              {{ shopInfo?.vendor_bank_account?.bank?.name }} - 
              {{ shopInfo?.vendor_bank_account?.account_number }}
              ({{ shopInfo?.vendor_bank_account?.account_name }})
            </td>
          </tr>
        </table>
      </div>

      <!-- Purpose -->
      <div class="purpose-section">
        <div class="section-label">Purposes/ຈຸດປະສົງ:</div>
        <div class="purpose-content">
          {{ purchaseOrder?.purposes || "----" }}
        </div>
      </div>

      <!-- Budget Information -->
      <div class="budget-section" v-if="items[0]?.budget_item">
        <div class="budget-row">
          <span class="section-label">Budget Topic/ຫົວຂໍ້ງົບປະມານ:</span>
          <!-- ✅ ຊື້ອຸປະກອນໃຊ້ໃນຫ້ອງການ -->
          <span class="budget-value">{{ items[0]?.budget_item?.budget_account?.name }}</span>
        </div>
        <div class="budget-row">
          <span class="section-label">Budget Code/ລະຫັດເຂົ້າບັນຊີງົບປະມານ:</span>
          <!-- ✅ BA-5A9D20 -->
          <span class="budget-value">{{ items[0]?.budget_item?.budget_account?.code }}</span>
        </div>
      </div>

      <!-- Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th class="col-no">No.</th>
            <th class="col-desc">Description/ລາຍລະອຽດ</th>
            <th class="col-qty">QTY/ຈຳນວນ</th>
            <th class="col-unit">Unit/ຫົວໜ່ວຍ</th>
            <th class="col-price">Unit Price/ລາຄາ</th>
            <th class="col-total">Total/ລວມ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="item.id">
            <td class="text-center">{{ index + 1 }}</td>
            <!-- ✅ computer nome -->
            <td>{{ item.purchase_request_item?.title }}</td>
            <td class="text-center">{{ item.quantity }}</td>
            <!-- ✅ Qty -->
            <td class="text-center">{{ item.purchase_request_item?.unit?.name || "ຊີ້ນ" }}</td>
            <td class="text-right">{{ formatPrice(item.price) }}</td>
            <td class="text-right">{{ formatPrice(item.total) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="5" class="total-label">SUB TOTAL/ລວມຍ່ອຍ:</td>
            <td class="total-value">{{ formatPrice(subTotal) }} LAK</td>
          </tr>
          <tr class="total-row">
            <td colspan="5" class="total-label">VAT/ອາກອນ:</td>
            <td class="total-value">{{ formatPrice(vat) }} LAK</td>
          </tr>
          <tr class="total-row grand-total">
            <td colspan="5" class="total-label">TOTAL/ລວມທັງໝົດ:</td>
            <td class="total-value">{{ formatPrice(totalAmount) }} LAK</td>
          </tr>
        </tfoot>
      </table>

      <!-- Signature Section -->
      <table class="signature-table">
        <tr>
          <!-- ✅ ผู้สะเหนี (phoud - Purchase) -->
          <td v-if="requesterStep" class="signature-cell">
            <div class="signature-label">ສະເໜີໂດຍ</div>

            <div class="signature-space">
              <img
                v-if="requesterStep?.approver?.user_signature?.signature_url"
                :src="requesterStep.approver.user_signature.signature_url"
                alt="signature"
                class="signature-img"
              />
            </div>

            <div class="signature-name">
              {{ requesterStep?.approver?.username || "_______________" }}
            </div>
            <div class="signature-position" v-if="requesterStep?.position">
              {{ requesterStep.position.name }}
            </div>
          </td>

          <!-- ✅ ผู้อนุมัติ (phoud_head, xone, nome) -->
          <td v-for="(step, index) in approvalSteps" :key="step.id" class="signature-cell">
            <div class="signature-label">ອະນຸມັດໂດຍ {{ index + 1 }}</div>

            <div class="signature-space">
              <img
                v-if="step?.approver?.user_signature?.signature_url"
                :src="step.approver.user_signature.signature_url"
                alt="signature"
                class="signature-img"
              />
            </div>

            <div class="signature-name">
              {{ step?.approver?.username || "_______________" }}
            </div>
            <div class="signature-position" v-if="step?.position">
              {{ step.position.name }}
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style scoped>
.print-container {
  max-width: 210mm;
  margin: 0 auto;
  padding: 8px;
  background: white;
}

.po-document {
  padding: 8mm;
  font-family: "Phetsarath OT", Arial, sans-serif;
  font-size: 11pt;
}

.header {
  text-align: center;
  margin-bottom: 15px;
  border-bottom: 2px solid #000;
  padding-bottom: 10px;
}

.title {
  font-size: 16pt;
  font-weight: bold;
  margin: 0 0 5px 0;
}

.doc-number {
  font-size: 10pt;
  margin: 0;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}

.info-table td {
  border: 1px solid #000;
  padding: 5px 8px;
  font-size: 10pt;
}

.label {
  font-weight: bold;
  width: 18%;
  background: #f3f4f6;
}

.value {
  width: 15%;
}

/* Shop Section */
.shop-section {
  border: 1px solid #000;
  margin-bottom: 10px;
}

.shop-info-table {
  width: 100%;
  border-collapse: collapse;
}

.shop-info-table td {
  border: 1px solid #000;
  padding: 5px 8px;
  font-size: 10pt;
}

.shop-info-table .label {
  width: 20%;
}

.purpose-section {
  border: 1px solid #000;
  margin-bottom: 10px;
  min-height: 60px;
}

.section-label {
  background: #f3f4f6;
  padding: 5px 8px;
  font-weight: bold;
  border-bottom: 1px solid #000;
  font-size: 10pt;
}

.purpose-content {
  padding: 8px;
  font-size: 10pt;
}

.budget-section {
  margin-bottom: 10px;
}

.budget-row {
  display: flex;
  border: 1px solid #000;
  border-bottom: none;
  font-size: 10pt;
}

.budget-row:last-child {
  border-bottom: 1px solid #000;
}

.budget-row .section-label {
  width: 35%;
  border-right: 1px solid #000;
  border-bottom: none;
}

.budget-value {
  padding: 5px 8px;
  flex: 1;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
  font-size: 9.5pt;
}

.items-table th,
.items-table td {
  border: 1px solid #000;
  padding: 5px 6px;
}

.items-table th {
  background: #f3f4f6;
  font-weight: bold;
  text-align: center;
}

.col-no { width: 5%; }
.col-desc { width: 35%; }
.col-qty { width: 10%; }
.col-unit { width: 12%; }
.col-price { width: 19%; }
.col-total { width: 19%; }

.text-center { text-align: center; }
.text-right { text-align: right; }

.total-row {
  font-weight: bold;
}

.total-label {
  text-align: right;
  padding-right: 10px;
}

.total-value {
  text-align: right;
  background: #f9fafb;
}

.grand-total {
  background: #f3f4f6;
  font-size: 11pt;
}

.signature-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.signature-cell {
  border: 1px solid #000;
  text-align: center;
  padding: 10px;
  vertical-align: top;
}

.signature-label {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 10pt;
}

.signature-space {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
}

.signature-img {
  max-height: 70px;
  max-width: 150px;
}

.signature-name {
  padding-top: 5px;
  font-size: 10pt;
  font-weight: bold;
}

.signature-position {
  font-size: 9pt;
  color: #666;
  margin-top: 2px;
}

@media print {
  .print-container {
    padding: 0;
  }

  @page {
    size: A4;
    margin: 10mm;
  }
}
</style>