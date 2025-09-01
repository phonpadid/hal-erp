/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";
import type {
  
  UpdatePurchaseOrderDTO,
} from "@/modules/application/dtos/purchase-order/purchase-order.dto";
import type { StatusSummary } from "@/modules/interfaces/purchase-requests/purchase-request.interface";
import { ApiPurchaseOrderRepository } from "@/modules/infrastructure/purchase-order/api-purchase-order.repository";

const repository = new ApiPurchaseOrderRepository();

export const usePurchaseOrderStore = defineStore("purchaseOrders", () => {
  // State
  const orders = ref<PurchaseOrderEntity[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const statusSummary = ref<StatusSummary[]>([]);

  // Actions
  async function fetchAll(params: PaginationParams = { page: 1, limit: 10 }) {
    console.log('Fetching with params:', params);
    loading.value = true;
    error.value = null;
    try {
      const result = await repository.findAll(params);
      console.log('Repository result:', result);

      if (result) {

        orders.value = result.data;

        pagination.value = {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        };
        statusSummary.value = result.status || [];

        // ตรวจสอบ state ทั้งหมด
        console.log('Final store state:', {
          orders: orders.value,
          pagination: pagination.value,
          statusSummary: statusSummary.value
        });

        return result;
      } else {
        console.warn('No result from repository');
      }
    } catch (err: any) {
      console.error('Error in fetchAll:', err);
      error.value = err.message || "Failed to fetch purchase orders.";
    } finally {
      loading.value = false;
    }
  }
  async function fetchById(id: number): Promise<PurchaseOrderEntity | null> {
    loading.value = true;
    error.value = null;
    try {
      return await repository.findById(id);
    } catch (err: any) {
      error.value = err.message || `Failed to fetch purchase order with id ${id}.`;
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function create(data: any): Promise<PurchaseOrderEntity | null> {
    loading.value = true;
    error.value = null;
    try {
      const entity = PurchaseOrderEntity.create({
        purchase_request_id: data.purchase_request_id,
        document: data.document,
        items: data.items,
      });

      return await repository.create(entity);
    } catch (err: any) {
      error.value = err.message || "Failed to create purchase order.";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function update(
    id: number,
    data: UpdatePurchaseOrderDTO
  ): Promise<PurchaseOrderEntity | null> {
    loading.value = true;
    error.value = null;
    try {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new Error(`Purchase order with id ${id} not found`);
      }

      const entity = PurchaseOrderEntity.create({
        ...data,
      });

      return await repository.update(id, entity);
    } catch (err: any) {
      error.value = err.message || "Failed to update purchase order.";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: number): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      return await repository.delete(id);
    } catch (err: any) {
      error.value = err.message || `Failed to delete purchase order with id ${id}.`;
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    orders,
    loading,
    error,
    pagination,
    statusSummary,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
  };
});
