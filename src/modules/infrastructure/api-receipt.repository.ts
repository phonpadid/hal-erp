import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ReceiptRepository } from "../domain/repository/receipt.repository";
import { ReceiptEntity } from "../domain/entities/receipts/receipt.entity";
import type { CreateReceiptDTO, IApprovalReceiptDto, IReportReceiptCount, ReciptQueryDto, UpdateReceiptDTO } from "../application/dtos/receipt.dto";
import { ReceiptItemEntity } from "../domain/entities/receipts/receipt-item.entity";

export class ApiReceiptRepository implements ReceiptRepository {
  private readonly baseUrl = "/receipts";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ReciptQueryDto>> {
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
      const result = response.data.data;
      return {
        data: result,
        status: response.data.status ?? [],
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch budget accounts list");
    }
  }

  async findById(id: string): Promise<ReciptQueryDto | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data;
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
        purchase_order_id: Number(input.purchase_order_id),
        remark: input.remark,
        document: {
          description: "",
          documentTypeId: Number(input.documentType_id)
        },
        receipt_items: input.receipt_items.map((item) => ({
            purchase_order_item_id: Number(item.purchase_order_item_id),
            payment_currency_id: Number(item.payment_currency_id),
            payment_type: item.payment_type, //transfer or cash
            remark: item.remark
        }))
      });
      return response.data.data;
    } catch (error) {
      this.handleApiError(error, "Failed to create budget account");
    }
  }
  async approval(id: number, input: IApprovalReceiptDto): Promise<IApprovalReceiptDto> {
    try {
      // Create payload object with all fields
      const fullPayload = {
        type: input.type,
        statusId: input.statusId,
        is_otp: input.is_otp,
        otp: input.otp,
        approval_id: input.approval_id,
        account_code: input.account_code,
        files: input.files && input.files.length > 0 ? input.files.map((file) => file) : undefined,
        remark: input.remark,
      };

      // Filter out null, undefined, and empty values
      const payload = Object.fromEntries(
        Object.entries(fullPayload).filter(([ value]) =>
          value !== null && value !== undefined && value !== ''
        )
      );

      const response = await api.post('approve-step/' + id, payload);

      return response.data.data;
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
  async reportMenu(type: string): Promise<IReportReceiptCount> {
    try {
      const res = await api.get(`count?type=${type}`);
      return res.data.data
    } catch (error) {
      this.handleApiError(error, `Failed to delete budget account with id ${type}`);
    }
  }

  private toDomainModel(input: ReciptQueryDto): ReceiptEntity {

    // Create an array of ReceiptItemEntity instances
    const receiptItems = input.receipt_item
      ? input.receipt_item.map((item) =>
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
      input.document_id,
      input.remark,
      receiptItems,
      null, // document_type
      input.created_at ?? "",
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
