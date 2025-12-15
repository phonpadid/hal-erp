import axios, { type AxiosRequestConfig, type AxiosRequestHeaders } from "axios";
import { Modal } from "ant-design-vue";
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

authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      if (!error.response) {
        console.error("Network Error:", error);
        return Promise.reject(error);
      }

      const { status, data, config } = error.response;

      // ✅ [DEBUG] แสดง Log ของทุก Error เพื่อการตรวจสอบ
      console.error(`[AXIOS ERROR] Status: ${status} | URL: ${config.url}`, data);

      // ✅ [เพิ่มใหม่] ตรวจสอบว่าเป็น Error จากหน้า Login หรือไม่
      if (config.url.includes("/users/login") && (status === 400 || status === 401)) {
        Modal.warning({
          title: "ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ", // "Login Failed"
          content: "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ! ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.", // "Email or password incorrect! Please try again."
          closable: true,
          footer: null,
        });
        // คืนค่า reject เพื่อให้ catch block ใน login store ทำงานต่อได้ แต่ไม่ทำอย่างอื่นใน interceptor
        return Promise.reject(error);
      }

      switch (status) {
        case 400:
          Modal.warning({
            title: "ມີບາງຢ່າງຜິດພາດ!",
            content: "ຂໍ້ມູນທີ່ສົ່ງໄປບໍ່ຖືກຕ້ອງ!",
            closable: true,
            footer: null,
          });
          break;
        case 401:
          Modal.warning({
            title: "ເຊສຊັນໝົດອາຍຸ!",
            content: "ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່ອີກຄັ້ງ.", // "กรุณาเข้าสู่ระบบใหม่อีกครั้ง"
            closable: true,
            footer: null,
          });
          console.warn("Unauthorized (401)! Logging out...");
          localStorage.removeItem("accessToken");
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
