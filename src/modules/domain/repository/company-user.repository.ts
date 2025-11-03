import type { CompanyUserInterface, CompanyUserListPayload, CompanyUserCreatePayload, CompanyUserUpdatePayload } from "@/modules/interfaces/company-user.interface";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface ICompanyUserRepository {
  // Get all company users with pagination and search
  getAll(params: CompanyUserListPayload & PaginationParams): Promise<PaginatedResult<CompanyUserInterface>>;

  // Get company user by ID
  getById(id: number): Promise<CompanyUserInterface>;

  // Create new company user
  create(data: CompanyUserCreatePayload): Promise<CompanyUserInterface>;

  // Update existing company user
  update(data: CompanyUserUpdatePayload): Promise<CompanyUserInterface>;

  // Delete (soft delete) company user
  delete(id: number): Promise<void>;

  // Get available roles for company users
  getAvailableRoles(companyId: number): Promise<any[]>;

  // Get available permissions for company users
  getAvailablePermissions(companyId: number): Promise<any[]>;

  // Check if username exists within company
  usernameExists(username: string, companyId: number, excludeId?: number): Promise<boolean>;

  // Check if email exists within company
  emailExists(email: string, companyId: number, excludeId?: number): Promise<boolean>;

  // Check if tel exists within company
  telExists(tel: string, companyId: number, excludeId?: number): Promise<boolean>;
}