<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
/**
 * Step-aware approval detail for Express Disbursement Requests.
 *
 * The widget shown is decided SOLELY by the active pending step's capability
 * flags (requires_budget_selection / requires_file_upload / requires_account_code
 * / is_otp) — never by the approver's role or the document type. This lets the
 * same kind of step (e.g. finance) appear more than once in a chain with
 * different flags. Budget deduction happens on the backend at the final step.
 */
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { useExpressDisbursementRequestStore } from "@/modules/presentation/Admin/stores/express-disbursement-request/express-disbursement-request.store";
import { useApprovalStepStore } from "@/modules/presentation/Admin/stores/approval-step.store";
import BudgetItemPicker from "./widgets/BudgetItemPicker.vue";
import SlipUpload from "./widgets/SlipUpload.vue";
import AccountCodeInput from "./widgets/AccountCodeInput.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useExpressDisbursementRequestStore();
const approvalStepStore = useApprovalStepStore();

const documentId = String(route.params.id);
const entity = computed(() => store.requestDetail);

// --- widget-bound state (captured this step, sent via /approve-step) ---
const budgetSelection = ref<Array<{ id: number; budget_item_id: number }>>([]);
const slipFiles = ref<Array<{ file_name: string }>>([]);
const accountCode = ref<string>("");

// --- OTP / reject modals ---
const otpModalVisible = ref(false);
const otpValue = ref("");
const rejectModalVisible = ref(false);
const rejectReason = ref("");

const steps = computed(() =>
  [...(entity.value?.getUserApproval()?.approval_step ?? [])].sort(
    (a, b) => a.step_number - b.step_number
  )
);

// Earliest still-pending step (sequential gating by step_number).
const pendingStep = computed(() => steps.value.find((s) => s.status_id === 1) ?? null);

// Approver authorization — same convention as the PR approval detail.
const canApprove = computed(() => {
  const step = pendingStep.value;
  if (!step?.doc_approver?.length) return false;
  const userDataStr = localStorage.getItem("userData");
  const userData = userDataStr ? JSON.parse(userDataStr) : null;
  return step.doc_approver.some(
    (a: any) =>
      a.user?.username === userData?.username &&
      a.department?.name === userData?.department_name
  );
});

// Capability flags of the active step (default false when the API omits them).
const flags = computed(() => {
  const s: any = pendingStep.value ?? {};
  return {
    budget: !!s.requires_budget_selection,
    file: !!s.requires_file_upload,
    account: !!s.requires_account_code,
    otp: !!s.is_otp,
  };
});

const lineItems = computed(() =>
  (entity.value?.getItems() ?? []).map((it, i) => ({
    id: Number(it.getId() ?? i),
    title: it.getTitle(),
  }))
);

function validateWidgets(): boolean {
  if (flags.value.budget && budgetSelection.value.length < lineItems.value.length) {
    message.error(t("expressDisbursementRequest.approval.err_budget"));
    return false;
  }
  if (flags.value.file && slipFiles.value.length === 0) {
    message.error(t("expressDisbursementRequest.approval.err_slip"));
    return false;
  }
  if (flags.value.account && !accountCode.value.trim()) {
    message.error(t("expressDisbursementRequest.approval.err_account"));
    return false;
  }
  return true;
}

function buildInput(statusId: number, otp?: string) {
  const step = pendingStep.value!;
  return {
    statusId,
    approvalStepId: step.id,
    approval_id: approvalStepStore.otpResponse?.approval_id ?? (entity.value?.getUserApproval()?.id),
    is_otp: flags.value.otp,
    otp,
    remark: statusId === 3 ? rejectReason.value : "Approved",
    budgetItems: flags.value.budget ? budgetSelection.value : undefined,
    files: flags.value.file ? slipFiles.value : undefined,
    account_code: flags.value.account ? accountCode.value : undefined,
  };
}

const handleApprove = async () => {
  if (!pendingStep.value || !validateWidgets()) return;
  // If the step is OTP, submitExpressApproval sends the OTP first and returns.
  const res = await store.submitExpressApproval(documentId, buildInput(2));
  if (flags.value.otp) {
    otpModalVisible.value = true;
  } else if (res) {
    await finishSuccess();
  }
};

