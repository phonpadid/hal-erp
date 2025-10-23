import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiReportPurchaseRequestRepository } from "@/modules/infrastructure/reports/report-purchase-request.repository";
import { ReportPurchaseRequestImpl } from "@/modules/application/services/reports/report-purchase-request.service";
import type { IReportPurchaseRequestDto } from "@/modules/application/dtos/report/report-pr.dto";


const createReportPurchaseQuestService = () => {
  const repository = new ApiReportPurchaseRequestRepository();
  return new ReportPurchaseRequestImpl(repository);
};

export const useReportPrStore = defineStore("report-pr-store", () => {
  // Service
  const serice = createReportPurchaseQuestService();

  // State
  const report_pr: Ref<IReportPurchaseRequestDto[]> = ref([]);
  const status = ref([{
    id: 0,
    amount: 0,
    status: ""
  }])
  const report_money = ref([{
    status: '',
    total: 0
  }])
  const report_receipt_money = ref([{
    status: '',
    total: 0,
    currency_code: '',
    currency_name: '',
    payment_total: 0,
    total_vat: 0,
  }])
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const counts = ref<Record<string, number>>({});
  // Getters
  // Actions
  const reportPr = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await serice.reportPurchaseQuest(params);
      report_pr.value = result.data;
      status.value = result.status?.map((item) => ({
        id: item.id,
        amount: item.amount,
        status: item.status
      })) ?? []
      pagination.value = {
        page: result.page ?? 1,
        limit: result.limit ?? 10,
        total: result.total ?? 0,
        totalPages: result.totalPages ?? 0,
      };
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const reportMoney = async () => {
    loading.value = true;
    error.value = null;

    try {
      // ✅ Fix typo: 'serice' → 'service'
      const result = await serice.reportMoney();

      // ✅ If API returns an array of report money
      report_money.value = Array.isArray(result) ? result : [result];
    } catch (err) {
      error.value = err as Error;
      console.error("Failed to fetch report money:", err);
    } finally {
      loading.value = false;
    }
  };
  const reportReceiptMoney = async () => {
    loading.value = true;
    error.value = null;

    try {
      // ✅ Fix typo: 'serice' → 'service'
      const result = await serice.reportReceiptMoney();

      // ✅ If API returns an array of report money
      report_receipt_money.value = Array.isArray(result) ? result : [result];
    } catch (err) {
      error.value = err as Error;
      console.error("Failed to fetch report money:", err);
    } finally {
      loading.value = false;
    }
  };



  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  return {
    // State
    report_pr,
    loading,
    error,
    pagination,
    setPagination,
    // Getters
    // Actions
    reportPr,
    status,
    counts,
    reportMoney,
    report_money,
    reportReceiptMoney,
    report_receipt_money
  };
});

export const formState = reactive({
  budget_account_id: null as number | null,
  description: "",
  file_name: "",
  detail: [
    {
      budget_item_id: null as string | null,
      allocated_amount: 0 as number | undefined,
    },
  ]
})

export const moreFunction = () => {
  formState.detail.push({
    budget_item_id: null as string | null,
    allocated_amount: 0 as number | undefined,
  });
};
export const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const startYear = 2023;
  const options = [];

  for (let year = currentYear; year >= startYear; year--) {
    options.push({
      value: year,
      label: year.toString()
    });
  }

  return options;
});
