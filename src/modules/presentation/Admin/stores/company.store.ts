import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { CompanyServiceImpl } from "@/modules/application/services/company.service";
import { ApiCompanyRepository } from "@/modules/infrastructure/api-company.repository";
import type { CompanyEntity } from "@/modules/domain/entities/company.entity";
import type { CreateCompanyDTO, UpdateCompanyDTO } from "@/modules/application/dtos/company.dto";
import type { PaginationParams } from "@/modules/shared/pagination";
import type { CompanyInterface } from "@/modules/interfaces/company.interface";

const createCompanyService = () => {
  const companyRepository = new ApiCompanyRepository();
  return new CompanyServiceImpl(companyRepository);
};

export const useCompanyStore = defineStore("company", () => {
  // service
  const companyService = createCompanyService();

  // State
  const companies: Ref<CompanyEntity[]> = ref([]);
  const currentCompany: Ref<CompanyEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeCompanies = computed(() =>
    companies.value.filter((c) => !c.isDeleted())
  );
  const inactiveCompanies = computed(() =>
    companies.value.filter((c) => c.isDeleted())
  );
  const totalActiveCompanies = computed(() => activeCompanies.value.length);
  const totalInactiveCompanies = computed(() => inactiveCompanies.value.length);

  // Convert Entity to Interface
  const CompanyEntityToInterface = (company: CompanyEntity): CompanyInterface => ({
    id: parseInt(company.getId()),
    name: company.getName(),
    logo: company.getLogo(),
    logo_url: company.getLogoUrl() || undefined,
    tel: company.getTel(),
    email: company.getEmail(),
    address: company.getAddress(),
    created_at: company.getCreatedAt(),
    updated_at: company.getUpdatedAt(),
    deleted_at: company.getDeletedAt(),
  });

  // Get All Companies
  const fetchCompanies = async (
    params: PaginationParams = { page: 1, limit: 10 }
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await companyService.getAllCompanies(params);
      companies.value = result.data;
      pagination.value = {
        page: result.page ?? 1,
        limit: result.limit ?? 10,
        total: result.total ?? 0,
        totalPages: result.totalPages ?? 0,
      };
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get Company By ID
  const fetchCompanyById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const company = await companyService.getCompanyById(id);
      currentCompany.value = company;
      return company ? CompanyEntityToInterface(company) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createCompany = async (companyData: CreateCompanyDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const company = await companyService.createCompany(companyData);
      companies.value = [company, ...companies.value];
      return CompanyEntityToInterface(company);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCompany = async (id: string, companyData: UpdateCompanyDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedCompany = await companyService.updateCompany(id, companyData);
      const index = companies.value.findIndex((c) => c.getId() === id);
      if (index !== -1) {
        companies.value[index] = updatedCompany;
      }
      // Update currentCompany if it's loaded
      if (currentCompany.value && currentCompany.value.getId() === id) {
        currentCompany.value = updatedCompany;
      }
      return CompanyEntityToInterface(updatedCompany);
    } catch (err: unknown) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCompany = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await companyService.deleteCompany(id);
      if (result) {
        const index = companies.value.findIndex((c) => c.getId() === id);
        if (index !== -1) {
          companies.value[index].delete();
        }
      }
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  // Reset state
  const resetState = () => {
    companies.value = [];
    currentCompany.value = null;
    error.value = null;
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
  };

  return {
    // State
    companies,
    currentCompany,
    loading,
    error,
    pagination,

    // Getters
    activeCompanies,
    inactiveCompanies,
    totalActiveCompanies,
    totalInactiveCompanies,

    // Actions
    fetchCompanies,
    fetchCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    resetState,
    setPagination,
  };
});