const handleOtpConfirm = async () => {
  if (otpValue.value.length !== 6) {
    message.error(t("expressDisbursementRequest.approval.err_otp"));
    return;
  }
  const res = await store.submitExpressApproval(documentId, buildInput(2, otpValue.value));
  if (res) {
    otpModalVisible.value = false;
    await finishSuccess();
  }
};

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    message.error(t("expressDisbursementRequest.approval.err_reason"));
    return;
  }
  const res = await store.submitExpressApproval(documentId, buildInput(3));
  if (res) {
    rejectModalVisible.value = false;
    await finishSuccess();
  }
};

async function finishSuccess() {
  // Re-fetch so the (backend-authoritative) status / captured data refresh.
  await store.fetchById(documentId);
  otpValue.value = "";
  rejectReason.value = "";
}

onMounted(async () => {
  await store.fetchById(documentId);
});
onUnmounted(() => store.resetState());

const goBack = () => router.push({ name: "express_disbursement_request.index" });
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">{{ t("expressDisbursementRequest.approval.title") }}</h1>
      <UiButton type="" icon="ant-design:arrow-left-outlined" @click="goBack">
        {{ t("button.back") }}
      </UiButton>
    </div>

    <div v-if="entity" class="bg-white rounded-lg p-6 shadow-sm space-y-6">
      <div>
        <div><b>{{ t("expressDisbursementRequest.form.purpose") }}:</b> {{ entity.getPurpose() }}</div>
        <div><b>{{ t("expressDisbursementRequest.table.total") }}:</b> {{ entity.getTotal().toLocaleString() }}</div>
        <div><b>{{ t("expressDisbursementRequest.table.status") }}:</b> {{ entity.getStatus() }}</div>
      </div>

      <!-- Approval steps overview -->
      <ol class="space-y-1">
        <li
          v-for="s in steps"
          :key="s.id"
          class="flex justify-between border rounded p-2 text-sm"
          :class="{ 'ring-2 ring-blue-300': s.id === pendingStep?.id }"
        >
          <span>#{{ s.step_number }} — {{ s.doc_approver?.[0]?.department?.name ?? '-' }}</span>
          <span
            :class="{
              'text-green-600': s.status_id === 2,
              'text-red-600': s.status_id === 3,
              'text-yellow-600': s.status_id === 1,
            }"
          >{{ s.status_id === 2 ? '✓' : s.status_id === 3 ? '✗' : '…' }}</span>
        </li>
      </ol>

      <!-- Step-aware action panel (only for the authorized current approver) -->
      <div v-if="canApprove" class="border-t pt-4 space-y-4">
        <BudgetItemPicker
          v-if="flags.budget"
          v-model="budgetSelection"
          :line-items="lineItems"
        />
        <SlipUpload v-if="flags.file" v-model="slipFiles" />
        <AccountCodeInput v-if="flags.account" v-model="accountCode" />

        <div class="flex gap-2 justify-end">
          <UiButton type="" danger @click="rejectModalVisible = true">
            {{ t("button.reject") }}
          </UiButton>
          <UiButton
            type="primary"
            colorClass="text-white"
            :loading="approvalStepStore.loading"
            @click="handleApprove"
          >
            {{ t("button.approve") }}
          </UiButton>
        </div>
      </div>
      <div v-else class="text-gray-400 text-sm border-t pt-4">
        {{ t("expressDisbursementRequest.approval.not_your_turn") }}
      </div>
    </div>

    <!-- OTP modal -->
    <a-modal
      v-model:open="otpModalVisible"
      :title="t('expressDisbursementRequest.approval.otp_title')"
      :confirm-loading="approvalStepStore.loading"
      @ok="handleOtpConfirm"
    >
      <a-input v-model:value="otpValue" maxlength="6" :placeholder="t('expressDisbursementRequest.approval.otp_placeholder')" />
    </a-modal>

    <!-- Reject modal -->
    <a-modal
      v-model:open="rejectModalVisible"
      :title="t('button.reject')"
      :confirm-loading="approvalStepStore.loading"
      @ok="handleReject"
    >
      <a-textarea
        v-model:value="rejectReason"
        :rows="3"
        :placeholder="t('expressDisbursementRequest.approval.reason_placeholder')"
      />
    </a-modal>
  </div>
</template>
