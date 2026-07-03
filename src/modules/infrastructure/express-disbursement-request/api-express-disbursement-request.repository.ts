 
import type { ApiListResponse } from "@/modules/shared/repondata";
import type { ApiResponse } from "@/modules/shared/messageApi";
import { ExpressDisbursementRequestEntity } from "@/modules/domain/entities/express-disbursement-request/express-disbursement-request.entity";
import { ExpressDisbursementRequestItemEntity } from "@/modules/domain/entities/express-disbursement-request/express-disbursement-request-item.entity";
import type { ExpressDisbursementRequestRepository } from "@/modules/domain/repository/express-disbursement-request/express-disbursement-request.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type {
  ExpressDisbursementRequestCreate,
  ExpressDisbursementRequestUpdate,
  ExpressDisbursementRequestModel,
} from "@/modules/interfaces/express-disbursement-request/express-disbursement-request.interface";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

// ---------------------------------------------------------------------------
// BACKEND CONTRACT (NOT YET IMPLEMENTED — see openspec change
// add-express-disbursement-request, task group 9). Base path and payload shapes
// below reflect the agreed contract; adjust once the API lands. Files are
// uploaded separately via the shared uploadFile util (same as Purchase Request),
// so create/update send already-uploaded `file_name` strings as JSON.
// ---------------------------------------------------------------------------

export class ApiExpressDisbursementRequestRepository
  implements ExpressDisbursementRequestRepository
{
  private readonly baseUrl = "/express-disbursement-requests";

  async findAll(
    params: PaginationParams
  ): Promise<PaginatedResult<ExpressDisbursementRequestEntity>> {
    try {
      const response = (await api.get(this.baseUrl, {
        params: { ...params },
      })) as { data: ApiListResponse<ExpressDisbursementRequestModel> };

      return {
        data: response.data.data.map((item) => this.toDomainModel(item)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
        status: response.data.status,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch express disbursement requests list");
    }
  }

  async findById(id: string): Promise<ExpressDisbursementRequestEntity | null> {
    try {
      const response = (await api.get(`${this.baseUrl}/${id}`)) as {
        data: ApiResponse<ExpressDisbursementRequestModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find express disbursement request with id ${id}`);
    }
  }

  async create(
    data: ExpressDisbursementRequestCreate
  ): Promise<ExpressDisbursementRequestEntity> {
    try {
      const response = (await api.post(this.baseUrl, data)) as {
        data: ApiResponse<ExpressDisbursementRequestModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create express disbursement request");
    }
  }

  async update(
    id: string,
    data: ExpressDisbursementRequestUpdate
  ): Promise<ExpressDisbursementRequestEntity> {
    try {
      const response = (await api.put(`${this.baseUrl}/${id}`, data)) as {
        data: ApiResponse<ExpressDisbursementRequestModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update express disbursement request with id ${id}`);
    }
  }

  private toDomainModel(
    data: ExpressDisbursementRequestModel
  ): ExpressDisbursementRequestEntity {
    const entity = new ExpressDisbursementRequestEntity(
      data.id != null ? data.id.toString() : null,
      data.purpose ?? "",
      data.user_approval?.document_status?.name || data.status || "pending",
      data.document_type ?? null,
      data.department ?? null,
      data.requester ?? null,
      data.position ?? null,
      data.company ?? null,
      data.user_approval ?? null,
      data.edr_number ?? null,
      data.created_at ?? null,
      data.updated_at ?? null,
      data.deleted_at ?? null,
      data.total ?? 0
    );

    if (Array.isArray(data.express_disbursement_request_items)) {
      const items = data.express_disbursement_request_items.map(
        (item) =>
          new ExpressDisbursementRequestItemEntity(
            item.id != null ? item.id.toString() : null,
            item.title,
            item.file_name ?? null,
            item.file_name_url ?? null,
            item.quantity,
            item.unit_id != null ? item.unit_id.toString() : "",
            null,
            item.price,
            item.total_price,
            null,
            item.remark || "",
            item.budget_item_id ?? null
          )
      );
      entity.setItems(items);
    }

    if (data.total != null) {
      entity.setTotal(data.total);
    }

    return entity;
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
