/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/infrastructure/auth/api-auth.repository.ts
import { api } from "@/common/config/axios/axios";
import type { AuthRepository } from "@/modules/domain/repository/auth/auth.repository";
import type {
  LoginDTO,
  AuthResponseDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
} from "@/modules/application/dtos/auth/auth.dto";
import { AuthEntity } from "@/modules/domain/entities/auth/auth.entity";
import type { AxiosError } from "axios";

export class ApiAuthRepository implements AuthRepository {
  private readonly baseUrl = "/users";

  async login(credentials: LoginDTO): Promise<AuthEntity> {
    try {
      const response = (await api.post(`${this.baseUrl}/login`, credentials)) as {
        data: AuthResponseDTO;
      };

      if (response.data.status_code !== 201) {
        throw new Error(response.data.message);
      }
      localStorage.setItem("userType", JSON.stringify(response?.data?.data?.user?.user_type ?? []));
      return this.toEntity(response.data.data);
    } catch (error) {
      throw this.handleError(error as AxiosError, "Login failed");
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/logout`);
    } catch (error) {
      throw this.handleError(error as AxiosError, "Logout failed");
    }
  }

  async forgotPassword(payload: ForgotPasswordDTO): Promise<{ message: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/forgot-password`, {
        email: payload.email,
      });
      const data = response.data as { message?: string };
      return { message: data?.message || "" };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; errorKey?: string }>;
      const errData = axiosError.response?.data;
      const err = new Error(
        errData?.message || "Failed to request password reset"
      ) as Error & { errorKey?: string };
      err.errorKey = errData?.errorKey;
      throw err;
    }
  }

  async resetPassword(payload: ResetPasswordDTO): Promise<{ message: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/reset-password`, {
        token: payload.token,
        new_password: payload.new_password,
        confirm_password: payload.confirm_password,
      });
      const data = response.data as { message?: string };
      return { message: data?.message || "" };
    } catch (error) {
      const axiosError = error as AxiosError<{
        message?: string;
        errorKey?: string;
        statusCode?: number;
      }>;
      const errData = axiosError.response?.data;
      const err = new Error(
        errData?.message || "Failed to reset password"
      ) as Error & { errorKey?: string; statusCode?: number };
      err.errorKey = errData?.errorKey;
      err.statusCode = axiosError.response?.status;
      throw err;
    }
  }

  private toEntity(data: AuthResponseDTO["data"]): AuthEntity {
    const { user, access_token } = data;
    return new AuthEntity(
      user.id,
      user.username,
      user.email,
      user.tel,
      user.department_name,
      user.signature,
      user.roles,
      user.permission,
      user.user_type,
      user.created_at,
      user.updated_at,
      user.deleted_at,
      access_token,
      user.company
    );
  }

  private handleError(error: AxiosError, defaultMessage: string): Error {
    if (error.response) {
      const statusCode = error.response.status;
      const message = (error.response.data as any)?.message || defaultMessage;
      return new Error(`API Error (${statusCode}): ${message}`);
    }
    return error as Error;
  }
}
