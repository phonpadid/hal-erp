/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiListResponse } from "@/modules/shared/repondata";
import type { ApiResponse } from "@/modules/shared/messageApi";
import { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
import { PurchaseRequestItemEntity } from "@/modules/domain/entities/purchase-requests/purchase-request-item.entity";
import type { PurchaseRequestRepository } from "@/modules/domain/repository/purchase-requests/purchase-request.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

interface PurchaseRequestItemApiModel {
  id?: string;
  title: string;
  file_name: string | null;
  file_name_url?: string;
  quantity: number;
  unit_id: number;
  price: number;
  total_price: number;
  remark: string;
  quota_company_id?: number;
  quota_company?: {
    vendor?: {
      id: number;
      name: string;
      contact_info: string;
      created_at: string;
      updated_at: string;
    };
  };
  unit?: { name: string };
}
interface PurchaseRequestApiModel {
  id?: string;
  document: {
    id: number;
    description: string;
    documentTypeId: number;
    department: any;
    requester: any;
    position: any[] | null;
    document_type: any;
  };
  pr_number?: string;
  requested_date?: string;
  expired_date: string;
  purposes: string;
  purchase_request_item: PurchaseRequestItemApiModel[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  is_created_po?: boolean;
  user_approval?: {
    id: number;
    document_id: number;
    status_id: number;
    approval_step: Array<{
      id: number;
      user_approval_id: number;
      step_number: number;
      approver_id: number;
      status_id: number;
      remark: string;
    }>;
    document_status: {
      id: number;
      name: string;
    };
  };
  total: number;
  company?: {
    id: number;
    name: string;
    logo: string;
    logo_url: string;
    tel: string;
    email: string;
    address: string;
    created_at: string;
    updated_at: string;
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

      // console.log("--- RAW API Response ---:", response.data.data);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find purchase request with id ${id}`);
    }
  }

  async findByToken(token: string): Promise<PurchaseRequestEntity | null> {
    try {
      const response = (await api.get(`/purchase-requests/by-token?token=${token}`)) as {
        data: ApiResponse<PurchaseRequestApiModel>;
      };

      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find purchase request with token ${token}`);
    }
  }

  // ใน class ApiPurchaseRequestRepository

  async findAll(params: PaginationParams): Promise<PaginatedResult<PurchaseRequestEntity>> {
    try {
      const response = (await api.get("/purchase-requests", {
        params: {
          ...params,
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

  async update(id: string, payload: any): Promise<PurchaseRequestEntity> {
    try {
      // console.log(`Repository updating ID: ${id} with payload:`, payload);
      const response = (await api.put(`/purchase-requests/${id}`, payload)) as {
        data: ApiResponse<PurchaseRequestApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update purchase request with id ${id}`);
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
      total: input.getTotal(),
      purchase_request_items:
        input.getItems()?.map((item) => ({
          title: item.getTitle(),
          file_name: item.getFileName(),
          quantity: item.getQuantity(),
          unit_id: Number(item.getUnitId()),
          price: item.getPrice(),
          remark: item.getRemark() || "",
          quota_company_id: item.getQuotaId(),
        })) || [],
    };
  }
  private toDomainModel(data: PurchaseRequestApiModel): PurchaseRequestEntity {
    // console.log("API Response data:", data);
    const positionData =
      data.document && Array.isArray(data.document.position) && data.document.position.length > 0
        ? data.document.position[0]
        : null;

    const purchaseRequest = new PurchaseRequestEntity(
      data.id || null,
      data.document?.documentTypeId ?? 0,
      data.document?.description ?? "",
      data.pr_number || null,
      data.requested_date || null,
      data.expired_date,
      data.purposes,
      data.user_approval?.document_status?.name || "pending",
      data.document?.document_type,
      data.document?.department,
      data.document?.requester,
      positionData,
      data.company || null,
      data.user_approval,
      data.created_at || null,
      data.updated_at || null,
      data.deleted_at || null,
      data.total,
      data.is_created_po || false
    );

    if (data.purchase_request_item) {
      // console.log('API item data:', data.purchase_request_item);
      const items = data.purchase_request_item.map((item: any) => {
        // Store the vendor data in the entity for later use
        const purchaseRequestItem = new PurchaseRequestItemEntity(
          item.id,
          item.title,
          item.file_name,
          item.file_name_url,
          item.quantity,
          item.unit_id.toString(),
          item.unit,
          item.price,
          item.total_price,
          null,
          item.remark || "",
          item.quota_company_id || null
        );

        // Add vendor data to the entity as a custom property
        if (item.quota_company?.vendor) {
          (purchaseRequestItem as any).vendor = item.quota_company.vendor;
        }

        return purchaseRequestItem;
      });
      purchaseRequest.setItems(items);
    }

    if (data.total) {
      purchaseRequest.setTotal(data.total);
    }
    // console.log('API Response user_approval:', data.user_approval);
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
