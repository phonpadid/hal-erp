<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed } from "vue";
import { formatPrice } from "@/modules/shared/utils/format-price";

const props = defineProps<{
    /** Legacy: receipt object passed directly (used when no API JSON yet) */
    receipt?: any;
    /** API JSON response from /receipts/print/:id?print=... */
    data?: any;
    /** Print mode: only-receipt or full bundle (PR + PO + Receipt) */
    mode?: "about_receipt" | "all_document";
}>();

/** Pull a section out of the API response, tolerating a few shapes. */
const pickFrom = (root: any, keys: string[]): any => {
    if (!root || typeof root !== "object") return null;
    for (const k of keys) {
        if (root[k]) return root[k];
    }
    if (root.data && typeof root.data === "object") {
        for (const k of keys) {
            if (root.data[k]) return root.data[k];
        }
    }
    return null;
};

const purchaseRequest = computed(() =>
    pickFrom(props.data, ["purchase_request", "purchaseRequest", "pr"])
);
const purchaseOrder = computed(() =>
    pickFrom(props.data, ["purchase_order", "purchaseOrder", "po"])
);
const receipt = computed(() => {
    const fromApi = pickFrom(props.data, ["receipt"]);
    if (fromApi) return fromApi;
    // about_receipt response could BE the receipt at the top level
    if (props.mode === "about_receipt" && props.data?.receipt_number) {
        return props.data;
    }
    if (props.mode === "about_receipt" && props.data?.data?.receipt_number) {
        return props.data.data;
    }
    return props.receipt ?? null;
});

const showPr = computed(() => props.mode === "all_document" && !!purchaseRequest.value);
const showPo = computed(() => props.mode === "all_document" && !!purchaseOrder.value);

const formatDateOnly = (dateString?: string) => {
    if (!dateString) return "";
    const [date] = String(dateString).split(" ");
    return date;
};

/** Sort steps and split out the requester (step 0). */
const sortedSteps = (doc: any) => {
    const steps = doc?.user_approval?.approval_step ?? [];
    return [...steps].sort(
        (a: any, b: any) => (a.step_number ?? 0) - (b.step_number ?? 0)
    );
};
const requesterStepOf = (doc: any) =>
    sortedSteps(doc).find((s: any) => s.step_number === 0) || null;
const approverStepsOf = (doc: any) =>
    sortedSteps(doc).filter((s: any) => s.step_number !== 0);

// PR specific
const prRequester = computed(() => requesterStepOf(purchaseRequest.value));
const prApprovers = computed(() => approverStepsOf(purchaseRequest.value));
const prItems = computed(() => purchaseRequest.value?.purchase_request_item ?? []);
const prTotal = computed(() => {
    if (purchaseRequest.value?.total != null) return purchaseRequest.value.total;
    return prItems.value.reduce(
        (sum: number, it: any) =>
            sum + Number(it.price ?? 0) * Number(it.quantity ?? 0),
        0
    );
});

// PO specific
const poRequester = computed(() => requesterStepOf(purchaseOrder.value));
const poApprovers = computed(() => approverStepsOf(purchaseOrder.value));
const poItems = computed(() => purchaseOrder.value?.purchase_order_item ?? []);
const poShop = computed(() => {
    const first = poItems.value[0];
    if (!first?.selected_vendor?.length) return null;
    return (
        first.selected_vendor.find((v: any) => v.selected === true) ||
        first.selected_vendor[0]
    );
});

// Receipt specific
const receiptItems = computed(() => receipt.value?.receipt_item ?? []);
const budgetAcc = computed(
    () => receiptItems.value[0]?.purchase_order_item?.budget_item?.budget_account
);
const receiptShopBank = computed(
    () => receiptItems.value[0]?.purchase_order_item?.selected_vendor?.[0]?.vendor_bank_account
);
const receiptSteps = computed(() => sortedSteps(receipt.value));
</script>

