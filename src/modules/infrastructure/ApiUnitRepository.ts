import { Unit } from "../domain/entities/Unit";
import type { UnitRepository } from "../domain/repository/UnitRepository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/paagination";
import { api } from "@/common/config/axios/axios";

export class ApiUnitRepository implements UnitRepository {
  async create(unit: Unit): Promise<Unit> {
    const response = await api.post("/contact", this.toApiModel(unit));
    return this.toDomainModel(response.data);
  }

  async findById(id: string): Promise<Unit | null> {
    try {
      const response = await api.get(`/contact/${id}`);
      return this.toDomainModel(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findByName(name: string): Promise<Unit | null> {
    try {
      const response = await api.get("/contact", {
        params: { name },
      });

      if (response.data.data.length === 0) {
        return null;
      }

      return this.toDomainModel(response.data.data[0]);
    } catch (error) {
      return null;
    }
  }

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Unit>> {
    const response = await api.get("/contact", {
      params: {
        page: params.page,
        limit: params.limit,
        includeDeleted,
      },
    });

    return {
      data: response.data.data.map((item: any) => this.toDomainModel(item)),
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
      totalPages: Math.ceil(response.data.total / response.data.limit),
    };
  }

  async update(unit: Unit): Promise<Unit> {
    const response = await api.put(`/contact/${unit.getId()}`, this.toApiModel(unit));
    return this.toDomainModel(response.data);
  }

  async delete(id: string): Promise<boolean> {
    await api.delete(`/contact/${id}`);
    return true;
  }

  async restore(id: string): Promise<boolean> {
    await api.post(`/contact/${id}/restore`);
    return true;
  }

  private toApiModel(unit: Unit): any {
    return {
      id: unit.getId(),
      name: unit.getName(),
      created_at: unit.getCreatedAt().toISOString(),
      updated_at: unit.getUpdatedAt().toISOString(),
      deleted_at: unit.getDeletedAt()?.toISOString() || null,
    };
  }

  private toDomainModel(data: any): Unit {
    return new Unit(
      data.id,
      data.name,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.deleted_at ? new Date(data.deleted_at) : null
    );
  }
}
