import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ReportPurchaseRequestRepository } from "@/modules/domain/repository/reports/report-purchase-request";
import type { IReportMoney, IReportPurchaseRequestDto, IReportReceiptMoney } from "@/modules/application/dtos/report/report-pr.dto";

export class ApiReportPurchaseRequestRepository implements ReportPurchaseRequestRepository {
  private readonly baseUrl = "/reports/purchase-requests";
  async reportMoney(): Promise<IReportMoney> {
    try {
      const response = await api.get(this.baseUrl + '/money')
      return response.data.data
    } catch (error) {
      this.handleApiError(error, "Failed");
    }
  }
  async reportReceiptMoney(): Promise<IReportReceiptMoney> {
    try {
      const response = await api.get('/reports/receipts/money')
      return response.data.data
    } catch (error) {
      this.handleApiError(error, "Failed");
    }
  }

  async reportPr(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<IReportPurchaseRequestDto>> {
    try {
      const response = await api.get(this.baseUrl, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          sort_by: params.sortBy,
          order_date: params.order_date || "",
          department_id: params?.department_id || "",
          status_id: params?.status_id || "",
          requested_date_start: params?.requested_date_start || "",
          requested_date_end: params?.requested_date_end || "",
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
