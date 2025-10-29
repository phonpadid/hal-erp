import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ReportPurchaseOrderRepository } from "@/modules/domain/repository/reports/report-purchase-order";
import type { IReportPo,IReportMoneyPo } from "@/modules/application/dtos/report/report-po.dto";

export class ApiReportPurchaseOrderRepository implements ReportPurchaseOrderRepository {
  private readonly baseUrl = "/reports/purchase-orders";
  async reportMoney(): Promise<IReportMoneyPo> {
    try {
      const response = await api.get('/reports/purchase-requests/money')
      return response.data.data
    } catch (error) {
      this.handleApiError(error, "Failed");
    }
  }
  async reportPo(
    params: PaginationParams,
  ): Promise<PaginatedResult<IReportPo>> {
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
   async reportPoExport(id: string): Promise<Blob> {
    try {
      const response = await api.get(`purchase-orders/export/${id}`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error, "Failed to export purchase order report");
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
