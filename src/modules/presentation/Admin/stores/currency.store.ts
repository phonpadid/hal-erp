/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiCurrencyRepository } from "@/modules/infrastructure/api-currency.repository";
import { CurrencyServiceImpl } from "@/modules/application/services/currency.service";
import { CurrencyEntity } from "@/modules/domain/entities/currency.entity";
import type { CreateCurrencyDTO, UpdateCurrencyDTO } from "@/modules/application/dtos/currency.dto";
import type { CurrencyApiModel } from "@/modules/interfaces/currency.interface";
const currencyFormModel = reactive({
  name: "",
  code: "",
});
export const formState = ref({
  addMore: [
    {
      name: "",
      code: "",
    },
  ],
});
const currencyService = () => {
  const currencyRepo = new ApiCurrencyRepository();
  return new CurrencyServiceImpl(currencyRepo);
};
export const CurrencyEntityToInterface = (
  currency: CurrencyEntity | null
): CurrencyApiModel | undefined => {
  if (!currency) return undefined;

  return {
    id: currency.getId() ?? "",
    name: currency.getName(),
    code: currency.getCode(),
  };
};
export const currencyStore = defineStore("currency-store", () => {
  const currenciesService = currencyService();

  // State
  const currencies: Ref<CurrencyEntity[]> = ref([]);
  const currentCurrency: Ref<CurrencyEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  // Actions
  const createCurrency = async (input: CreateCurrencyDTO[]) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await currenciesService.create(input);
      const resArray = Array.isArray(res) ? res : [res];
      currencies.value = [...resArray, ...currencies.value];
      return resArray;
    } catch (error: any) {
      error.value = error.response.data.message as Error;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchCurrencies = async (
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await currenciesService.getAll(params, includeDeleted);
      currencies.value = result.data;
      pagination.value = {
        page: result.page ?? 1,
        limit: result.limit ?? 10,
        total: result.total ?? 0,
        totalPages: result.totalPages ?? 0,
      };
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCurrentById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await currenciesService.getOne(id);
      currentCurrency.value = result;
      return result;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateCurrency = async (id: string, input: UpdateCurrencyDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await currenciesService.update(id, input);

      const index = currencies.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        currencies.value[index] = res;
      }

      if (currentCurrency.value?.getId() === id) {
        currentCurrency.value = res;
      }

      return res;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCurrency = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await currenciesService.delete(id);

      const index = currencies.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        const dpm = currencies.value[index];
        currencies.value[index] = new CurrencyEntity(
          dpm.getId(),
          dpm.getName(),
          dpm.getCode(),
          dpm.getCreatedAt(),
          new Date().toISOString(),
          new Date().toISOString()
        );
      }

      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const searchByName = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await currenciesService.getAll({
        ...params,
        search: params.search,
      });

      currencies.value = result.data;
      pagination.value = {
        page: result.page ?? 1,
        limit: result.limit ?? 10,
        total: result.total ?? 0,
        totalPages: result.totalPages ?? 0,
      };

      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    currencyFormModel,
    currencies,
    currentCurrency,
    loading,
    error,
    pagination,
    setPagination,
    // Actions
    createCurrency,
    fetchCurrencies,
    fetchCurrentById,
    updateCurrency,
    deleteCurrency,
    searchByName,
  };
});
