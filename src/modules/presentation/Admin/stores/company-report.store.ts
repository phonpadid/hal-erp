import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ReportCompanyService } from "@/modules/application/services/reports/report-company.service";

export interface CompanyReportStatistics {
  total_companies: number;
  total_allocated: number;
  total_users: number;
}

export const useCompanyReportStore = defineStore("companyReport", () => {
  const reportService = new ReportCompanyService();

  // State
  const statistics = ref<CompanyReportStatistics | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const hasData = computed(() => statistics.value !== null);

  // Actions
  const fetchReportStatistics = async (): Promise<CompanyReportStatistics | null> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await reportService.getCompanyReport();
      statistics.value = response.data;
      return response.data;
    } catch (err) {
      console.error("Error fetching company report statistics:", err);
      error.value = err instanceof Error ? err.message : "Failed to fetch statistics";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const clearData = () => {
    statistics.value = null;
    error.value = null;
  };

  return {
    // State
    statistics,
    loading,
    error,

    // Getters
    hasData,

    // Actions
    fetchReportStatistics,
    clearData
  };
});