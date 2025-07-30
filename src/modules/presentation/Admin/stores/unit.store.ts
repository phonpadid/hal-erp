import type { CreateUnitDTO, UpdateUnitDTO } from "@/modules/application/dtos/unit.dto";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type { UnitEntity } from "@/modules/domain/entities/unit.entity";
import type { PaginationParams } from "@/modules/shared/pagination";
import { UnitServiceImpl } from "@/modules/application/services/unit.service";
import { ApiUnitRepository } from "@/modules/infrastructure/api-unit.repository";
import type { UnitInterface } from "@/modules/interfaces/unit.interface";

const createUnitService = () => {
  const unitRepository = new ApiUnitRepository();
  return new UnitServiceImpl(unitRepository);
};

export const useUnitStore = defineStore("unit", () => {
  // service
  const unitService = createUnitService();

  // State
  const units: Ref<UnitEntity[]> = ref([]);
  const currentUnit: Ref<UnitEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeUnits = computed(() =>
    units.value.filter((unit) => !unit.isDeleted())
  );
  const inactiveUnits = computed(() =>
    units.value.filter((unit) => unit.isDeleted())
  );
  const totalActiveUnits = computed(() => activeUnits.value.length);
  const totalInactiveUnits = computed(() => inactiveUnits.value.length);

  // Get All Units
  const fetchUnits = async (
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await unitService.getAllUnits(params);
      units.value = result.data;
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

  // Get Unit By ID
  const fetchUnitById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const unit = await unitService.getUnitById(id);
      currentUnit.value = unit;
      return unit ? unitEntityToInterface(unit) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createUnit = async (unitData: CreateUnitDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const unit = await unitService.createUnit(unitData);
      units.value = [unit, ...units.value];
      return unitEntityToInterface(unit);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update
  const updateUnit = async (id: string, unitData: UpdateUnitDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedUnit = await unitService.updateUnit(id, unitData);
      const index = units.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        units.value[index] = updatedUnit;
      }
      if (currentUnit.value && currentUnit.value.getId() === id) {
        currentUnit.value = updatedUnit;
      }
      return unitEntityToInterface(updatedUnit);
    } catch (err: unknown) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete
  const deleteUnit = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await unitService.deleteUnit(id);
      if (result) {
        const index = units.value.findIndex((u) => u.getId() === id);
        if (index !== -1) {
          units.value[index].delete();
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

  const unitEntityToInterface = (
    unit: UnitEntity
  ): UnitInterface => {
    return {
      id: parseInt(unit.getId()),
      name: unit.getName(),
      created_at: unit.getCreatedAt(),
      updated_at: unit.getUpdatedAt(),
      deleted_at: unit.getDeletedAt(),
    };
  };

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  // Reset state
  const resetState = () => {
    units.value = [];
    currentUnit.value = null;
    error.value = null;
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
  };

  return {
    // State
    units,
    currentUnit,
    loading,
    error,
    pagination,

    // Getters
    activeUnits,
    inactiveUnits,
    totalActiveUnits,
    totalInactiveUnits,

    // Actions
    fetchUnits,
    fetchUnitById,
    createUnit,
    updateUnit,
    deleteUnit,

    resetState,
    setPagination,
  };
});
