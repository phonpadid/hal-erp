import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export interface MailPreference {
  start_time: string;
  end_time: string;
  is_enabled: boolean;
}

export class ApiMailPreferenceRepository {
  private readonly baseUrl = "/users";

  async find(userId: string | number): Promise<MailPreference | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${userId}/mail-preference`);
      const data = response.data?.data;
      if (!data) return null;
      return {
        start_time: this.normalizeTime(data.start_time),
        end_time: this.normalizeTime(data.end_time),
        is_enabled: Boolean(data.is_enabled),
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to load mail preference for user ${userId}`);
    }
  }

  async save(userId: string | number, pref: MailPreference): Promise<MailPreference> {
    try {
      const payload = pref.is_enabled
        ? {
            is_enabled: true,
            start_time: pref.start_time,
            end_time: pref.end_time,
          }
        : { is_enabled: false };

      const response = await api.put(`${this.baseUrl}/${userId}/mail-preference`, payload);
      const data = response.data?.data ?? payload;
      return {
        start_time: this.normalizeTime(data.start_time) || pref.start_time,
        end_time: this.normalizeTime(data.end_time) || pref.end_time,
        is_enabled: Boolean(data.is_enabled),
      };
    } catch (error) {
      this.handleApiError(error, `Failed to save mail preference for user ${userId}`);
    }
  }

  private normalizeTime(value: unknown): string {
    if (typeof value !== "string" || value.length === 0) return "";
    const match = value.match(/^(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : value;
  }

  private normalizeDate(value: unknown): string | null {
    if (typeof value !== "string" || value.length === 0) return null;
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : value;
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const statusCode = axiosError.response.status;
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(`API Error (${statusCode}): ${serverMessage}`);
    } else if (axiosError.request) {
      throw new Error(
        "Network Error: The request was made but no response was received. Please check your connection."
      );
    }
    throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
  }
}
