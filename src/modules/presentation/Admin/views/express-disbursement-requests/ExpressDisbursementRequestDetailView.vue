<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { useExpressDisbursementRequestStore } from "@/modules/presentation/Admin/stores/express-disbursement-request/express-disbursement-request.store";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useExpressDisbursementRequestStore();

const entity = computed(() => store.requestDetail);
const items = computed(() => entity.value?.getItems() ?? []);
const steps = computed(() =>
  [...(entity.value?.getUserApproval()?.approval_step ?? [])].sort(
    (a, b) => a.step_number - b.step_number
  )
);

const statusLabel = (id: number) =>
  id === 2
    ? t("expressDisbursementRequest.status.approved")
    : id === 3
    ? t("expressDisbursementRequest.status.rejected")
    : t("expressDisbursementRequest.status.pending");

onMounted(async () => {
  await store.fetchById(String(route.params.id));
});
onUnmounted(() => store.resetState());

const goBack = () => router.push({ name: "express_disbursement_request.index" });
const print = () => window.print();
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">{{ t("expressDisbursementRequest.detail_title") }}</h1>
      <div class="flex gap-2">
        <UiButton type="" icon="ant-design:printer-outlined" @click="print">
          {{ t("button.print") }}
        </UiButton>
        <UiButton type="" icon="ant-design:arrow-left-outlined" @click="goBack">
          {{ t("button.back") }}
        </UiButton>
      </div>
    </div>

    <div v-if="entity" class="bg-white rounded-lg p-6 shadow-sm space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div><b>{{ t("expressDisbursementRequest.table.edr_number") }}:</b> {{ entity.getEdrNumber() ?? "-" }}</div>
        <div><b>{{ t("expressDisbursementRequest.table.status") }}:</b> {{ entity.getStatus() }}</div>
        <div class="sm:col-span-2"><b>{{ t("expressDisbursementRequest.form.purpose") }}:</b> {{ entity.getPurpose() }}</div>
        <div><b>{{ t("expressDisbursementRequest.detail.requester") }}:</b> {{ entity.getRequester()?.username ?? "-" }}</div>
        <div><b>{{ t("expressDisbursementRequest.detail.department") }}:</b> {{ entity.getDepartment()?.name ?? "-" }}</div>
      </div>

      <table class="w-full text-sm border">
        <thead class="bg-gray-50">
          <tr>
            <th class="border p-2">#</th>
            <th class="border p-2 text-left">{{ t("expressDisbursementRequest.form.item_title") }}</th>
            <th class="border p-2">{{ t("expressDisbursementRequest.form.quantity") }}</th>
            <th class="border p-2 text-right">{{ t("expressDisbursementRequest.form.price") }}</th>
            <th class="border p-2 text-right">{{ t("expressDisbursementRequest.table.total") }}</th>
            <th class="border p-2">{{ t("expressDisbursementRequest.detail.budget_item") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(it, i) in items" :key="i">
            <td class="border p-2 text-center">{{ i + 1 }}</td>
            <td class="border p-2">{{ it.getTitle() }}</td>
            <td class="border p-2 text-center">{{ it.getQuantity() }}</td>
            <td class="border p-2 text-right">{{ it.getPrice().toLocaleString() }}</td>
            <td class="border p-2 text-right">{{ it.getTotalPrice().toLocaleString() }}</td>
            <td class="border p-2 text-center">{{ it.getBudgetItemId() ?? "-" }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td class="border p-2 text-right font-semibold" colspan="4">
              {{ t("expressDisbursementRequest.form.total") }}
            </td>
            <td class="border p-2 text-right font-semibold">{{ entity.getTotal().toLocaleString() }}</td>
            <td class="border p-2"></td>
          </tr>
        </tfoot>
      </table>

      <div>
        <h3 class="font-semibold mb-2">{{ t("expressDisbursementRequest.detail.approval_steps") }}</h3>
        <ol class="space-y-2">
          <li v-for="step in steps" :key="step.id" class="rounded border p-3 flex justify-between">
            <span>
              #{{ step.step_number }} —
              {{ step.doc_approver?.[0]?.department?.name ?? step.doc_approver?.[0]?.user?.username ?? "-" }}
            </span>
            <span
              :class="{
                'text-green-600': step.status_id === 2,
                'text-red-600': step.status_id === 3,
                'text-yellow-600': step.status_id === 1,
              }"
            >
              {{ statusLabel(step.status_id) }}
            </span>
          </li>
        </ol>
      </div>
    </div>

    <div v-else class="text-center text-gray-400 py-16">
      {{ t("expressDisbursementRequest.detail.empty") }}
    </div>
  </div>
</template>
