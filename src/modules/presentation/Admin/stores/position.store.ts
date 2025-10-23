import type { CreatePositionDTO, UpdatePositionDTO } from "@/modules/application/dtos/position.dto";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type { PositionEntity } from "@/modules/domain/entities/position.entity";
import type { PaginationParams } from "@/modules/shared/pagination";
import { PositionServiceImpl } from "@/modules/application/services/position.service";
import { ApiPositionRepository } from "@/modules/infrastructure/api-position.repository";
import type { PositionInterface } from "@/modules/interfaces/position.interface";

const createPositionService = () => {
  const positionRepository = new ApiPositionRepository();
  return new PositionServiceImpl(positionRepository);
};

export const usePositionStore = defineStore("position", () => {
  // service
  const positionService = createPositionService();

  // State
  const positions: Ref<PositionEntity[]> = ref([]);
  const currentPosition: Ref<PositionEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activePositions = computed(() =>
    positions.value.filter((pos) => !pos.isDeleted())
  );
  const inactivePositions = computed(() =>
    positions.value.filter((pos) => pos.isDeleted())
  );
  const totalActivePositions = computed(() => activePositions.value.length);
  const totalInactivePositions = computed(() => inactivePositions.value.length);

  // Get All Positions
  const fetchPositions = async (
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await positionService.getAllPositions(params);
      positions.value = result.data;
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

  // Get Position By ID
  const fetchPositionById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const position = await positionService.getPositionById(id);
      currentPosition.value = position;
      return position ? positionEntityToInterface(position) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createPosition = async (positionData: CreatePositionDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const position = await positionService.createPosition(positionData);
      positions.value = [position, ...positions.value];
      return positionEntityToInterface(position);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update
  const updatePosition = async (id: string, positionData: UpdatePositionDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedPosition = await positionService.updatePosition(id, positionData);
      const index = positions.value.findIndex((p) => p.getId() === id);
      if (index !== -1) {
        positions.value[index] = updatedPosition;
      }
      if (currentPosition.value && currentPosition.value.getId() === id) {
        currentPosition.value = updatedPosition;
      }
      return positionEntityToInterface(updatedPosition);
    } catch (err: unknown) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete
  const deletePosition = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await positionService.deletePosition(id);
      if (result) {
        const index = positions.value.findIndex((p) => p.getId() === id);
        if (index !== -1) {
          positions.value[index].delete();
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

  const positionEntityToInterface = (
    position: PositionEntity
  ): PositionInterface => {
    return {
      id: parseInt(position.getId()),
      name: position.getName(),
      created_at: position.getCreatedAt(),
      updated_at: position.getUpdatedAt(),
      deleted_at: position.getDeletedAt(),
    };
  };

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  // Reset state
  const resetState = () => {
    positions.value = [];
    currentPosition.value = null;
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
    positions,
    currentPosition,
    loading,
    error,
    pagination,

    // Getters
    activePositions,
    inactivePositions,
    totalActivePositions,
    totalInactivePositions,

    // Actions
    fetchPositions,
    fetchPositionById,
    createPosition,
    updatePosition,
    deletePosition,

    resetState,
    setPagination,
  };
});
