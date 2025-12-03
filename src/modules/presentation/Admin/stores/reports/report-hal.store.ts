import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import { ReportHalService } from "@/modules/application/services/reports/report-hal.service";
import type { HalGroupReportResponse, HalGroupReportParams } from "@/modules/infrastructure/reports/report-hal.repository";

const createReportHalService = () => {
  return new ReportHalService();
};

export const useReportHalStore = defineStore("report-hal-store", () => {
  // Service
  const service = createReportHalService();

  // State
  const reportData: Ref<HalGroupReportResponse | null> = ref(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Actions
  const fetchReportHalGroupsMonthlyBudget = async (params?: HalGroupReportParams): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      reportData.value = await service.getReportHalGroupsMonthlyBudget(params);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to fetch HAL groups report";
      reportData.value = null;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Getters
  const getReportData = () => reportData.value;
  const getLoading = () => loading.value;
  const getError = () => error.value;

  // Budget Overruns
  const getBudgetOverruns = () => reportData.value?.data.budget_overruns || null;
  const getWithinBudget = () => reportData.value?.data.within_budget || null;

  return {
    // State
    reportData,
    loading,
    error,

    // Actions
    fetchReportHalGroupsMonthlyBudget,

    // Getters
    getReportData,
    getLoading,
    getError,
    getBudgetOverruns,
    getWithinBudget,
  };
});