import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import { api } from "@/common/config/axios/axios";
import type { PaginationParams } from "@/modules/shared/pagination";

interface Province {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

interface ProvinceApiResponse {
  data: Province[];
  pagination: {
    total: number;
    total_pages: number;
    limit: number;
    page: number;
  };
}

export const useProvinceStore = defineStore("province", () => {
  // State
  const provinces: Ref<Province[]> = ref([]);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Actions
  const fetchProvinces = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get("/provinces", {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          column: "id",
          sort_order: "DESC",
        },
      });

      const result: ProvinceApiResponse = response.data;
      provinces.value = result.data;
      pagination.value = {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.total_pages,
      };

      return {
        data: result.data,
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.total_pages,
      };
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    provinces,
    loading,
    error,
    pagination,

    // Actions
    fetchProvinces,
  };
});
