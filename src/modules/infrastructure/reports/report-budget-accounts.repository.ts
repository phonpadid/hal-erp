import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ReportBudgetAccountsRepository } from "@/modules/domain/repository/reports/report-budget-accounts.repository";

export interface BudgetAccountsReportData {
  status_code: number;
  message: string;
  data: Array<{
    id: number;
    company_id: number;
    department_id: string;
    code: string;
    name: string;
    type: string;
    fiscal_year: number;
    allocated_amount: number;
    used_amount: number;
    balance_amount: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }>;
}

export class ApiReportBudgetAccountsRepository implements ReportBudgetAccountsRepository {
  async getReportToUseBudget(companyId: number, fiscalYear: number): Promise<BudgetAccountsReportData> {
    try {
      const response = await api.get('/budget-accounts/report-to-use-budget', {
        params: {
          company_id: companyId,
          fiscal_year: fiscalYear
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error, "Failed to fetch budget accounts report to use budget data");
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