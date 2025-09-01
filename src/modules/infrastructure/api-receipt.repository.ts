import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ReceiptRepository } from "../domain/repository/receipt.repository";
import { ReceiptEntity } from "../domain/entities/receipts/receipt.entity";
import type { CreateReceiptDTO, ReciptQueryDto, UpdateReceiptDTO } from "../application/dtos/receipt.dto";
import { ReceiptItemEntity } from "../domain/entities/receipts/receipt-item.entity";

export class ApiReceiptRepository implements ReceiptRepository {
  private readonly baseUrl = "/receipts";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ReceiptEntity>> {
    try {
      const response = await api.get(this.baseUrl, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          sort_by: params.sortBy,
          include_deleted: includeDeleted,
        },
      });
      return {
        data: response.data.data.map((data: ReciptQueryDto) =>
          this.toDomainModel(data)
        ),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch budget accounts list");
    }
  }

  async findById(id: string): Promise<ReceiptEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find budget account with id ${id}`);
    }
  }

  async create(input: CreateReceiptDTO): Promise<ReceiptEntity> {
    try {
      const response = await api.post(this.baseUrl, {
        ...input,
      });

      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create budget account");
    }
  }

  async update(
    id: string,
    input: UpdateReceiptDTO[]
  ): Promise<ReceiptEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, {
        ...input,
      });

      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update budget account with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete budget account with id ${id}`);
    }
  }

  private toDomainModel(input: ReciptQueryDto): ReceiptEntity {
    // Create an array of ReceiptItemEntity instances
    const receiptItems = input.receipt_items
      ? input.receipt_items.map((item) =>
          new ReceiptItemEntity(
            item.id,
            item.purchase_order_item_id,
            item.payment_currency_id,
            item.payment_type,
            item.remark,
          )
        )
      : null;

    const res = new ReceiptEntity(
      input.id,
      input.purchase_order_id,
      input.documentType_id,
      input.remark,
      receiptItems,
      null, // document_type
      input.createdAt ?? "",
      input.updatedAt ?? ""
    );
    return res;
}


  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const serverMessage = axiosError.response.data?.message || defaultMessage;

      throw new Error(`${serverMessage}`);
    } else if (axiosError.request) {
      throw new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
