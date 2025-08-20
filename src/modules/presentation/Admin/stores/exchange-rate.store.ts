import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";
import type { Ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiExchangeRateRepository } from "@/modules/infrastructure/api-exchange-rate.repository";
import { ExchangeRateServiceImpl } from "@/modules/application/services/exchange-rate.service";
import type { ExchangeRateEntity } from "@/modules/domain/entities/exchange-rate.entities";
import type { ExchangeRateApiModel } from "@/modules/interfaces/exchange-rate.interface";
import { CurrencyEntityToInterface } from "./currency.store";
import type { CreateExchangeRateDTO, UpdateExchangeRateDTO } from "@/modules/application/dtos/exchange-rate.dto";

export const formState = reactive({
  addMore: [
    {
      from_currency_id: "" as string | number,
      to_currency_id: "" as string | number,
      rate: 0 as number | undefined,
      is_active: "",
    },
  ],
});

const createExchangeRateService = () => {
  const exchangeRateRepository = new ApiExchangeRateRepository();
  return new ExchangeRateServiceImpl(exchangeRateRepository);
};

export const useExchangeRateStore = defineStore("exchange-rate", () => {
  // service
  const exchangeRateService = createExchangeRateService();

  // State
  const exchangeRate: Ref<ExchangeRateEntity[]> = ref([]);
  const currentExchangeRate: Ref<ExchangeRateEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeExchangeRate = computed(() =>
    exchangeRate.value.filter((val) => !val.isDeleted())
  );
  const inactiveExchangeRate = computed(() =>
    exchangeRate.value.filter((val) => val.isDeleted())
  );

  // Get All documentType
  const fetchAll = async (
    params: PaginationParams = { page: 1, limit: 10 }
    // includeDeleted: boolean = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await exchangeRateService.getAll(params);
      exchangeRate.value = result.data;
      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get User By ID
  const fetchById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const exchangeRate = await exchangeRateService.getOne(id);
      currentExchangeRate.value = exchangeRate;
      return exchangeRate ? ExchangeRateEntityToInterface(exchangeRate) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const created = async (input: CreateExchangeRateDTO[]) => {
    loading.value = true;
    error.value = null;

    try {
      const data = await exchangeRateService.create(input); // expects array return
      // exchangeRate.value = [...(data as ExchangeRateEntity[]), ...exchangeRate.value];
      const resArray = Array.isArray(data) ? data : [data];
      exchangeRate.value = [...resArray, ...exchangeRate.value];
      return resArray;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update
  const updated = async (id: string, input: UpdateExchangeRateDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const update = await exchangeRateService.update(id, input);
      const index = exchangeRate.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        exchangeRate.value[index] = update;
      }
      // Update current user if it's loaded
      if (currentExchangeRate.value && currentExchangeRate.value.getId() === id) {
        currentExchangeRate.value = update;
      }

      return ExchangeRateEntityToInterface(update);
    } catch (err: unknown) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete
  const deleted = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await exchangeRateService.delete(id);
      if (result) {
        const index = exchangeRate.value.findIndex((u) => u.getId() === id);
        if (index !== -1) {
          exchangeRate.value[index].delete();
        }
      }
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const ExchangeRateEntityToInterface = (
    exchangeRate: ExchangeRateEntity
  ): ExchangeRateApiModel => {
    return {
      id: exchangeRate.getId() ?? "",
      from_currency_id: exchangeRate.getFromCurrencyId(),
      to_currency_id: exchangeRate.getToCurrencyId(),
      rate: exchangeRate.getRate(),
      is_active: exchangeRate.getIsActive() ?? false,
      from_currency: CurrencyEntityToInterface(exchangeRate.getFromCurrency()),
      to_currency: CurrencyEntityToInterface(exchangeRate.getToCurrency()),
      created_at: exchangeRate.getCreatedAt(),
      updated_at: exchangeRate.getUpdatedAt(),
      deleted_at: exchangeRate.getDeletedAt()?? '',
    };
  };

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  return {
    // State
    exchangeRate,
    currentExchangeRate,
    loading,
    error,
    pagination,

    // Getters
    activeExchangeRate,
    inactiveExchangeRate,

    // Actions
    fetchAll,
    fetchById,
    created,
    updated,
    deleted,
    setPagination,
  };
});
