import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type {
  VendorInterface,
  VendorCreateInteface,
  VendorUpdateIntrface,
} from "@/modules/interfaces/vendors/vendor/vendor.interfacce";
import type { VendorsEntity } from "@/modules/domain/entities/vendors/vendor/vendors.entities";
import type { PaginationParams } from "@/modules/shared/pagination";
import { VendorServiceImpl } from "@/modules/application/services/vendors/vendor/vendor.service";
import { ApiVendorsRepository } from "@/modules/infrastructure/vendors/api-vendor.repository";

// Create vendor service instance
const createVendorService = () => {
  const vendorRepository = new ApiVendorsRepository();
  return new VendorServiceImpl(vendorRepository);
};

export const useVendorStore = defineStore("vendor", () => {
  // Service
  const vendorService = createVendorService();

  // State
  const vendors: Ref<VendorsEntity[]> = ref([]);
  const currentVendor: Ref<VendorsEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeVendors = computed(() => vendors.value.filter((vendor) => !vendor.isDeleted()));
  const inactiveVendors = computed(() => vendors.value.filter((vendor) => vendor.isDeleted()));
  const totalActiveVendors = computed(() => activeVendors.value.length);
  const totalInactiveVendors = computed(() => inactiveVendors.value.length);

  // Actions
  const fetchVendors = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await vendorService.getAllVendors(params);
      vendors.value = result.data;
      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };
      return {
        data: result.data.map(vendorEntityToInterface),
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchVendorById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const vendor = await vendorService.getVendorsById(id);
      currentVendor.value = vendor;
      return vendor ? vendorEntityToInterface(vendor) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createVendor = async (vendorData: VendorCreateInteface) => {
    loading.value = true;
    error.value = null;

    try {
      const vendor = await vendorService.createVendors(vendorData);
      vendors.value = [vendor, ...vendors.value];
      return vendorEntityToInterface(vendor);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateVendor = async (id: string, vendorData: VendorUpdateIntrface) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedVendor = await vendorService.updateVendors(id, vendorData);
      const index = vendors.value.findIndex((v) => v.getId() === id);
      if (index !== -1) {
        vendors.value[index] = updatedVendor;
      }
      if (currentVendor.value && currentVendor.value.getId() === id) {
        currentVendor.value = updatedVendor;
      }

      return vendorEntityToInterface(updatedVendor);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteVendor = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await vendorService.deleteVendors(id);
      if (result) {
        const index = vendors.value.findIndex((v) => v.getId() === id);
        if (index !== -1) {
          vendors.value[index].delete();
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

  // Helper function to convert Entity to Interface
  const vendorEntityToInterface = (vendor: VendorsEntity): VendorInterface => {
    return {
      id: vendor.getId(),
      name: vendor.getname(),
      contact_info: vendor.getcontact_info(),
      created_at: vendor.getcreated_at(),
      updated_at: vendor.getupdated_at(),
      deleted_at: vendor.getdeleted_at(),
    };
  };

  // Reset state
  const resetState = () => {
    vendors.value = [];
    currentVendor.value = null;
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
    vendors,
    currentVendor,
    loading,
    error,
    pagination,

    // Getters
    activeVendors,
    inactiveVendors,
    totalActiveVendors,
    totalInactiveVendors,

    // Actions
    fetchVendors,
    fetchVendorById,
    createVendor,
    updateVendor,
    deleteVendor,
    resetState,
  };
});
