import { api } from "@/common/config/axios/axios";
import type { AxiosResponse } from "axios";

// อัปเดต Interface ให้ตรงกับ API response จริง
interface UploadApiResponse {
  status_code: number;
  message: string;
  data: {
    filename: string;
  };
}

/**
 * Uploads a file to the /users/upload endpoint.
 * @param formData The FormData object containing the file.
 * @returns An object with the uploaded file's name.
 */
export const uploadFile = async (formData: FormData): Promise<{ fileName: string }> => {
  try {
    // 1. แก้ไข Key จาก 'file' เป็น 'image'
    // เนื่องจากมีไฟล์เดียว เราจะตรวจสอบและแก้ไข key ที่นี่
    if (formData.has("file")) {
      const file = formData.get("file");
      formData.delete("file");
      if (file) {
        formData.append("image", file); // << FIXED
      }
    }

    const response: AxiosResponse<UploadApiResponse> = await api.post("/users/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // 2. แก้ไข Path การเข้าถึง filename ให้ถูกต้อง
    const filename = response.data.data.filename; // << FIXED

    if (!filename) {
      throw new Error("Filename not found in API response.");
    }

    // เราจะคืนค่าเป็น object ที่มี key `fileName` เพื่อให้ component เดิมทำงานต่อได้
    return { fileName: filename };
  } catch (error) {
    console.error("Error uploading file in uploadService:", error);
    throw error;
  }
};
