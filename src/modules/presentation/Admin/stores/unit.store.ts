import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { UnitServiceImpl } from "@/modules/application/services/unit.service";
import { ApiUnitRepository } from "@/modules/infrastructure/api-unit.repository";
import { Unit } from "@/modules/domain/entities/unit.entities";
import type { CreateUnitDTO, UpdateUnitDTO } from "@/modules/application/dtos/unit.dto";
import type { PaginationParams } from "@/modules/shared/pagination";

const createUnitService = () => {
  const unitRepository = new ApiUnitRepository();
  return new UnitServiceImpl(unitRepository);
};

export const useUnitStore = defineStore("unit", () => {
  const unitService = createUnitService();
  const units: Ref<Unit[]> = ref([]);
  const currentUnit: Ref<Unit | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeUnits = computed(() => units.value.filter((unit) => !unit.isDeleted()));
  const deletedUnits = computed(() => units.value.filter((unit) => unit.isDeleted()));
  const totalActiveUnits = computed(() => activeUnits.value.length);
  const totalDeletedUnits = computed(() => deletedUnits.value.length);

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  const createUnit = async (data: CreateUnitDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const unit = await unitService.createUnit(data);
      units.value = [unit, ...units.value];
      return unit;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get All Units
  const fetchUnits = async (
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
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
      return result;
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
      currentUnit.value = await unitService.getUnitById(id);
      return currentUnit.value;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Get Unit By Name
  const getUnitByName = async (name: string) => {
    try {
      return await unitService.getUnitByName(name);
    } catch (err) {
      console.error("Failed to check unit by name:", err);
      return null;
    }
  };

  // Update Unit
  const updateUnit = async (id: string, data: UpdateUnitDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedUnit = await unitService.updateUnit(id, data);

      // Update units list if it's loaded
      if (units.value.length > 0) {
        const index = units.value.findIndex((u) => u.getId() === id);
        if (index !== -1) {
          units.value[index] = updatedUnit;
        }
      }

      // Update current unit if it's loaded
      if (currentUnit.value && currentUnit.value.getId() === id) {
        currentUnit.value = updatedUnit;
      }

      return updatedUnit;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete Unit
  const deleteUnit = async (id: string) => {
    loading.value = true;
    error.value = null;
    console.log("deleteUnit", id);

    try {
      const result = await unitService.deleteUnit(id);

      // Update units list if it's loaded
      if (units.value.length > 0) {
        const index = units.value.findIndex((u) => u.getId() === id);
        if (index !== -1) {
          // Mark as deleted in the local array
          const deletedUnit = units.value[index];
          // Here we're simulating a soft delete by manually updating the unit status
          units.value[index] = new Unit(
            deletedUnit.getId(),
            deletedUnit.getName(),
            deletedUnit.getCreatedAt(),
            new Date().toString(),
            new Date()
          );
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

  // Restore Unit
  const restoreUnit = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await unitService.restoreUnit(id);

      // Update units list if it's loaded
      if (units.value.length > 0) {
        const index = units.value.findIndex((u) => u.getId() === id);
        if (index !== -1) {
          // Mark as restored in the local array
          const restoredUnit = units.value[index];
          units.value[index] = new Unit(
            restoredUnit.getId(),
            restoredUnit.getName(),
            restoredUnit.getCreatedAt(),
            new Date().toString(),
            null // Set deletedAt to null
          );
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

  // Search Units
  const searchUnitsByName = async (
    name: string,
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await unitService.getAllUnits({
        ...params,
        search: name,
      });

      units.value = result.data;
      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };

      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
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
    deletedUnits,
    totalActiveUnits,
    totalDeletedUnits,

    // Actions
    createUnit,
    fetchUnits,
    fetchUnitById,
    updateUnit,
    deleteUnit,
    restoreUnit,
    searchUnitsByName,
    getUnitByName,
    resetState,
    setPagination,
  };
});
