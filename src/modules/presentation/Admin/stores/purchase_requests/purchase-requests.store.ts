/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { ref } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
import type {
  CreatePurchaseRequestDTO,
  UpdatePurchaseRequestDTO,
  PurchaseRequestItemDTO,
} from "@/modules/application/dtos/purchase-requests/purchase-request.dto";
import type {
  PurchaseRequestItemParams,
  StatusSummary,
} from "@/modules/interfaces/purchase-requests/purchase-request.interface";
import { ApiPurchaseRequestRepository } from "@/modules/infrastructure/purchase_requests/api-purchase-request.repository";

const repository = new ApiPurchaseRequestRepository();

export const usePurchaseRequestsStore = defineStore("purchaseRequests", () => {
  const requests = ref<PurchaseRequestEntity[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const statusSummary = ref<StatusSummary[]>([]);

  function mapItemDTOToParams(dto: PurchaseRequestItemDTO): PurchaseRequestItemParams {
    return {
      title: dto.title,
      fileName: dto.file_name,
      quantity: dto.quantity,
      unitId: dto.unit_id,
      price: dto.price,
      remark: dto.remark,
      total: dto.quantity * dto.price,
      quotaId: dto.quota_company_id  // ✅ เพิ่มบรรทัดนี้!
    };
  }

  async function fetchAll(params: PaginationParams = { page: 1, limit: 10 }) {
    loading.value = true;
    error.value = null;
    try {
      // สมมติว่า repository.findAll return object ที่มี property 'status'
      const result: any = await repository.findAll(params);

      if (result) {
        requests.value = result.data;
        pagination.value = {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        };
        statusSummary.value = result.status || [];
        return result;
      }
    } catch (err: any) {
      error.value = err.message || "Failed to fetch purchase requests.";
    } finally {
      loading.value = false;
    }
  }

  async function fetchById(id: string): Promise<PurchaseRequestEntity | null> {
    loading.value = true;
    error.value = null;
    try {
      return await repository.findById(id);
    } catch (err: any) {
      error.value = err.message || `Failed to fetch purchase request with id ${id}.`;
      return null;
    } finally {
      loading.value = false;
    }
  }

  // ...

  async function create(data: CreatePurchaseRequestDTO): Promise<PurchaseRequestEntity | null> {
    loading.value = true;
    error.value = null;
    try {
      // แปลง DTO items เป็น format ที่ Entity ต้องการ
      const mappedItems = data.purchase_request_items.map(mapItemDTOToParams);

      const entity = PurchaseRequestEntity.createPurchaseRequestWithItems(
        data.document.documentTypeId,
        data.document.description,
        data.expired_date,
        data.purposes,
        mappedItems
      );

      return await repository.create(entity);
    } catch (err: any) {
      error.value = err.message || "Failed to create purchase request.";
      return null;
    } finally {
      loading.value = false;
    }
  }
  async function update(
    id: string,
    data: UpdatePurchaseRequestDTO
  ): Promise<PurchaseRequestEntity | null> {
    loading.value = true;
    error.value = null;
    try {
      // console.log("Store is sending this payload to repository:", data);
      return await repository.update(id, data);
    } catch (err: any) {
      error.value = err.message || "Failed to update purchase request.";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      return await repository.delete(id);
    } catch (err: any) {
      error.value = err.message || `Failed to delete purchase request with id ${id}.`;
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    requests,
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
