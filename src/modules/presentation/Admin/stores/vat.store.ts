import type { UpdateVatDTO } from "@/modules/application/dtos/vat.dto";
import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import type { VatEntity } from "@/modules/domain/entities/vat.entity";
import { VatServiceImpl } from "@/modules/application/services/vat.service";
import { ApiVatRepository } from "@/modules/infrastructure/api-vat.repository";
import type { VatInterface } from "@/modules/interfaces/vat.interface";

const createVatService = () => {
  const vatRepository = new ApiVatRepository();
  return new VatServiceImpl(vatRepository);
};

export const useVatStore = defineStore("vat", () => {
  const vatService = createVatService();
  const vat: Ref<VatEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);

  const fetchVat = async () => {
    loading.value = true;
    error.value = null;
    try {
      const result = await vatService.getVat();
      vat.value = result ?? null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchVatById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const vatResult = await vatService.getVatById(id);
      vat.value = vatResult;
      return vatResult ? vatEntityToInterface(vatResult) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateVat = async (id: string, vatData: UpdateVatDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedVat = await vatService.updateVat(id, vatData);
      vat.value = updatedVat;
      return vatEntityToInterface(updatedVat);
    } catch (err: unknown) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Exported mapping function
  const vatEntityToInterface = (
    vat: VatEntity
  ): VatInterface => {
    return {
      id: vat.getId(),
      amount: vat.getAmount(),
      created_at: vat.getCreatedAt(),
      updated_at: vat.getUpdatedAt(),
      deleted_at: vat.getDeletedAt(),
    };
  };

  return {
    vat,
    loading,
    error,
    fetchVat,
    updateVat,
    fetchVatById,
    vatEntityToInterface,
  };
});
