import type { ApiListResponse } from "./../shared/repondata";
import type { UnitApiModel } from "./../interfaces/unit.interface";
import type { ApiResponse } from "./../shared/messageApi";
import { Unit } from "../domain/entities/unit.entities";
import type { UnitRepository } from "../domain/repository/unit.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiUnitRepository implements UnitRepository {
  async create(unit: Unit): Promise<Unit> {
    try {
      const response = (await api.post("/unit", this.toApiModel(unit))) as {
        data: ApiResponse<UnitApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create unit");
    }
  }

  async findById(id: string): Promise<Unit | null> {
    try {
      const response = (await api.get(`/contact/${id}`)) as { data: ApiResponse<UnitApiModel> };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find unit with id ${id}`);
    }
  }

  async findByName(name: string): Promise<Unit | null> {
    try {
      const response = (await api.get("/contact", {
        params: { name },
      })) as { data: ApiListResponse<UnitApiModel> };

      if (response.data.data.length === 0) {
        return null;
      }

      return this.toDomainModel(response.data.data[0]);
    } catch (error) {
      // กรณีนี้เราคืน null แทนที่จะโยน error เพราะถือว่าไม่พบข้อมูล
      console.error(`Error finding unit by name '${name}':`, error);
      return null;
    }
  }

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Unit>> {
    try {
      const response = (await api.get("/contact", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      })) as { data: ApiListResponse<UnitApiModel> };

      return {
        data: response.data.data.map((item) => this.toDomainModel(item)),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: Math.ceil(response.data.total / response.data.limit),
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch units list");
    }
  }

  async update(unit: Unit): Promise<Unit> {
    try {
      const response = (await api.put(`/contact/${unit.getId()}`, this.toApiModel(unit))) as {
        data: ApiResponse<UnitApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update unit with id ${unit.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/contact/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete unit with id ${id}`);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await api.post(`/contact/${id}/restore`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to restore unit with id ${id}`);
    }
  }

  private toApiModel(unit: Unit): UnitApiModel {
    return {
      id: parseInt(unit.getId(), 10),
      name: unit.getName(),
      created_at: unit.getCreatedAt().toISOString(),
      updated_at: unit.getUpdatedAt().toISOString(),
    };
  }

  private toDomainModel(data: UnitApiModel): Unit {
    return new Unit(
      data.id.toString(),
      data.name,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  /**
   * จัดการข้อผิดพลาดจาก API ด้วยข้อความที่เหมาะสม
   */
  private handleApiError(error: unknown, defaultMessage: string): never {
    // ตรวจสอบว่าเป็น AxiosError หรือไม่
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      // กรณีได้รับ response จาก server แต่เป็น error status code
      const statusCode = axiosError.response.status;
      const serverMessage = axiosError.response.data?.message || defaultMessage;

      throw new Error(`API Error (${statusCode}): ${serverMessage}`);
    } else if (axiosError.request) {
      // กรณีไม่ได้รับ response จาก server (เช่น timeout, no internet)
      throw new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      // กรณีอื่นๆ
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
