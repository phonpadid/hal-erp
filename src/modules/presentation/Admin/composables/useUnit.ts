import { ref } from "vue";
import type { Ref } from "vue";
import type { CreateUnitDTO, UpdateUnitDTO } from "@/modules/application/dtos/UnitDTO";
import { UnitServiceImpl } from "@/modules/application/useCases/services/UnitService";
import { ApiUnitRepository } from "@/modules/infrastructure/ApiUnitRepository";
import type { Unit } from "@/modules/domain/entities/Unit";
import type { PaginationParams } from "@/modules/shared/paagination";

// Factory for UnitService
const createUnitService = () => {
  const unitRepository = new ApiUnitRepository();
  return new UnitServiceImpl(unitRepository);
};

export function useUnits() {
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

  // Create Unit
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
      const result = await unitService.getAllUnits(params, includeDeleted);
      units.value = result.data;
      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };
    } catch (err) {
      error.value = err as Error;
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

    try {
      const result = await unitService.deleteUnit(id);

      // Refresh the list after deletion
      await fetchUnits({ page: pagination.value.page, limit: pagination.value.limit });

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

      // Refresh the list after restoration
      await fetchUnits({ page: pagination.value.page, limit: pagination.value.limit }, true);

      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Search Unit
  const searchUnitsByName = async (
    name: string,
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      // ในกรณีจริง คุณอาจจะเพิ่มเมธอด findByNamePattern ใน UnitRepository
      // สำหรับตัวอย่างนี้ เราจะใช้ API ที่มี query parameter
      const response = await unitService.getAllUnits({
        ...params,
        search: name,
      });

      units.value = response.data;
      pagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      };
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  };

  return {
    units,
    currentUnit,
    loading,
    error,
    pagination,
    createUnit,
    fetchUnits,
    fetchUnitById,
    updateUnit,
    deleteUnit,
    restoreUnit,
    searchUnitsByName,
  };
}
