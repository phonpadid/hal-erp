import { api } from "@/common/config/axios/axios";
import type {
  HalGroupReportResponse,
  HalGroupReportParams,
  HalGroupStateResponse
} from "@/modules/infrastructure/reports/report-hal.repository";

export class ReportHalService {
  private readonly basePath = "/budget-accounts";

  /**
   * Get HAL groups monthly budget report
   */
  async getReportHalGroupsMonthlyBudget(
    params?: HalGroupReportParams
  ): Promise<HalGroupReportResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.company_id) {
        queryParams.append("company_id", params.company_id.toString());
      }

      if (params?.departmentId) {
        queryParams.append("departmentId", params.departmentId);
      }

      if (params?.fiscal_year) {
        queryParams.append("fiscal_year", params.fiscal_year.toString());
      }

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.basePath}/report-hal-groups-monthly-budget?${queryString}`
        : `${this.basePath}/report-hal-groups-monthly-budget`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching HAL groups report:", error);
      throw error;
    }
  }

  /**
   * Get report without parameters (default)
   */
  async getDefaultReport(): Promise<HalGroupReportResponse> {
    return this.getReportHalGroupsMonthlyBudget();
  }

  /**
   * Get HAL group state summary data
   */
  async getReportHalGroupState(): Promise<HalGroupStateResponse> {
    try {
      const response = await api.get("/companies/report-hal-group-state");
      return response.data;
    } catch (error) {
      console.error("Error fetching HAL group state report:", error);
      throw error;
    }
  }
}