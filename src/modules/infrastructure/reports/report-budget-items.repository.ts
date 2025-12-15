import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ReportBudgetItemsRepository } from "@/modules/domain/repository/reports/report-budget-items.repository";

export interface BudgetItemsReportData {
  status_code: number;
  message: string;
  data: {
    current_page: number;
    data: Array<{
      id: number;
      budget_account_id: number;
      name: string;
      description: string;
      allocated_amount: number;
      used_amount: number;
      balance_amount: number;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    }>;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface BudgetItemsParams {
  page?: number;
  limit?: number;
  column?: string;
  sort_order?: 'ASC' | 'DESC';
  search?: string;
  budget_account_id?: string;
  department_id?: string;
  fiscal_year?: number;
  company_id?: number;
}

export class ApiReportBudgetItemsRepository implements ReportBudgetItemsRepository {
  async getBudgetItemsReport(params: BudgetItemsParams): Promise<BudgetItemsReportData> {
    try {
      const response = await api.get('/budget-items', { params });
      return response.data;
    } catch (error) {
      this.handleApiError(error, "Failed to fetch budget items report data");
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