<template>
    <div class="print-container">
        <!-- ========== PAGE 1: PURCHASE REQUEST ========== -->
        <section v-if="showPr" class="print-page">
            <div class="doc">
                <div class="header">
                    <h1 class="title">ໃບສະເໜີຈັດຊື້ - PURCHASE REQUEST</h1>
                    <p class="doc-number">{{ purchaseRequest?.pr_number }}</p>
                </div>

                <table class="info-table">
                    <tr>
                        <td class="label">Staff Name<br />ຊື່ພະນັກງານ:</td>
                        <td class="value">{{ purchaseRequest?.document?.requester?.username }}</td>
                        <td class="label">Position<br />ຕຳແໜ່ງ:</td>
                        <td class="value">
                            {{ purchaseRequest?.document?.position?.[0]?.name }}
                        </td>
                        <td class="label">Department<br />ພະແນກ:</td>
                        <td class="value">{{ purchaseRequest?.document?.department?.name }}</td>
                    </tr>
                    <tr>
                        <td class="label">Request date<br />ວັນທີສະເໜີ:</td>
                        <td class="value">{{ formatDateOnly(purchaseRequest?.requested_date) }}</td>
                        <td class="label">Expected Date<br />ວັນທີຕ້ອງການ:</td>
                        <td class="value">{{ formatDateOnly(purchaseRequest?.expired_date) }}</td>
                        <td class="label">PR No./ເລກທີ:</td>
                        <td class="value">{{ purchaseRequest?.pr_number }}</td>
                    </tr>
                </table>

                <div class="purpose-section">
                    <div class="section-label">Purposes/ຈຸດປະສົງ:</div>
                    <div class="purpose-content">{{ purchaseRequest?.purposes || "----" }}</div>
                </div>

                <div class="budget-section" v-if="prItems[0]?.budget_item">
                    <div class="budget-row">
                        <span class="section-label">Budget Topic/ຫົວຂໍ້ງົບປະມານ:</span>
                        <span class="budget-value">
                            {{ prItems[0]?.budget_item?.budget_account?.name }}
                        </span>
                    </div>
                    <div class="budget-row">
                        <span class="section-label">Budget Code/ລະຫັດເຂົ້າບັນຊີງົບປະມານ:</span>
                        <span class="budget-value">
                            {{ prItems[0]?.budget_item?.budget_account?.code }}
                        </span>
                    </div>
                </div>

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
                        <tr v-for="(item, index) in prItems" :key="`pr-${item.id ?? index}`">
                            <td class="text-center">{{ index + 1 }}</td>
                            <td>{{ item.title }}</td>
                            <td class="text-center">{{ item.quantity }}</td>
                            <td class="text-center">{{ item.unit?.name || "ຊີ້ນ" }}</td>
                            <td class="text-right">{{ formatPrice(item.price) }}</td>
                            <td class="text-right">
                                {{ formatPrice(Number(item.price ?? 0) * Number(item.quantity ?? 0)) }}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr class="total-row grand-total">
                            <td colspan="5" class="total-label">TOTAL/ລວມທັງໝົດ:</td>
                            <td class="total-value">{{ formatPrice(prTotal) }} LAK</td>
                        </tr>
                    </tfoot>
                </table>

                <table class="signature-table">
                    <tr>
                        <td v-if="prRequester" class="signature-cell">
                            <div class="signature-label">ສະເໜີໂດຍ</div>
                            <div class="signature-space">
                                <img v-if="prRequester?.approver?.user_signature?.signature_url"
                                    :src="prRequester.approver.user_signature.signature_url" alt="signature"
                                    class="signature-img" />
                            </div>
                            <div class="signature-name">
                                {{ prRequester?.approver?.username || "_______________" }}
                            </div>
                            <div class="signature-position" v-if="prRequester?.position">
                                {{ prRequester.position.name }}
                            </div>
                        </td>
                        <td v-for="(step, index) in prApprovers" :key="`pr-sig-${step.id ?? index}`"
                            class="signature-cell">
                            <div class="signature-label">ອະນຸມັດໂດຍ {{ index + 1 }}</div>
                            <div class="signature-space">
                                <img v-if="step?.approver?.user_signature?.signature_url"
                                    :src="step.approver.user_signature.signature_url" alt="signature"
                                    class="signature-img" />
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
        </section>

        <!-- ========== PAGE 2: PURCHASE ORDER ========== -->
        <section v-if="showPo" class="print-page">
            <div class="doc">
                <div class="header">
                    <h1 class="title">ໃບສັ່ງຊື້ - PURCHASE ORDER</h1>
                    <p class="doc-number">{{ purchaseOrder?.po_number }}</p>
                </div>

                <table class="info-table">
                    <tr>
                        <td class="label">Staff Name<br />ຊື່ພະນັກງານ:</td>
                        <td class="value">{{ purchaseOrder?.document?.requester?.username }}</td>
                        <td class="label">Position<br />ຕຳແໜ່ງ:</td>
                        <td class="value">
                            {{ purchaseOrder?.document?.position?.[0]?.name }}
                        </td>
                        <td class="label">Department<br />ພະແນກ:</td>
                        <td class="value">{{ purchaseOrder?.document?.department?.name }}</td>
                    </tr>
                    <tr>
                        <td class="label">Order Date<br />ວັນທີສັ່ງຊື້:</td>
                        <td class="value">{{ formatDateOnly(purchaseOrder?.order_date) }}</td>
                        <td class="label">Delivery Date<br />ວັນທີສົ່ງ:</td>
                        <td class="value">{{ formatDateOnly(purchaseOrder?.expired_date) }}</td>
                        <td class="label">PO No./ເລກທີ:</td>
                        <td class="value">{{ purchaseOrder?.po_number }}</td>
                    </tr>
                </table>

                <div class="shop-section" v-if="poShop">
                    <div class="section-label">Supplier Information/ຂໍ້ມູນຜູ້ສະໜອງ</div>
                    <table class="shop-info-table">
                        <tr>
                            <td class="label">Shop Name<br />ຊື່ຮ້ານ:</td>
                            <td class="value">{{ poShop?.vendor?.name }}</td>
                            <td class="label">Contact<br />ເບີໂທ:</td>
                            <td class="value">{{ poShop?.vendor?.contact_info }}</td>
                        </tr>
                        <tr>
                            <td class="label">Bank Info<br />ຂໍ້ມູນທະນາຄານ:</td>
                            <td class="value" colspan="3">
                                {{ poShop?.vendor_bank_account?.bank?.name }} -
                                {{ poShop?.vendor_bank_account?.account_number }}
                                ({{ poShop?.vendor_bank_account?.account_name }})
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="purpose-section">
                    <div class="section-label">Purposes/ຈຸດປະສົງ:</div>
                    <div class="purpose-content">{{ purchaseOrder?.purposes || "----" }}</div>
                </div>

                <div class="budget-section" v-if="poItems[0]?.budget_item">
                    <div class="budget-row">
                        <span class="section-label">Budget Topic/ຫົວຂໍ້ງົບປະມານ:</span>
                        <span class="budget-value">
                            {{ poItems[0]?.budget_item?.budget_account?.name }}
                        </span>
                    </div>
                    <div class="budget-row">
                        <span class="section-label">Budget Code/ລະຫັດເຂົ້າບັນຊີງົບປະມານ:</span>
                        <span class="budget-value">
                            {{ poItems[0]?.budget_item?.budget_account?.code }}
                        </span>
                    </div>
                </div>

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
                        <tr v-for="(item, index) in poItems" :key="`po-${item.id ?? index}`">
                            <td class="text-center">{{ index + 1 }}</td>
                            <td>{{ item.purchase_request_item?.title }}</td>
                            <td class="text-center">{{ item.quantity }}</td>
                            <td class="text-center">
                                {{ item.purchase_request_item?.unit?.name || "ຊີ້ນ" }}
                            </td>
                            <td class="text-right">{{ formatPrice(item.price) }}</td>
                            <td class="text-right">{{ formatPrice(item.total) }}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="5" class="total-label">SUB TOTAL/ລວມຍ່ອຍ:</td>
                            <td class="total-value">{{ formatPrice(purchaseOrder?.sub_total) }} LAK</td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="5" class="total-label">VAT/ອາກອນ:</td>
                            <td class="total-value">{{ formatPrice(purchaseOrder?.vat) }} LAK</td>
                        </tr>
                        <tr class="total-row grand-total">
                            <td colspan="5" class="total-label">TOTAL/ລວມທັງໝົດ:</td>
                            <td class="total-value">{{ formatPrice(purchaseOrder?.total) }} LAK</td>
                        </tr>
                    </tfoot>
                </table>

                <table class="signature-table">
                    <tr>
                        <td v-if="poRequester" class="signature-cell">
                            <div class="signature-label">ສະເໜີໂດຍ</div>
                            <div class="signature-space">
                                <img v-if="poRequester?.approver?.user_signature?.signature_url"
                                    :src="poRequester.approver.user_signature.signature_url" alt="signature"
                                    class="signature-img" />
                            </div>
                            <div class="signature-name">
                                {{ poRequester?.approver?.username || "_______________" }}
                            </div>
                            <div class="signature-position" v-if="poRequester?.position">
                                {{ poRequester.position.name }}
                            </div>
                        </td>
                        <td v-for="(step, index) in poApprovers" :key="`po-sig-${step.id ?? index}`"
                            class="signature-cell">
                            <div class="signature-label">ອະນຸມັດໂດຍ {{ index + 1 }}</div>
                            <div class="signature-space">
                                <img v-if="step?.approver?.user_signature?.signature_url"
                                    :src="step.approver.user_signature.signature_url" alt="signature"
                                    class="signature-img" />
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
        </section>

        <!-- ========== PAGE 3 (or only page): RECEIPT ========== -->
        <section v-if="receipt" class="print-page">
            <div class="doc">
                <div class="header">
                    <h1 class="title">ໃບເບີກຈ່າຍ - RECEIPT</h1>
                    <p class="doc-number">{{ receipt?.receipt_number }}</p>
                </div>

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
                        <td class="value">{{ formatDateOnly(receipt?.created_at) }}</td>
                        <td class="label">Expected Date<br />ວັນທີຕ້ອງການ:</td>
                        <td class="value">{{ formatDateOnly(receipt?.receipt_date) }}</td>
                        <td class="label">PO No./ເລກທີ:</td>
                        <td class="value">{{ receipt?.po_number }}</td>
                    </tr>
                </table>

                <div class="purpose-section">
                    <div class="section-label">Purposes/ຈຸດປະສົງ:</div>
                    <div class="purpose-content">{{ receipt?.remark || "----" }}</div>
                </div>

                <div class="budget-section">
                    <div class="budget-row" v-if="budgetAcc">
                        <span class="section-label">Budget Topic/ຫົວຂໍ້ງົບປະມານ:</span>
                        <span class="budget-value">{{ budgetAcc?.name }}</span>
                    </div>
                    <div class="budget-row" v-if="budgetAcc">
                        <span class="section-label">Budget Code/ລະຫັດເຂົ້າບັນຊີງົບປະມານ:</span>
                        <span class="budget-value">{{ budgetAcc?.code }}</span>
                    </div>
                    <div class="budget-row" v-if="receipt?.account_code">
                        <span class="section-label">Account Number/ເລກທີບັນຊີ:</span>
                        <span class="budget-value">{{ receipt?.account_code }}</span>
                    </div>
                    <div class="budget-row" v-if="receiptShopBank?.account_name || receiptShopBank?.account_number">
                        <span class="section-label">Shop account/ບັນຊີຮ້ານຄ້າ:</span>
                        <span class="budget-value">
                            {{ receiptShopBank?.account_name }} - {{ receiptShopBank?.account_number }}
                        </span>
                    </div>
                </div>

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
                        <tr v-for="(item, index) in receiptItems" :key="`r-${item.id ?? index}`">
                            <td class="text-center">{{ index + 1 }}</td>
                            <td>{{ item.purchase_order_item?.purchase_request_item?.title }}</td>
                            <td class="text-center">{{ item.quantity }}</td>
                            <td class="text-center">
                                {{ item.purchase_order_item?.purchase_request_item?.unit?.name || "ຊີ້ນ" }}
                            </td>
                            <td class="text-right">{{ formatPrice(item.price) }}</td>
                            <td>{{ item.remark }}</td>
                        </tr>
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

                <table class="signature-table">
                    <tr>
                        <td v-for="(step, index) in receiptSteps" :key="`r-sig-${step.id ?? index}`"
                            class="signature-cell">
                            <div class="signature-label">
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
            </div>
        </section>
    </div>
</template>

<style scoped>
.print-container {
    max-width: 210mm;
    margin: 0 auto;
    padding: 8px;
    background: white;
}

.print-page {
    page-break-after: always;
    break-after: page;
}

.print-page:last-child {
    page-break-after: auto;
    break-after: auto;
}

.doc {
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

.col-total {
    width: 19%;
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
