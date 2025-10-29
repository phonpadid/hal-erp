import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiReportPurchaseOrderRepository } from "@/modules/infrastructure/reports/report-purchase-order.repository";
import { ReportPurchaseOrderImpl } from "@/modules/application/services/reports/report-purchase-order.service";
import type { IReportPo } from "@/modules/application/dtos/report/report-po.dto";


const createReportPurchaseOrderService = () => {
  const repository = new ApiReportPurchaseOrderRepository();
  return new ReportPurchaseOrderImpl(repository);
};

export const useReportPoStore = defineStore("report-po-store", () => {
  // Service
  const serice = createReportPurchaseOrderService();
  // State
  const report_po: Ref<IReportPo[]> = ref([]);
  const status = ref([{
    id: 0,
    amount: 0,
    status: ""
  }])
  const report_money = ref([{
    status: '',
    total: 0
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
  const reportPo = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await serice.reportPurchaseOrder(params);
      report_po.value = result.data;
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
  const reportPoExport = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await serice.reportPoExport(id);

      
      const url = window.URL.createObjectURL(new Blob([result]));
      const link = document.createElement("a");
      link.href = url;


      const timestamp = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `purchase-order-${id}-${timestamp}.xlsx`);

      document.body.appendChild(link);
      link.click();

     
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      error.value = err as Error;
      console.error("Failed to export report:", err);
      throw err;
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
    report_po,
    loading,
    error,
    pagination,
    setPagination,
    reportPoExport,
    // Getters
    // Actions
    reportPo,
    status,
    counts,
    reportMoney,
    report_money,
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
