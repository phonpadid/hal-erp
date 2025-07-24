import type { ApiListResponse } from "./../shared/repondata"
import type { BankApiModel } from "./../interfaces/bank.interface"
import type { ApiResponse } from "./../shared/messageApi"
import { Bank } from "../domain/entities/bank.entity"
import type { BankRepository } from "../domain/repository/bank.repository"
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination"
import { api } from "@/common/config/axios/axios"
import type { AxiosError } from "axios"

export class ApiBankRepository implements BankRepository {
  async create(input: Bank): Promise<Bank> {
    try {
      const response = (await api.post("/banks", this.toApiModel(input))) as {
        data: ApiResponse<BankApiModel>
      }
      return this.toDomainModel(response.data.data)
    } catch (error) {
      this.handleApiError(error, "Failed to create bank")
    }
  }

  async findById(id: string): Promise<Bank | null> {
    try {
      const response = (await api.get(`/banks/${id}`)) as { data: ApiResponse<BankApiModel> }
      return this.toDomainModel(response.data.data)
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        return null
      }
      this.handleApiError(error, `Failed to find bank with id ${id}`)
    }
  }

  async findByName(name: string): Promise<Bank | null> {
    try {
      const response = (await api.get("/banks", {
        params: { name }
      })) as { data: ApiListResponse<BankApiModel> }

      if (response.data.data.length === 0) {
        return null
      }

      return this.toDomainModel(response.data.data[0])
    } catch (error) {
      console.error(`Error finding bank by name '${name}':`, error)
      return null
    }
  }

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Bank>> {
    try {
      const response = (await api.get("/banks", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search })
        }
      })) as { data: ApiListResponse<BankApiModel> }

      const data = response.data.data.map((item) => this.toDomainModel(item))
      return {
        data,
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages
      }
    } catch (error) {
      this.handleApiError(error, "Failed to fetch banks list")
    }
  }

  async update(input: Bank): Promise<Bank> {
    try {
      const response = (await api.put(`/banks/${input.getId()}`, this.toApiModel(input))) as {
        data: ApiResponse<BankApiModel>
      }
      return this.toDomainModel(response.data.data)
    } catch (error) {
      this.handleApiError(error, `Failed to update bank with id ${input.getId()}`)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/banks/${id}`)
      return true
    } catch (error) {
      this.handleApiError(error, `Failed to delete bank with id ${id}`)
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await api.post(`/banks/${id}/restore`)
      return true
    } catch (error) {
      this.handleApiError(error, `Failed to restore bank with id ${id}`)
    }
  }

  private toApiModel(input: Bank): BankApiModel {
    return {
      id: input.getId(),
      name: input.getName(),
      short_name: input.getShortName(),
      logo: input.getLogo(),
      created_at: input.getCreatedAt(),
      updated_at: input.getUpdatedAt(),
      deleted_at: input.getDeletedAt()
    }
  }

  private toDomainModel(data: BankApiModel): Bank {
    return new Bank(
      data.id,
      data.name,
      data.short_name,
      data.logo ?? null,
      data.created_at,
      data.updated_at,
      data.deleted_at ?? null
    )
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{ message?: string }>

    if (axiosError.response) {
      const statusCode = axiosError.response.status
      const serverMessage = axiosError.response.data?.message || defaultMessage
      throw new Error(`API Error (${statusCode}): ${serverMessage}`)
    } else if (axiosError.request) {
      throw new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      )
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`)
    }
  }
}
