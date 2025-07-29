/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiListResponse } from "@/modules/shared/repondata";
import type { ApiResponse } from "@/modules/shared/messageApi";
import { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
import { PurchaseRequestItemEntity } from "@/modules/domain/entities/purchase-requests/purchase-request-item.entity";
import type { PurchaseRequestRepository } from "@/modules/domain/repository/purchase-requests/purchase-request.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

// API Model Interfaces
interface PurchaseRequestItemApiModel {
  id?: string;
  title: string;
  file_name: string | null;
  quantity: number;
  unit_id: number;
  price: number;
  total_price: number;
  remark: string;
}
interface PurchaseRequestApiModel {
  id?: string;
  document: {
    id: number;
    description: string;
    documentTypeId: number;
    department: {
      id: number;
      code: string;
      name: string;
    };
    requester: {
      id: number;
      username: string;
      email: string;
    };
    position: {
      id: number;
      name: string;
    };
    document_type: {
      id: string;
      code: string;
      name: string;
    };
  };
  pr_number?: string;
  requested_date?: string;
  expired_date: string;
  purposes: string;
  purchase_request_items: PurchaseRequestItemApiModel[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  user_approval?: {
    document_status: {
      id: number;
      name: string;
    };
  };
}

export class ApiPurchaseRequestRepository implements PurchaseRequestRepository {
  async create(input: PurchaseRequestEntity): Promise<PurchaseRequestEntity> {
    try {
      const response = (await api.post("/purchase-requests", this.toApiModel(input))) as {
        data: ApiResponse<PurchaseRequestApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create purchase request");
    }
  }

  async findById(id: string): Promise<PurchaseRequestEntity | null> {
    try {
      const response = (await api.get(`/purchase-requests/${id}`)) as {
        data: ApiResponse<PurchaseRequestApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find purchase request with id ${id}`);
    }
  }

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<PurchaseRequestEntity>> {
    try {
      const response = (await api.get("/purchase-requests", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      })) as { data: ApiListResponse<PurchaseRequestApiModel> };

      return {
        data: response.data.data.map((item) => this.toDomainModel(item)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
        status: response.data.status,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch purchase requests list");
    }
  }

  async update(input: PurchaseRequestEntity): Promise<PurchaseRequestEntity> {
    try {
      const response = (await api.put(
        `/purchase-requests/${input.getId()}`,
        this.toApiModel(input)
      )) as {
        data: ApiResponse<PurchaseRequestApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update purchase request with id ${input.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/purchase-requests/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete purchase request with id ${id}`);
    }
  }

  private toApiModel(input: PurchaseRequestEntity): any {
    return {
      document: {
        description: input.getDocumentDescription(),
        documentTypeId: Number(input.getDocumentId()),
      },
      expired_date: input.getExpiredDate(),
      purposes: input.getPurposes(),

      purchase_request_items:
        input.getItems()?.map((item) => ({
          title: item.getTitle(),
          file_name: item.getFileName(),
          quantity: item.getQuantity(),
          unit_id: Number(item.getUnitId()),
          price: item.getPrice(),

          remark: item.getRemark() || "",
        })) || [],
    };
  }
  private toDomainModel(data: PurchaseRequestApiModel): PurchaseRequestEntity {
    const purchaseRequest = new PurchaseRequestEntity(
      data.id || null,
      data.document ? data.document.documentTypeId : 0,
      data.document ? data.document.description : "",
      data.pr_number || null,
      data.requested_date || null,
      data.expired_date,
      data.purposes,
      data.user_approval?.document_status?.name || "pending",
      data.document ? data.document.document_type : undefined,
      data.document ? data.document.department : undefined,
      data.document ? data.document.requester : undefined,
      data.document ? data.document.position : undefined,
      data.created_at || null,
      data.updated_at || null,
      data.deleted_at || null
    );

    if (data.purchase_request_items) {
      const items = data.purchase_request_items.map((item) =>
        PurchaseRequestItemEntity.create(
          item.title,
          item.file_name,
          item.quantity,
          item.unit_id.toString(),
          item.price,
          item.total_price,
          item.remark || ""
        )
      );
      purchaseRequest.setItems(items);
    }

    return purchaseRequest;
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const statusCode = axiosError.response.status;
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(`API Error (${statusCode}): ${serverMessage}`);
    } else if (axiosError.request) {
      throw new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
