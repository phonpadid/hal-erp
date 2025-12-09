import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiReceiptRepository } from "@/modules/infrastructure/api-receipt.repository";
import { ReceiptServiceImpl } from "@/modules/application/services/receipt.service";
import type { CreateReceiptDTO, IApprovalReceiptDto, ReciptQueryDto, UpdateReceiptDTO } from "@/modules/application/dtos/receipt.dto";


const createReceiptService = () => {
  const repository = new ApiReceiptRepository();
  return new ReceiptServiceImpl(repository);
};

export const useReceiptStore = defineStore("receipt-store", () => {
  // Service
  const serice = createReceiptService();

  // State
  const receipts: Ref<ReciptQueryDto[]> = ref([]);
  const receiptsData = ref<ReciptQueryDto | null>(null);
  const status = ref([{
    id: 0,
    amount: 0,
    status: ""
  }])
  const currentReceipts: Ref<ReciptQueryDto | null> = ref(null);
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
  const fetchAll = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await serice.getAll(params);
      receipts.value = result.data;
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

  // Fetch receipts filtered by company_id
  const fetchByCompanyId = async (companyId: number, params: PaginationParams = { page: 1, limit: 10000 }) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await serice.getAll({
        ...params,
        company_id: companyId
      });
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await serice.getOne(id);
      currentReceipts.value = res;
      return res;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const created = async (input: CreateReceiptDTO) => {

    loading.value = true;
    error.value = null;

    try {
      const res = await serice.create(input);
      console.log('insert:',res);

      currentReceipts.value = { ...currentReceipts.value, ...res } as ReciptQueryDto;
      return res;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updated = async (
    id: string,
    input: UpdateReceiptDTO[]
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await serice.update(
        id,
        input
      );
      return res;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const approvalReceipt = async (
    id: number,
    input: IApprovalReceiptDto
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await serice.approval(
        id,
        input
      );
      return res;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const reportMenu = async (type: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await serice.reportMenu(type);
      counts.value[type] = result?.amount ?? 0;
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const deleted = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await serice.delete(id);
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const exportExcel = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const blob = await serice.exportExcel(id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${id}-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return blob;
    } catch (err) {
      error.value = err as Error;
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
    receipts,
    currentReceipts,
    loading,
    error,
    pagination,
    setPagination,
    approvalReceipt,
    // Getters
    // Actions
    fetchAll,
    fetchByCompanyId,
    fetchById,
    created,
    updated,
    deleted,
    exportExcel,
    status,
    receiptsData,
    reportMenu,
    counts
  };
});

export const formState = reactive({
  budget_account_id: null as number | null,
  description: "",
  file_name: "" ,
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
