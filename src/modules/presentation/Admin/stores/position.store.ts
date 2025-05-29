import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { PositionServiceImpl } from "@/modules/application/services/position.service";
import { ApiPositionRepository } from "@/modules/infrastructure/api-position.repository";
import { Position } from "@/modules/domain/entities/position.entities";
import type { CreatePositionDTO, UpdatePositionDTO } from "@/modules/application/dtos/position.dto";
import type { PaginationParams } from "@/modules/shared/pagination";

const createPositionService = () => {
  const positionRepository = new ApiPositionRepository();
  return new PositionServiceImpl(positionRepository);
};

export const usePositionStore = defineStore("position", () => {
  const positionService = createPositionService();

  const positions: Ref<Position[]> = ref([]);
  const currentPosition: Ref<Position | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const activePositions = computed(() => positions.value.filter((position) => !position.isDeleted()));
  const deletedPositions = computed(() => positions.value.filter((position) => position.isDeleted()));
  const totalActivePositions = computed(() => activePositions.value.length);
  const totalDeletedPositions = computed(() => deletedPositions.value.length);

  const createPosition = async (data: CreatePositionDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const position = await positionService.createPosition(data);
      positions.value = [position, ...positions.value];
      return position;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPositions = async (
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await positionService.getAllPositions(params, includeDeleted);
      positions.value = result.data;
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

  const fetchPositionById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      currentPosition.value = await positionService.getPositionById(id);
      return currentPosition.value;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getPositionByName = async (name: string) => {
    try {
      return await positionService.getPositionByName(name);
    } catch (err) {
      console.error("Failed to check position by name:", err);
      return null;
    }
  };

  const updatePosition = async (id: string, data: UpdatePositionDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedPosition = await positionService.updatePosition(id, data);
      const index = positions.value.findIndex((p) => p.getId() === id);
      if (index !== -1) {
        positions.value[index] = updatedPosition;
      }
      if (currentPosition.value?.getId() === id) {
        currentPosition.value = updatedPosition;
      }
      return updatedPosition;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePosition = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await positionService.deletePosition(id);
      const index = positions.value.findIndex((p) => p.getId() === id);
      if (index !== -1) {
        const deletedPosition = positions.value[index];
        positions.value[index] = new Position(
          deletedPosition.getId(),
          deletedPosition.getName(),
          deletedPosition.getCreatedAt(),
          new Date().toString(),
          new Date()
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

  const restorePosition = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await positionService.restorePosition(id);
      const index = positions.value.findIndex((p) => p.getId() === id);
      if (index !== -1) {
        const restoredPosition = positions.value[index];
        positions.value[index] = new Position(
          restoredPosition.getId(),
          restoredPosition.getName(),
          restoredPosition.getCreatedAt(),
          new Date().toString(),
          null
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

  const searchPositionsByName = async (
    name: string,
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await positionService.getAllPositions({
        ...params,
        search: name,
      });
      positions.value = result.data;
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
    positions,
    currentPosition,
    loading,
    error,
    pagination,

    activePositions,
    deletedPositions,
    totalActivePositions,
    totalDeletedPositions,

    createPosition,
    fetchPositions,
    fetchPositionById,
    updatePosition,
    deletePosition,
    restorePosition,
    searchPositionsByName,
    getPositionByName,
    resetState,
  };
});
