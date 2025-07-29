import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/modules/shared/messageApi";
import type { ApiListResponse } from "@/modules/shared/repondata";
import type { BudgetApprovalRuleRepository } from "@/modules/domain/repository/budget-approval-rules/budget-approval-rules.repository";
import { BudgetApprovalRuleEntity } from "@/modules/domain/entities/budget-approval-rules/budget-approver-rules.entity";
import type { BudgetApprovalRuleApiModel } from "@/modules/interfaces/budget-approval-rules/budget-approval-rule.interface";
import type { DepartmentApiModel } from "@/modules/interfaces/departments/department.interface";
import { UserEntity } from "@/modules/domain/entities/user.entities";
import { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { UserInterface } from "@/modules/interfaces/user.interface";

export class ApiBudgetApprovalRuleRepository implements BudgetApprovalRuleRepository {
  async create(input: BudgetApprovalRuleEntity): Promise<BudgetApprovalRuleEntity> {
    try {
      const response = (await api.post("/budget-approval-rules", this.toApiModel(input))) as {
        data: ApiResponse<BudgetApprovalRuleApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create");
    }
  }

  async findById(id: string): Promise<BudgetApprovalRuleEntity | null> {
    try {
      const response = (await api.get(`/budget-approval-rules/${id}`)) as {
        data: ApiResponse<BudgetApprovalRuleApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      return this.handleApiError(error, `Failed to find with id ${id}`);
    }
  }

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BudgetApprovalRuleEntity>> {
    try {
      const response = (await api.get("/budget-approval-rules", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      })) as { data: ApiListResponse<BudgetApprovalRuleApiModel> };
      const { pagination } = response.data;
      return {
        data: response.data.data.map((item) => this.toDomainModel(item)),
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.total_pages,
      };
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch list");
    }
  }

  async update(
    id: string,
    department: BudgetApprovalRuleEntity
  ): Promise<BudgetApprovalRuleEntity> {
    try {
      const response = (await api.put(
        `/budget-approval-rules/${id}`,
        this.toApiModel(department)
      )) as {
        data: ApiResponse<BudgetApprovalRuleApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update with id ${department.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/budget-approval-rules/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete with id ${id}`);
    }
  }

  private toApiModel(input: BudgetApprovalRuleEntity): BudgetApprovalRuleApiModel {
    return {
      id: input.getId() ?? "",
      department_id: Number(input.getDepartment_id()),
      approver_id: Number(input.getApprover_id()),
      min_amount: Number(input.getMin_amount()),
      max_amount: Number(input.getMax_amount()),
    };
  }

  private toDomainModel(data: BudgetApprovalRuleApiModel): BudgetApprovalRuleEntity {
    return new BudgetApprovalRuleEntity(
      data.id.toString(),
      data.department_id.toString(),
      data.approver_id.toString() || "",
      data.min_amount.toString(),
      data.max_amount.toString(),
      data.department ? this.toDepartmentEntity(data.department) : undefined,
      data.approver ? this.toUserEntity(data.approver) : undefined,
      data.created_at || "",
      data.updated_at || ""
    );
  }

  private toUserEntity(user: UserInterface): UserEntity {
    const roleIds = user.roles?.map((role) => role.id) || [];
    const permissionIds = user.permissions?.map((perm) => perm.id) || [];
    const roles = user.roles || [];
    return new UserEntity(
      user.id.toString(),
      user.username,
      user.email,
      roleIds,
      roles,
      permissionIds,
      user.created_at || "",
      user.updated_at || "",
      user.deleted_at || null,
      user.password,
      user.tel
    );
  }

  private toDepartmentEntity(departmentData: DepartmentApiModel): DepartmentEntity {
    return new DepartmentEntity(
      departmentData.id.toString(),
      departmentData.name,
      departmentData.code ?? "",
      departmentData.created_at ?? "",
      departmentData.updated_at ?? ""
    );
  }

  private handleApiError<T>(error: unknown, defaultMessage: string): T {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(`${serverMessage}`);
    } else if (axiosError.request) {
      throw new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
