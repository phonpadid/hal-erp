import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import { ReportHalService } from "@/modules/application/services/reports/report-hal.service";
import type { HalGroupReportResponse, HalGroupReportParams, HalGroupStateResponse } from "@/modules/infrastructure/reports/report-hal.repository";

const createReportHalService = () => {
  return new ReportHalService();
};

export const useReportHalStore = defineStore("report-hal-store", () => {
  // Service
  const service = createReportHalService();

  // State
  const reportData: Ref<HalGroupReportResponse | null> = ref(null);
  const stateData: Ref<HalGroupStateResponse | null> = ref(null);
  const loading = ref<boolean>(false);
  const stateLoading = ref<boolean>(false);
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

  const fetchReportHalGroupState = async (): Promise<void> => {
    stateLoading.value = true;
    error.value = null;

    try {
      stateData.value = await service.getReportHalGroupState();
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to fetch HAL group state";
      stateData.value = null;
      throw err;
    } finally {
      stateLoading.value = false;
    }
  };

  // Getters
  const getReportData = () => reportData.value;
  const getStateData = () => stateData.value;
  const getLoading = () => loading.value;
  const getStateLoading = () => stateLoading.value;
  const getError = () => error.value;

  // Budget Overruns
  const getBudgetOverruns = () => reportData.value?.data.budget_overruns || null;
  const getWithinBudget = () => reportData.value?.data.within_budget || null;

  // State Data Getters
  const getHalGroupStateData = () => stateData.value?.data || null;

  return {
    // State
    reportData,
    stateData,
    loading,
    stateLoading,
    error,

    // Actions
    fetchReportHalGroupsMonthlyBudget,
    fetchReportHalGroupState,

    // Getters
    getReportData,
    getStateData,
    getLoading,
    getStateLoading,
    getError,
    getBudgetOverruns,
    getWithinBudget,
    getHalGroupStateData,
  };
});