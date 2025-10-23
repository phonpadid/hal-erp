<script setup lang="ts">
import { computed } from 'vue';
import { formatPrice } from '@/modules/shared/utils/format-price';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{
    receipt: any;
}>();
const budgetAcc = computed(
    () => props.receipt?.receipt_item[0]?.purchase_order_item?.budget_item?.budget_account
);

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [date] = dateString.split(' ');
    return date;
};
</script>

<template>
    <div class="print-container">
        <div class="receipt-document">
            <!-- Header -->
            <div class="header">
                <h1 class="title">ໃບເບີກຈ່າຍ - RECEIPT</h1>
                <p class="doc-number">{{ receipt?.receipt_number }}</p>
            </div>

            <!-- Staff Information -->
            <table class="info-table">
                <tr>
                    <td class="label">Staff Name<br />ຊື່ພະນັກງານ:</td>
                    <td class="value">{{ receipt?.document?.requester?.username }}</td>
                    <td class="label">Position<br />ຕຳແໜ່ງ:</td>
                    <td class="value">{{ receipt?.document?.position?.[0]?.name }}</td>
                    <td class="label">Department<br />ພະແນກ:</td>
                    <td class="value">{{ receipt?.document?.department?.name }}</td>
                </tr>
                <tr>
                    <td class="label">Request date<br />ວັນທີສະເໜີ:</td>
                    <td class="value">{{ formatDate(receipt?.created_at) }}</td>
                    <td class="label">Expected Date<br />ວັນທີຕ້ອງການ:</td>
                    <td class="value">{{ formatDate(receipt?.receipt_date) }}</td>
                    <td class="label">PR No./ເລກທີ:</td>
                    <td class="value">{{ receipt?.pr_number }}</td>
                </tr>
            </table>

            <!-- Purpose -->
            <div class="purpose-section">
                <div class="section-label">Purposes/ຈຸດປະສົງ:</div>
                <div class="purpose-content">
                    {{ receipt?.remark || '----' }}
                </div>
            </div>

            <!-- Budget Information -->
            <div class="budget-section">
                <div class="budget-row">
                    <span class="section-label">Budget Topic/ຫົວຂໍ້ງົບປະມານ:</span>
                    <span class="budget-value">{{ budgetAcc?.name }}</span>
                </div>
                <div class="budget-row">
                    <span class="section-label">Budget Code/ລະຫັດເຂົ້າບັນຊີງົບປະມານ:</span>
                    <span class="budget-value">{{ budgetAcc?.code }}</span>
                </div>
                <div class="budget-row" v-if="receipt?.account_code">
                    <span class="section-label">Account Number/ເລກທີບັນຊີ:</span>
                    <span class="budget-value">{{ receipt?.account_code }}</span>
                </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th class="col-no">No.</th>
                        <th class="col-desc">Description/ລາຍລະອຽດ</th>
                        <th class="col-qty">QTY/ຈຳນວນ</th>
                        <th class="col-unit">Unit</th>
                        <th class="col-price">Unit Price/ລາຄາ</th>
                        <th class="col-remark">Remark/<br />ໝາຍເຫດ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in receipt?.receipt_item" :key="item.id">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ item.purchase_order_item?.purchase_request_item?.title }}</td>
                        <td class="text-center">{{ item.quantity }}</td>
                        <td class="text-center">{{ item.purchase_order_item?.purchase_request_item?.unit?.name || 'ຊີ້ນ'
                            }}</td>
                        <td class="text-right">{{ formatPrice(item.price) }}</td>
                        <td>{{ item.remark }}</td>
                    </tr>
                    <!-- Empty rows for template -->
                    <!-- <tr v-for="n in Math.max((receipt?.receipt_item?.length || 0))" :key="`empty-${n}`">
                        <td class="text-center">{{ (receipt?.receipt_item?.length || 0) + n }}</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                    </tr> -->
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="5" class="total-label">SUB TOTAL/ລວມຍ່ອຍ:</td>
                        <td class="total-value">{{ formatPrice(receipt?.sub_total) }} LAK</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="5" class="total-label">VAT/ອາກອນ:</td>
                        <td class="total-value">{{ formatPrice(receipt?.vat) }} LAK</td>
                    </tr>
                    <tr class="total-row grand-total">
                        <td colspan="5" class="total-label">TOTAL/ລວມທັງໝົດ:</td>
                        <td class="total-value">{{ formatPrice(receipt?.total) }} LAK</td>
                    </tr>
                </tfoot>
            </table>

            <!-- Signature Section -->
            <table class="signature-table">
                <tr>
                    <td v-for="(step, index) in receipt?.user_approval?.approval_step || []" :key="index"
                        class="signature-cell">
                        <div class="signature-label">
                            <!-- {{ step.level_name || `Step ${index + 1}` }} <br /> -->
                            {{ index === 0 ? "ສະເໜີໂດຍ" : "ອະນຸມັດໂດຍ" }}
                        </div>

                        <div class="signature-space">
                            <img v-if="step?.approver?.user_signature?.signature_url"
                                :src="step.approver.user_signature.signature_url" alt="signature"
                                class="signature-img" />
                        </div>

                        <div class="signature-name">
                            {{ step?.approver?.username || "_______________" }}
                        </div>
                    </td>
                </tr>
            </table>


            <!-- Footer -->
            <!-- <div class="footer">
                <span>ເອກະສານທາງການ</span>
                <span>F-PS-002 01/03/25 ປັບປຸງຄັ້ງທີ່: 01</span>
                <span>(ຟອມສະບັບ)</span>
                <span>ເອກະສານຄວບຄຸມຂອງຜູ້ສະໜັບ</span>
            </div> -->
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

/* .no-print {
  display: block;
  margin-bottom: 20px;
} */

.print-btn {
    padding: 10px 20px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
}

.print-btn:hover {
    background: #2563eb;
}

.receipt-document {
    /* border: 2px solid #000; */
    padding: 8mm;
    font-family: 'Phetsarath OT', Arial, sans-serif;
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

.col-no {
    width: 5%;
}

.col-desc {
    width: 35%;
}

.col-qty {
    width: 8%;
}

.col-unit {
    width: 10%;
}

.col-price {
    width: 15%;
}

.col-remark {
    width: 27%;
}

.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

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
    width: 50%;
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
    /* border-top: 1px solid #000; */
    padding-top: 0px;
    font-size: 10pt;
}

.footer {
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
    color: #666;
    border-top: 1px solid #000;
    padding-top: 5px;
}

</style>