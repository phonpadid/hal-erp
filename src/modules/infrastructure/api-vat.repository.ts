import type { VatRepository } from "@/modules/domain/repository/vat.repository";
import { VatEntity } from "@/modules/domain/entities/vat.entity";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { UpdateVatDTO } from "@/modules/application/dtos/vat.dto";

export class ApiVatRepository implements VatRepository {
  private readonly baseUrl = "/vat";

  async findById(id: string): Promise<VatEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      return this.handleApiError(error, `Failed to find VAT with id ${id}`);
    }
  }

  async update(id: string, updateVatDTO: UpdateVatDTO): Promise<VatEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, updateVatDTO);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update VAT with id ${id}`);
    }
  }

  async findOne(): Promise<VatEntity | null> {
    try {
      const response = await api.get(this.baseUrl);
      if (response.data.data) {
        return this.toDomainModel(response.data.data);
      }
      return null;
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch VAT");
    }
  }

  private toDomainModel(vat: any): VatEntity {
    return new VatEntity(
      vat.id?.toString() ?? "",
      vat.amount ?? 0,
      vat.created_at ?? "",
      vat.updated_at ?? "",
      vat.deleted_at ?? null
    );
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(serverMessage);
    } else if (axiosError.request) {
      throw new Error(
        "Network Error: The request was made but no response was received. Please check your connection."
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
