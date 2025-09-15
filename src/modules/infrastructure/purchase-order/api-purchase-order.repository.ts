import { api } from "@/common/config/axios/axios";
import type { ApiListResponse } from "@/modules/shared/repondata";
import type { ApiResponse } from "@/modules/shared/messageApi";
import type { AxiosError } from "axios";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";
import type { PurchaseOrderRepository } from "@/modules/domain/repository/purchase-order/purchase-order.repository";
import type { PurchaseOrderApiModel } from "@/modules/interfaces/purchase-requests/purchase-orders.interface";
import { PurchaseOrderItemDataEntity } from "@/modules/domain/entities/purchase-order/purchase-order-Item-data.entity";

export class ApiPurchaseOrderRepository implements PurchaseOrderRepository {
  async create(input: PurchaseOrderEntity): Promise<PurchaseOrderEntity> {
    try {
      const response = (await api.post("/purchase-orders", this.toApiModel(input))) as {
        data: ApiResponse<PurchaseOrderApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      throw this.handleApiError(error, "Failed to create purchase order");
    }
  }

  async findById(id: number): Promise<PurchaseOrderEntity | null> {
    try {
      const response = (await api.get(`/purchase-orders/${id}`)) as {
        data: ApiResponse<PurchaseOrderApiModel>;
      };

      // console.log("--- RAW API Response ---:", response.data.data);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw this.handleApiError(error, `Failed to find purchase order with id ${id}`);
    }
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<PurchaseOrderEntity>> {
    try {
      // console.log("Repository findAll called with params:", params);

      const response = (await api.get("/purchase-orders", {
        params: {
          ...params,
        },
      })) as { data: ApiListResponse<PurchaseOrderApiModel> };

      // console.log("API Response:", response.data);

      const transformedData = {
        data: response.data.data.map((item) => {
          // console.log("Transforming item:", item);
          const entity = this.toDomainModel(item);
          // console.log("Transformed to entity:", entity);
          return entity;
        }),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
        status: response.data.status,
      };

      // console.log("Final transformed data:", transformedData);
      return transformedData;
    } catch (error) {
      console.error("Repository Error:", error);
      // ✅ แก้ไข: เพิ่ม throw เพื่อส่ง error ต่อไป
      throw this.handleApiError(error, "Failed to fetch purchase orders list");
    }
  }

  async update(id: number, purchaseOrder: PurchaseOrderEntity): Promise<PurchaseOrderEntity> {
    try {
      const payload = this.toApiModel(purchaseOrder);
      // console.log(`Repository updating ID: ${id} with payload:`, payload);

      const response = (await api.put(`/purchase-orders/${id}`, payload)) as {
        data: ApiResponse<PurchaseOrderApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      throw this.handleApiError(error, `Failed to update purchase order with id ${id}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await api.delete(`/purchase-orders/${id}`);
      return true;
    } catch (error) {
      throw this.handleApiError(error, `Failed to delete purchase order with id ${id}`);
    }
  }

  // private toApiModel(input: PurchaseOrderEntity): PurchaseOrderApiModel {
  //   const currentTimestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  //   const currentUser = "phonpadid";

  //   return {
  //     purchase_order_item: [],
  //     purchase_request_id: input.getPurchaseRequestId(),

  //     document: {
  //       description: input.getDocument().description,
  //       documentTypeId: input.getDocument().documentTypeId,
  //       created_by: currentUser,
  //       created_at: currentTimestamp,
  //       updated_by: currentUser,
  //       updated_at: currentTimestamp,
  //     },
  //     items: input.getItems().map((item) => {
  //       console.log("Converting item to API:", item);
  //       return {
  //         purchase_request_item_id: item.getPurchaseRequestItemId(),
  //         price: item.getPrice(),
  //         is_vat: item.getIsVat(),
  //         selected_vendor: [
  //           {
  //             vendor_id: item.getVendor().getVendorId(),
  //             vendor_bank_account_id: item.getVendor().getVendorBankAccountId(),
  //             filename: item.getVendor().getFilename(),
  //             reason: item.getVendor().getReason(),
  //             selected: true,
  //             created_by: currentUser,
  //             created_at: currentTimestamp,
  //           },
  //         ],
  //         created_by: currentUser,
  //         created_at: currentTimestamp,
  //         updated_by: currentUser,
  //         updated_at: currentTimestamp,
  //       };
  //     }),
  //     created_by: currentUser,
  //     created_at: currentTimestamp,
  //     updated_by: currentUser,
  //     updated_at: currentTimestamp,
  //   };
  // }
  private toApiModel(input: PurchaseOrderEntity): PurchaseOrderApiModel {
    const currentTimestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const currentUser = "phonpadid";

    // ✅ เพิ่ม logging เพื่อ debug
    // console.log("=== Converting Domain to API ===");
    // console.log("Input items:", input.getItems());
    // console.log("Items count:", input.getItems().length);

    const apiItems = input.getItems().map((item) => {
      // console.log("Processing item:", item);

      return {
        purchase_request_item_id: item.getPurchaseRequestItemId(),
        price: item.getPrice(),
        is_vat: item.getIsVat(),
        selected_vendor: [
          {
            vendor_id: item.getVendor().getVendorId(),
            vendor_bank_account_id: item.getVendor().getVendorBankAccountId(),
            filename: item.getVendor().getFilename(),
            reason: item.getVendor().getReason(),
            selected: true,
            created_by: currentUser,
            created_at: currentTimestamp,
          },
        ],
        created_by: currentUser,
        created_at: currentTimestamp,
        updated_by: currentUser,
        updated_at: currentTimestamp,
      };
    });

    // console.log("Final API items:", apiItems);

    return {
      purchase_order_item: [],
      purchase_request_id: input.getPurchaseRequestId(),

      document: {
        description: input.getDocument().description,
        documentTypeId: input.getDocument().documentTypeId,
        created_by: currentUser,
        created_at: currentTimestamp,
        updated_by: currentUser,
        updated_at: currentTimestamp,
      },

      items: apiItems, // ✅ ส่งข้อมูล items ที่ถูกต้อง
      created_by: currentUser,
      created_at: currentTimestamp,
      updated_by: currentUser,
      updated_at: currentTimestamp,
    };
  }

  private toDomainModel(data: PurchaseOrderApiModel): PurchaseOrderEntity {
    // console.log("--- purchase_order_item data from API ---:", data.purchase_order_item);
    // console.log("--- Converting API Model to Domain Model ---:", data);

    const purchaseOrderItems = (
      Array.isArray(data.purchase_order_item) ? data.purchase_order_item : []
    ).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) =>
        new PurchaseOrderItemDataEntity(item, data.purchase_request?.purchase_request_item || [])
    );

    const userApproval = data.user_approval || null;

    return PurchaseOrderEntity.create({
      id: data.id,
      poNumber: data.po_number,
      purchase_request_id: data.purchase_request_id,
      document: {
        description: data.document?.description,
        documentTypeId: Number(data.document?.documentTypeId),
        department: data.document?.department,
        requester: data.document?.requester,
        position: data.document?.position || [],
      },
      purchase_request: data.purchase_request,
      user_approval: userApproval,
      items: (data.purchase_order_item || []).map((item) => ({
        purchase_request_item_id: item.purchase_request_item_id,
        price: item.price,
        is_vat: item.is_vat,
        selected_vendor: (item.selected_vendor || []).map((vendor) => ({
          vendor_id: vendor.vendor_id,
          vendor_bank_account_id: vendor.vendor_bank_account_id,
          filename: vendor.filename || null,
          reason: vendor.reason || null,
          selected: vendor.selected || false,
        })),
      })),
      purchase_order_item: purchaseOrderItems,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_by: data.updated_at,
      updated_at: data.updated_at,
      deleted_at: data.deleted_at,
    });
  }

  // ✅ แก้ไข: เปลี่ยนเป็น private method ที่ return Error object
  private handleApiError(error: unknown, defaultMessage: string): Error {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const statusCode = axiosError.response.status;
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      return new Error(`API Error (${statusCode}): ${serverMessage}`);
    } else if (axiosError.request) {
      return new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      return new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
  // private sanitizeVendorData(vendor: any): any {
  //   if (vendor && typeof vendor === "object") {
  //     if (vendor.constructor.name === "Object" && vendor.toString() === "[object Object]") {
  //       return {
  //         vendor_id: vendor.vendor_id,
  //         vendor_name: vendor.vendor_name,
  //         vendor_bank_account_id: vendor.vendor_bank_account_id,
  //         bank_name: vendor.bank_name,
  //         account_number: vendor.account_number,
  //         file_url: vendor.file_url,
  //         filename: vendor.filename,
  //         is_vat: vendor.is_vat,
  //         reason: vendor.reason || "",
  //         selected: vendor.selected || false,
  //       };
  //     }
  //   }
  //   return vendor;
  // }
}
