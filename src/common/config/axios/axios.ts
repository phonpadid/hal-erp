import axios, { type AxiosRequestConfig, type AxiosRequestHeaders } from "axios";
import { Modal, message } from "ant-design-vue";
import { t } from "../i18n/i18n.config";
const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;
const authAxios = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
const getCurrentLocale = () => {
  const lang = localStorage.getItem("locale") || "en";
  return lang === "la" ? "lo" : lang;
};
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || null;

    if (!config.headers) config.headers = {} as AxiosRequestHeaders;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    config.headers["Accept-Language"] = getCurrentLocale();
    // ตรวจสอบประเภทข้อมูลจาก data ของ request
    if (config.data && typeof config.data === "object" && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    } else if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Interceptor จัดการ Response Error (คงเดิม)
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      if (!error.response) {
        return Promise.reject(error);
      }

      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error("Bad Request:", data.message);
          // Modal.warning({
          //   title: t("messages.err"),
          //   content: data.message,
          //   closable: true,
          //   footer: null,
          // });
          break;
        case 401:
          console.warn("Unauthorized! Logging out...");
          localStorage.removeItem("access_token");
          window.location.href = "/login";
          break;
        case 403:
          Modal.error({
            title: "ທ່ານບໍ່ມີສິດເຂົ້າໃຊ້!",
            content: "ກະລຸນາຕິດຕໍ່ Admin",
            closable: true,
            footer: null,
          });
          break;
        case 404:
          console.error("API Not Found:", error.config.url);
          break;
        case 500:
          Modal.error({
            title: "ມີຂໍ້ຜິດພາດໃນ Server!",
            content: "ກະລຸນາລອງໃໝ່ອີກຄັ້ງ",
            closable: true,
            footer: null,
          });
          break;
        default:
          console.error("Unhandled Error:", error);
      }
    } catch (err) {
      console.error("Interceptor Error:", err);
    }

    return Promise.reject(error);
  }
);

// ✅ ปรับปรุง API wrapper โดยไม่ต้องใช้ addHeaders อีกต่อไป
export const authApi = {
  async post(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return await authAxios.post(url.startsWith("/") ? url : `/${url}`, data, config);
  },
};

export const api = {
  async get(url: string, config?: AxiosRequestConfig) {
    return await authAxios.get(url.startsWith("/") ? url : `/${url}`, config);
  },

  async post(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return await authAxios.post(url.startsWith("/") ? url : `/${url}`, data, config);
  },

  async put(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return await authAxios.put(url.startsWith("/") ? url : `/${url}`, data, config);
  },

  async delete(url: string, config?: AxiosRequestConfig) {
    return await authAxios.delete(url.startsWith("/") ? url : `/${url}`, config);
  },
};

export default authAxios;
