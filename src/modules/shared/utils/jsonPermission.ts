// Permission System Configuration
// This file contains all permissions, roles, and their mappings based on the JSON structure

// Type definitions
interface PermissionConfig {
  name: string;
  description: string;
  category: string;
  module: string;
}

interface RoleConfig {
  name: string;
  description: string;
  level: number;
  permissions: string[] | "*";
}

interface CategoryConfig {
  name: string;
  description: string;
  icon: string;
}

interface ModuleConfig {
  name: string;
  description: string;
}

interface PermissionSystem {
  permissions: Record<string, PermissionConfig>;
  roles: Record<string, RoleConfig>;
  categories: Record<string, CategoryConfig>;
  modules: Record<string, ModuleConfig>;
}

export const PERMISSION_CONFIG: PermissionSystem = {
  // Permission definitions based on JSON data
  permissions: {
    // Department permissions (id: 1)
    "write-department": {
      name: "Create Department",
      description: "Create Department",
      category: "admin",
      module: "department-management"
    },
    "read-department": {
      name: "Read Department",
      description: "Read Department",
      category: "admin",
      module: "department-management"
    },
    "update-department": {
      name: "Update Department",
      description: "Update Department",
      category: "admin",
      module: "department-management"
    },
    "delete-department": {
      name: "Delete Department",
      description: "Delete Department",
      category: "admin",
      module: "department-management"
    },

    // Unit permissions (id: 2)
    "write-unit": {
      name: "Create Unit",
      description: "Create Unit",
      category: "management",
      module: "unit-management"
    },
    "read-unit": {
      name: "Read Unit",
      description: "Read Unit",
      category: "management",
      module: "unit-management"
    },
    "update-unit": {
      name: "Update Unit",
      description: "Update Unit",
      category: "management",
      module: "unit-management"
    },
    "delete-unit": {
      name: "Delete Unit",
      description: "Delete Unit",
      category: "management",
      module: "unit-management"
    },

    // Position permissions (id: 3)
    "write-position": {
      name: "Create Position",
      description: "Create Position",
      category: "admin",
      module: "position-management"
    },
    "read-position": {
      name: "Read Position",
      description: "Read Position",
      category: "admin",
      module: "position-management"
    },
    "update-position": {
      name: "Update Position",
      description: "Update Position",
      category: "admin",
      module: "position-management"
    },
    "delete-position": {
      name: "Delete Position",
      description: "Delete Position",
      category: "admin",
      module: "position-management"
    },

    // Role permissions (id: 4)
    "write-role": {
      name: "Create Role",
      description: "Create Role",
      category: "admin",
      module: "role-management"
    },
    "read-role": {
      name: "Read Role",
      description: "Read Role",
      category: "admin",
      module: "role-management"
    },
    "update-role": {
      name: "Update Role",
      description: "Update Role",
      category: "admin",
      module: "role-management"
    },
    "delete-role": {
      name: "Delete Role",
      description: "Delete Role",
      category: "admin",
      module: "role-management"
    },

    // User permissions (id: 5)
    "write-user": {
      name: "Create User",
      description: "Create User",
      category: "admin",
      module: "user-management"
    },
    "read-user": {
      name: "Read User",
      description: "Read User",
      category: "admin",
      module: "user-management"
    },
    "update-user": {
      name: "Update User",
      description: "Update User",
      category: "admin",
      module: "user-management"
    },
    "delete-user": {
      name: "Delete User",
      description: "Delete User",
      category: "admin",
      module: "user-management"
    },

    // Permission permissions (id: 6)
    "write-permission": {
      name: "Create Permission",
      description: "Create Permission",
      category: "admin",
      module: "permission-management"
    },
    "read-permission": {
      name: "Read Permission",
      description: "Read Permission",
      category: "admin",
      module: "permission-management"
    },
    "update-permission": {
      name: "Update Permission",
      description: "Update Permission",
      category: "admin",
      module: "permission-management"
    },
    "delete-permission": {
      name: "Delete Permission",
      description: "Delete Permission",
      category: "admin",
      module: "permission-management"
    },

    // Document Type permissions (id: 7)
    "write-document-type": {
      name: "Create Document Type",
      description: "Create Document Type",
      category: "management",
      module: "document-management"
    },
    "read-document-type": {
      name: "Read Document Type",
      description: "Read Document Type",
      category: "management",
      module: "document-management"
    },
    "update-document-type": {
      name: "Update Document Type",
      description: "Update Document Type",
      category: "management",
      module: "document-management"
    },
    "delete-document-type": {
      name: "Delete Document Type",
      description: "Delete Document Type",
      category: "management",
      module: "document-management"
    },

    // Department User permissions (id: 8)
    "write-department-user": {
      name: "Create Department User",
      description: "Create Department User",
      category: "admin",
      module: "department-user-management"
    },
    "read-department-user": {
      name: "Read Department User",
      description: "Read Department User",
      category: "admin",
      module: "department-user-management"
    },
    "update-department-user": {
      name: "Update Department User",
      description: "Update Department User",
      category: "admin",
      module: "department-user-management"
    },
    "delete-department-user": {
      name: "Delete Department User",
      description: "Delete Department User",
      category: "admin",
      module: "department-user-management"
    },

    // Department Approver permissions (id: 9)
    "write-department-approver": {
      name: "Create Department Approver",
      description: "Create Department Approver",
      category: "admin",
      module: "department-approver-management"
    },
    "read-department-approver": {
      name: "Read Department Approver",
      description: "Read Department Approver",
      category: "admin",
      module: "department-approver-management"
    },
    "update-department-approver": {
      name: "Update Department Approver",
      description: "Update Department Approver",
      category: "admin",
      module: "department-approver-management"
    },
    "delete-department-approver": {
      name: "Delete Department Approver",
      description: "Delete Department Approver",
      category: "admin",
      module: "department-approver-management"
    },

    // Currency permissions (id: 10)
    "write-currency": {
      name: "Create Currency",
      description: "Create Currency",
      category: "admin",
      module: "currency-management"
    },
    "read-currency": {
      name: "Read Currency",
      description: "Read Currency",
      category: "admin",
      module: "currency-management"
    },
    "update-currency": {
      name: "Update Currency",
      description: "Update Currency",
      category: "admin",
      module: "currency-management"
    },
    "delete-currency": {
      name: "Delete Currency",
      description: "Delete Currency",
      category: "admin",
      module: "currency-management"
    },

    // Vendor permissions (id: 11)
    "create-vendor": {
      name: "Create Vendor",
      description: "Create Vendor",
      category: "management",
      module: "vendor-management"
    },
    "read-vendor": {
      name: "Read Vendor",
      description: "Read Vendor",
      category: "management",
      module: "vendor-management"
    },
    "update-vendor": {
      name: "Update Vendor",
      description: "Update Vendor",
      category: "management",
      module: "vendor-management"
    },
    "delete-vendor": {
      name: "Delete Vendor",
      description: "Delete Vendor",
      category: "management",
      module: "vendor-management"
    },

    // Vendor Bank Account permissions (id: 12)
    "create-vendor-bank-account": {
      name: "Create Vendor Bank Account",
      description: "Create Vendor Bank Account",
      category: "management",
      module: "vendor-management"
    },
    "read-vendor-bank-account": {
      name: "Read Vendor Bank Account",
      description: "Read Vendor Bank Account",
      category: "management",
      module: "vendor-management"
    },
    "update-vendor-bank-account": {
      name: "Update Vendor Bank Account",
      description: "Update Vendor Bank Account",
      category: "management",
      module: "vendor-management"
    },
    "delete-vendor-bank-account": {
      name: "Delete Vendor Bank Account",
      description: "Delete Vendor Bank Account",
      category: "management",
      module: "vendor-management"
    },

    // Budget Account permissions (id: 13)
    "create-budget-account": {
      name: "Create Dudget Account",
      description: "Create Dudget Account",
      category: "budget",
      module: "budget-management"
    },
    "read-budget-account": {
      name: "Read Dudget Account",
      description: "Read Dudget Account",
      category: "budget",
      module: "budget-management"
    },
    "update-budget-account": {
      name: "Update Dudget Account",
      description: "Update Dudget Account",
      category: "budget",
      module: "budget-management"
    },
    "delete-budget-account": {
      name: "Delete Dudget Account",
      description: "Delete Dudget Account",
      category: "budget",
      module: "budget-management"
    },

    // Budget Item permissions (id: 14)
    "create-budget-item": {
      name: "Create Budget Item",
      description: "Create Budget Item",
      category: "budget",
      module: "budget-management"
    },
    "read-budget-item": {
      name: "Read Budget Item",
      description: "Read Budget Item",
      category: "budget",
      module: "budget-management"
    },
    "update-budget-item": {
      name: "Update Budget Item",
      description: "Update Budget Item",
      category: "budget",
      module: "budget-management"
    },
    "delete-budget-item": {
      name: "Delete Budget Item",
      description: "Delete Budget Item",
      category: "budget",
      module: "budget-management"
    },

    // Budget Item Detail permissions (id: 15)
    "create-budget-item-detail": {
      name: "Create Budget Item Detail",
      description: "Create Budget Item Detail",
      category: "budget",
      module: "budget-management"
    },
    "read-budget-item-detail": {
      name: "Read Budget Item Detail",
      description: "Read Budget Item Detail",
      category: "budget",
      module: "budget-management"
    },
    "update-budget-item-detail": {
      name: "Update Budget Item Detail",
      description: "Update Budget Item Detail",
      category: "budget",
      module: "budget-management"
    },
    "delete-budget-item-detail": {
      name: "Delete Budget Item Detail",
      description: "Delete Budget Item Detail",
      category: "budget",
      module: "budget-management"
    },

    // Budget Approval Rule permissions (id: 16)
    "create-budget-approval-rule": {
      name: "Create Budget Approval Rule",
      description: "Create Budget Approval Rule",
      category: "budget",
      module: "budget-management"
    },
    "read-budget-approval-rule": {
      name: "Read Budget Approval Rule",
      description: "Read Budget Approval Rule",
      category: "budget",
      module: "budget-management"
    },
    "update-budget-approval-rule": {
      name: "Update Budget Approval Rule",
      description: "Update Budget Approval Rule",
      category: "budget",
      module: "budget-management"
    },
    "delete-budget-approval-rule": {
      name: "Delete Budget Approval Rule",
      description: "Delete Budget Approval Rule",
      category: "budget",
      module: "budget-management"
    },

    // Approval Workflow permissions (id: 17)
    "create-approval-workflow": {
      name: "Create Approval Workflow",
      description: "Create Approval Workflow",
      category: "workflow",
      module: "approval-management"
    },
    "read-approval-workflow": {
      name: "Read Approval Workflow",
      description: "Read Approval Workflow",
      category: "workflow",
      module: "approval-management"
    },
    "update-approval-workflow": {
      name: "Update Approval Workflow",
      description: "Update Approval Workflow",
      category: "workflow",
      module: "approval-management"
    },
    "delete-approval-workflow": {
      name: "Delete Approval Workflow",
      description: "Delete Approval Workflow",
      category: "workflow",
      module: "approval-management"
    },

    // Approval Workflow Step permissions (id: 18)
    "create-approval-workflow-step": {
      name: "Create Approval Workflow Step",
      description: "Create Approval Workflow Step",
      category: "workflow",
      module: "approval-management"
    },
    "read-approval-workflow-step": {
      name: "Read Approval Workflow Step",
      description: "Read Approval Workflow Step",
      category: "workflow",
      module: "approval-management"
    },
    "update-approval-workflow-step": {
      name: "Update Approval Workflow Step",
      description: "Update Approval Workflow Step",
      category: "workflow",
      module: "approval-management"
    },
    "delete-approval-workflow-step": {
      name: "Delete Approval Workflow Step",
      description: "Delete Approval Workflow Step",
      category: "workflow",
      module: "approval-management"
    },

    // Document permissions (id: 19)
    "create-document": {
      name: "Create Document",
      description: "Create Document",
      category: "document",
      module: "document-management"
    },
    "read-document": {
      name: "Read Document",
      description: "Read Document",
      category: "document",
      module: "document-management"
    },
    "update-document": {
      name: "Update Document",
      description: "Update Document",
      category: "document",
      module: "document-management"
    },
    "delete-document": {
      name: "Delete Document",
      description: "Delete Document",
      category: "document",
      module: "document-management"
    },

    // Purchase Request permissions (id: 20)
    "create-purchase-request": {
      name: "Create Purchase Request",
      description: "Create Purchase Request",
      category: "purchase",
      module: "purchase-request"
    },
    "read-purchase-request": {
      name: "Read Purchase Request",
      description: "Read Purchase Request",
      category: "purchase",
      module: "purchase-request"
    },
    "update-purchase-request": {
      name: "Update Purchase Request",
      description: "Update Purchase Request",
      category: "purchase",
      module: "purchase-request"
    },
    "delete-purchase-request": {
      name: "Delete Purchase Request",
      description: "Delete Purchase Request",
      category: "purchase",
      module: "purchase-request"
    },

    // Purchase Request Item permissions (id: 21)
    "create-purchase-request-item": {
      name: "Create Purchase Request Item",
      description: "Create Purchase Request Item",
      category: "purchase",
      module: "purchase-request"
    },
    "read-purchase-request-item": {
      name: "Read Purchase Request Item",
      description: "Read Purchase Request Item",
      category: "purchase",
      module: "purchase-request"
    },
    "update-purchase-request-item": {
      name: "Update Purchase Request Item",
      description: "Update Purchase Request Item",
      category: "purchase",
      module: "purchase-request"
    },
    "delete-purchase-request-item": {
      name: "Delete Purchase Request Item",
      description: "Delete Purchase Request Item",
      category: "purchase",
      module: "purchase-request"
    },

    // Purchase Order permissions (id: 22)
    "create-purchase-order": {
      name: "Create Purchase Order",
      description: "Create Purchase Order",
      category: "purchase",
      module: "purchase-order"
    },
    "read-purchase-order": {
      name: "Read Purchase Order",
      description: "Read Purchase Order",
      category: "purchase",
      module: "purchase-order"
    },
    "update-purchase-order": {
      name: "Update Purchase Order",
      description: "Update Purchase Order",
      category: "purchase",
      module: "purchase-order"
    },
    "delete-purchase-order": {
      name: "Delete Purchase Order",
      description: "Delete Purchase Order",
      category: "purchase",
      module: "purchase-order"
    },

    // Purchase Order Item permissions (id: 23)
    "create-purchase-order-item": {
      name: "Create Purchase Order Item",
      description: "Create Purchase Order Item",
      category: "purchase",
      module: "purchase-order"
    },
    "read-purchase-order-item": {
      name: "Read Purchase Order Item",
      description: "Read Purchase Order Item",
      category: "purchase",
      module: "purchase-order"
    },
    "update-purchase-order-item": {
      name: "Update Purchase Order Item",
      description: "Update Purchase Order Item",
      category: "purchase",
      module: "purchase-order"
    },
    "delete-purchase-order-item": {
      name: "Delete Purchase Order Item",
      description: "Delete Purchase Order Item",
      category: "purchase",
      module: "purchase-order"
    },

    // Purchase Order Selected Vendor permissions (id: 24)
    "create-purchase-selected-vendor": {
      name: "Create Purchase Selected Vendor",
      description: "Create Purchase Selected Vendor",
      category: "purchase",
      module: "purchase-order"
    },
    "read-purchase-selected-vendor": {
      name: "Read Purchase Selected Vendor",
      description: "Read Purchase Selected Vendor",
      category: "purchase",
      module: "purchase-order"
    },
    "update-purchase-selected-vendor": {
      name: "Update Purchase Selected Vendor",
      description: "Update Purchase Selected Vendor",
      category: "purchase",
      module: "purchase-order"
    },
    "delete-purchase-selected-vendor": {
      name: "Delete Purchase Selected Vendor",
      description: "Delete Purchase Selected Vendor",
      category: "purchase",
      module: "purchase-order"
    },

    // User Approval permissions (id: 25)
    "create-user-approval": {
      name: "Create User Approval",
      description: "Create User Approval",
      category: "workflow",
      module: "approval-management"
    },
    "read-user-approval": {
      name: "Read User Approval",
      description: "Read User Approval",
      category: "workflow",
      module: "approval-management"
    },
    "update-user-approval": {
      name: "Update User Approval",
      description: "Update User Approval",
      category: "workflow",
      module: "approval-management"
    },
    "delete-user-approval": {
      name: "Delete User Approval",
      description: "Delete User Approval",
      category: "workflow",
      module: "approval-management"
    },

    // User Approval Step permissions (id: 26)
    "create-user-approval-step": {
      name: "Create User Approval Step",
      description: "Create User Approval Step",
      category: "workflow",
      module: "approval-management"
    },
    "read-user-approval-step": {
      name: "Read User Approval Step",
      description: "Read User Approval Step",
      category: "workflow",
      module: "approval-management"
    },
    "update-user-approval-step": {
      name: "Update User Approval Step",
      description: "Update User Approval Step",
      category: "workflow",
      module: "approval-management"
    },
    "delete-user-approval-step": {
      name: "Delete User Approval Step",
      description: "Delete User Approval Step",
      category: "workflow",
      module: "approval-management"
    },

    // Receipt permissions (id: 27)
    "create-receipt": {
      name: "Create Receipt",
      description: "Create Receipt",
      category: "document",
      module: "receipt-management"
    },
    "read-receipt": {
      name: "Read Receipt",
      description: "Read Receipt",
      category: "document",
      module: "receipt-management"
    },
    "update-receipt": {
      name: "Update Receipt",
      description: "Update Receipt",
      category: "document",
      module: "receipt-management"
    },
    "delete-receipt": {
      name: "Delete Receipt",
      description: "Delete Receipt",
      category: "document",
      module: "receipt-management"
    },

    // Receipt Item permissions (id: 28)
    "create-receipt-item": {
      name: "Create Receipt Item",
      description: "Create Receipt Item",
      category: "document",
      module: "receipt-management"
    },
    "read-receipt-item": {
      name: "Read Receipt Item",
      description: "Read Receipt Item",
      category: "document",
      module: "receipt-management"
    },
    "update-receipt-item": {
      name: "Update Receipt Item",
      description: "Update Receipt Item",
      category: "document",
      module: "receipt-management"
    },
    "delete-receipt-item": {
      name: "Delete Receipt Item",
      description: "Delete Receipt Item",
      category: "document",
      module: "receipt-management"
    },

    // Company permissions (id: 29)
    "create-company": {
      name: "Create Company",
      description: "Create Company",
      category: "admin",
      module: "company-management"
    },
    // "read-company": {
    //   name: "Read Company",
    //   description: "Read Company",
    //   category: "admin",
    //   module: "company-management"
    // },
    // "update-company": {
    //   name: "Update Company",
    //   description: "Update Company",
    //   category: "admin",
    //   module: "company-management"
    // },
    // "delete-company": {
    //   name: "Delete Company",
    //   description: "Delete Company",
    //   category: "admin",
    //   module: "company-management"
    // },

    // Company User permissions (id: 30)
    // "create-company-user": {
    //   name: "Create Company User",
    //   description: "Create Company User",
    //   category: "admin",
    //   module: "company-management"
    // },
    // "read-company-user": {
    //   name: "Read Company User",
    //   description: "Read Company User",
    //   category: "admin",
    //   module: "company-management"
    // },
    // "update-company-user": {
    //   name: "Update Company User",
    //   description: "Update Company User",
    //   category: "admin",
    //   module: "company-management"
    // },
    // "delete-company-user": {
    //   name: "Delete Company User",
    //   description: "Delete Company User",
    //   category: "admin",
    //   module: "company-management"
    // },

    // Category permissions (id: 31)
    "create-category": {
      name: "Create Category",
      description: "Create Category",
      category: "management",
      module: "category-management"
    },
    "read-category": {
      name: "Read Category",
      description: "Read Category",
      category: "management",
      module: "category-management"
    },
    "update-category": {
      name: "Update Category",
      description: "Update Category",
      category: "management",
      module: "category-management"
    },
    "delete-category": {
      name: "Delete Category",
      description: "Delete Category",
      category: "management",
      module: "category-management"
    },

    // Increase Budget permissions (id: 32)
    "create-increase-budget": {
      name: "Create Increase Budget",
      description: "Create Increase Budget",
      category: "budget",
      module: "budget-management"
    },
    "read-increase-budget": {
      name: "Read Increase Budget",
      description: "Read Increase Budget",
      category: "budget",
      module: "budget-management"
    },
    "update-increase-budget": {
      name: "Update Increase Budget",
      description: "Update Increase Budget",
      category: "budget",
      module: "budget-management"
    },
    "delete-increase-budget": {
      name: "Delete Increase Budget",
      description: "Delete Increase Budget",
      category: "budget",
      module: "budget-management"
    },

    // Increase Budget Detail permissions (id: 33)
    "create-increase-detail": {
      name: "Create Increase Budget Detail",
      description: "Create Increase Budget Detail",
      category: "budget",
      module: "budget-management"
    },
    "read-increase-detail": {
      name: "Read Increase Budget Detail",
      description: "Read Increase Budget Detail",
      category: "budget",
      module: "budget-management"
    },
    "update-increase-detail": {
      name: "Update Increase Budget Detail",
      description: "Update Increase Budget Detail",
      category: "budget",
      module: "budget-management"
    },
    "delete-increase-detail": {
      name: "Delete Increase Budget Detail",
      description: "Delete Increase Budget Detail",
      category: "budget",
      module: "budget-management"
    },

    // Product Type permissions (id: 34)
    "create-product-type": {
      name: "Create Product Type",
      description: "Create Product Type",
      category: "management",
      module: "product-management"
    },
    "read-product-type": {
      name: "Read Product Type",
      description: "Read Product Type",
      category: "management",
      module: "product-management"
    },
    "update-product-type": {
      name: "Update Product Type",
      description: "Update Product Type",
      category: "management",
      module: "product-management"
    },
    "delete-product-type": {
      name: "Delete Product Type",
      description: "Delete Product Type",
      category: "management",
      module: "product-management"
    },

    // Product permissions (id: 35)
    "create-product": {
      name: "Create Product",
      description: "Create Product",
      category: "management",
      module: "product-management"
    },
    "read-product": {
      name: "Read Product",
      description: "Read Product",
      category: "management",
      module: "product-management"
    },
    "update-product": {
      name: "Update Product",
      description: "Update Product",
      category: "management",
      module: "product-management"
    },
    "delete-product": {
      name: "Delete Product",
      description: "Delete Product",
      category: "management",
      module: "product-management"
    },

    // Quota Company permissions (id: 36)
    "create-quota-company": {
      name: "Create Quota Company",
      description: "Create Quota Company",
      category: "management",
      module: "quota-management"
    },
    "read-quota-company": {
      name: "Read Quota Company",
      description: "Read Quota Company",
      category: "management",
      module: "quota-management"
    },
    "update-quota-company": {
      name: "Update Quota Company",
      description: "Update Quota Company",
      category: "management",
      module: "quota-management"
    },
    "delete-quota-company": {
      name: "Delete Quota Company",
      description: "Delete Quota Company",
      category: "management",
      module: "quota-management"
    },

    // Vendor Product permissions (id: 37)
    "create-vendor-product": {
      name: "Create Vendor Product",
      description: "Create Vendor Product",
      category: "management",
      module: "vendor-management"
    },
    "read-vendor-product": {
      name: "Read Vendor Product",
      description: "Read Vendor Product",
      category: "management",
      module: "vendor-management"
    },
    "update-vendor-product": {
      name: "Update Vendor Product",
      description: "Update Vendor Product",
      category: "management",
      module: "vendor-management"
    },
    "delete-vendor-product": {
      name: "Delete Vendor Product",
      description: "Delete Vendor Product",
      category: "management",
      module: "vendor-management"
    },
    // bank
    "create-bank": {
      name: "Create Bank",
      description: "Create Bank",
      category: "admin",
      module: "bank-management"
    },
    "read-bank": {
      name: "Read Bank",
      description: "Read Bank",
      category: "admin",
      module: "bank-management"
    },
    "update-bank": {
      name: "Update Bank",
      description: "Update Bank",
      category: "admin",
      module: "bank-management"
    },
    "delete-bank": {
      name: "Delete Bank",
      description: "Delete Bank",
      category: "admin",
      module: "bank-management"
    }
  },

  // Role definitions - Super Admin has all permissions
  roles: {
    "super-admin": {
      name: "Super Administrator",
      description: "Has full system access",
      level: 100,
      permissions: "*" // All permissions
    },
    "admin": {
      name: "Administrator",
      description: "System administrator with most permissions",
      level: 80,
      permissions: [
        // Admin permissions
        "write-department", "read-department", "update-department", "delete-department",
        "write-position", "read-position", "update-position", "delete-position",
        "write-role", "read-role", "update-role", "delete-role",
        "write-user", "read-user", "update-user", "delete-user",
        "write-permission", "read-permission", "update-permission", "delete-permission",
        "write-department-user", "read-department-user", "update-department-user", "delete-department-user",
        "write-department-approver", "read-department-approver", "update-department-approver", "delete-department-approver",
        "write-currency", "read-currency", "update-currency", "delete-currency",

        // Management permissions
        "write-unit", "read-unit", "update-unit", "delete-unit",
        "write-document-type", "read-document-type", "update-document-type", "delete-document-type",
        "create-vendor", "read-vendor", "update-vendor", "delete-vendor",
        "create-vendor-bank-account", "read-vendor-bank-account", "update-vendor-bank-account", "delete-vendor-bank-account",
        "create-category", "read-category", "update-category", "delete-category",
        "create-product-type", "read-product-type", "update-product-type", "delete-product-type",
        "create-product", "read-product", "update-product", "delete-product",
        "create-quota-company", "read-quota-company", "update-quota-company", "delete-quota-company",
        "create-vendor-product", "read-vendor-product", "update-vendor-product", "delete-vendor-product",

        // Budget permissions
        "create-budget-account", "read-budget-account", "update-budget-account", "delete-budget-account",
        "create-budget-item", "read-budget-item", "update-budget-item", "delete-budget-item",
        "create-budget-item-detail", "read-budget-item-detail", "update-budget-item-detail", "delete-budget-item-detail",
        "create-budget-approval-rule", "read-budget-approval-rule", "update-budget-approval-rule", "delete-budget-approval-rule",
        "create-increase-budget", "read-increase-budget", "update-increase-budget", "delete-increase-budget",
        "create-increase-detail", "read-increase-detail", "update-increase-detail", "delete-increase-detail",

        // Workflow permissions
        "create-approval-workflow", "read-approval-workflow", "update-approval-workflow", "delete-approval-workflow",
        "create-approval-workflow-step", "read-approval-workflow-step", "update-approval-workflow-step", "delete-approval-workflow-step",
        "create-user-approval", "read-user-approval", "update-user-approval", "delete-user-approval",
        "create-user-approval-step", "read-user-approval-step", "update-user-approval-step", "delete-user-approval-step",

        // Document permissions
        "create-document", "read-document", "update-document", "delete-document",
        "create-receipt", "read-receipt", "update-receipt", "delete-receipt",
        "create-receipt-item", "read-receipt-item", "update-receipt-item", "delete-receipt-item",

        // Purchase permissions
        "create-purchase-request", "read-purchase-request", "update-purchase-request", "delete-purchase-request",
        "create-purchase-request-item", "read-purchase-request-item", "update-purchase-request-item", "delete-purchase-request-item",
        "create-purchase-order", "read-purchase-order", "update-purchase-order", "delete-purchase-order",
        "create-purchase-order-item", "read-purchase-order-item", "update-purchase-order-item", "delete-purchase-order-item",
        "create-purchase-selected-vendor", "read-purchase-selected-vendor", "update-purchase-selected-vendor", "delete-purchase-selected-vendor",

        // Company permissions
        "create-company", "read-company", "update-company", "delete-company",
        "create-company-user", "read-company-user", "update-company-user", "delete-company-user",
        "create-bank", "read-bank", "update-bank", "delete-bank"
      ]
    },
    "company-admin": {
      name: "Company Administrator",
      description: "Administrates a specific company",
      level: 60,
      permissions: [
        // Company management
        "read-company", "update-company",
        "create-company-user", "read-company-user", "update-company-user", "delete-company-user",

        // Basic management
        "read-department", "read-position", "read-role",
        "write-user", "read-user", "update-user", "delete-user",
        "write-currency", "read-currency", "update-currency",

        // Vendor management
        "create-vendor", "read-vendor", "update-vendor", "delete-vendor",
        "create-vendor-bank-account", "read-vendor-bank-account", "update-vendor-bank-account", "delete-vendor-bank-account",
        "create-vendor-product", "read-vendor-product", "update-vendor-product", "delete-vendor-product",

        // Product management
        "create-category", "read-category", "update-category", "delete-category",
        "create-product-type", "read-product-type", "update-product-type", "delete-product-type",
        "create-product", "read-product", "update-product", "delete-product",

        // Purchase management
        "create-purchase-request", "read-purchase-request", "update-purchase-request", "delete-purchase-request",
        "create-purchase-request-item", "read-purchase-request-item", "update-purchase-request-item", "delete-purchase-request-item",
        "read-purchase-order", "read-purchase-order-item", "read-purchase-selected-vendor",

        // Budget management
        "read-budget-account", "read-budget-item", "read-budget-item-detail",
        "create-increase-budget", "read-increase-budget", "update-increase-budget",
        "create-increase-detail", "read-increase-detail", "update-increase-detail",

        // Document management
        "create-document", "read-document", "update-document", "delete-document",
        "create-receipt", "read-receipt", "update-receipt", "delete-receipt",
        "create-receipt-item", "read-receipt-item", "update-receipt-item", "delete-receipt-item"
      ]
    },
    "company-user": {
      name: "Company User",
      description: "Regular company user",
      level: 40,
      permissions: [
        // Basic read permissions
        "read-company", "read-department", "read-position", "read-role", "read-user",
        "read-currency", "read-vendor", "read-vendor-product", "read-category",
        "read-product-type", "read-product", "read-document", "read-document-type",

        // Purchase requests
        "create-purchase-request", "read-purchase-request", "update-purchase-request",
        "create-purchase-request-item", "read-purchase-request-item", "update-purchase-request-item",

        // Budget viewing
        "read-budget-account", "read-budget-item", "read-budget-item-detail",
        "read-increase-budget", "read-increase-detail",

        // Documents
        "create-document", "read-document", "update-document",
        "create-receipt", "read-receipt", "update-receipt",
        "create-receipt-item", "read-receipt-item", "update-receipt-item"
      ]
    },
    "budget-admin": {
      name: "Budget Administrator",
      description: "Manages budgets and approvals",
      level: 70,
      permissions: [
        // Budget management
        "create-budget-account", "read-budget-account", "update-budget-account", "delete-budget-account",
        "create-budget-item", "read-budget-item", "update-budget-item", "delete-budget-item",
        "create-budget-item-detail", "read-budget-item-detail", "update-budget-item-detail", "delete-budget-item-detail",
        "create-budget-approval-rule", "read-budget-approval-rule", "update-budget-approval-rule", "delete-budget-approval-rule",
        "create-increase-budget", "read-increase-budget", "update-increase-budget", "delete-increase-budget",
        "create-increase-detail", "read-increase-detail", "update-increase-detail", "delete-increase-detail",

        // Approval workflows
        "create-approval-workflow", "read-approval-workflow", "update-approval-workflow", "delete-approval-workflow",
        "create-approval-workflow-step", "read-approval-workflow-step", "update-approval-workflow-step", "delete-approval-workflow-step",
        "create-user-approval", "read-user-approval", "update-user-approval", "delete-user-approval",
        "create-user-approval-step", "read-user-approval-step", "update-user-approval-step", "delete-user-approval-step",

        // Related permissions
        "read-company", "read-department", "read-user", "read-currency",
        "read-purchase-request", "read-purchase-order", "read-document",

        // Reports
        "read-receipt", "read-receipt-item"
      ]
    },
    "budget-user": {
      name: "Budget User",
      description: "Can view budget information",
      level: 30,
      permissions: [
        // Budget viewing
        "read-budget-account", "read-budget-item", "read-budget-item-detail",
        "read-budget-approval-rule", "read-increase-budget", "read-increase-detail",

        // Related read permissions
        "read-company", "read-department", "read-user", "read-currency",
        "read-purchase-request", "read-purchase-order", "read-document",
        "read-receipt", "read-receipt-item"
      ]
    }
  },

  // Permission categories
  categories: {
    "admin": {
      name: "Administration",
      description: "System administration permissions",
      icon: "admin-panel-settings"
    },
    "management": {
      name: "Management",
      description: "General management permissions",
      icon: "settings"
    },
    "budget": {
      name: "Budget Management",
      description: "Budget related permissions",
      icon: "account-balance"
    },
    "workflow": {
      name: "Workflow Management",
      description: "Approval workflow permissions",
      icon: "workflow"
    },
    "document": {
      name: "Document Management",
      description: "Document handling permissions",
      icon: "description"
    },
    "purchase": {
      name: "Purchase Management",
      description: "Purchase order and request permissions",
      icon: "shopping-cart"
    }
  },

  // Permission modules
  modules: {
    "department-management": {
      name: "Department Management",
      description: "Module for managing departments"
    },
    "unit-management": {
      name: "Unit Management",
      description: "Module for managing units"
    },
    "position-management": {
      name: "Position Management",
      description: "Module for managing positions"
    },
    "role-management": {
      name: "Role Management",
      description: "Module for managing roles"
    },
    "user-management": {
      name: "User Management",
      description: "Module for managing users"
    },
    "permission-management": {
      name: "Permission Management",
      description: "Module for managing permissions"
    },
    "department-user-management": {
      name: "Department User Management",
      description: "Module for managing department users"
    },
    "department-approver-management": {
      name: "Department Approver Management",
      description: "Module for managing department approvers"
    },
    "currency-management": {
      name: "Currency Management",
      description: "Module for managing currencies"
    },
    "vendor-management": {
      name: "Vendor Management",
      description: "Module for managing vendors"
    },
    "budget-management": {
      name: "Budget Management",
      description: "Module for budget management"
    },
    "approval-management": {
      name: "Approval Management",
      description: "Module for approval workflows"
    },
    "document-management": {
      name: "Document Management",
      description: "Module for document management"
    },
    "receipt-management": {
      name: "Receipt Management",
      description: "Module for receipt management"
    },
    "purchase-request": {
      name: "Purchase Request",
      description: "Module for purchase requests"
    },
    "purchase-order": {
      name: "Purchase Order",
      description: "Module for purchase orders"
    },
    "company-management": {
      name: "Company Management",
      description: "Module for managing companies"
    },
    "category-management": {
      name: "Category Management",
      description: "Module for managing categories"
    },
    "product-management": {
      name: "Product Management",
      description: "Module for managing products"
    },
    "quota-management": {
      name: "Quota Management",
      description: "Module for quota management"
    }
  }
};

// Helper functions for permission management
export const getPermissionByCategory = (category: string): Record<string, PermissionConfig> => {
  const permissions = PERMISSION_CONFIG.permissions;
  return Object.entries(permissions)
    .filter(([, config]) => config.category === category)
    .reduce((acc, [key, config]) => {
      acc[key] = config;
      return acc;
    }, {} as Record<string, PermissionConfig>);
};

export const getPermissionsForRole = (role: string): string[] => {
  const roleConfig = PERMISSION_CONFIG.roles[role];
  if (!roleConfig) return [];

  // Super admin gets all permissions
  if (roleConfig.permissions === "*") {
    return Object.keys(PERMISSION_CONFIG.permissions);
  }

  return roleConfig.permissions as string[];
};

export const hasPermissionInConfig = (role: string, permission: string): boolean => {
  const rolePermissions = getPermissionsForRole(role);
  return rolePermissions.includes(permission);
};

export const getAllPermissions = (): string[] => {
  return Object.keys(PERMISSION_CONFIG.permissions);
};

export const getAllRoles = (): string[] => {
  return Object.keys(PERMISSION_CONFIG.roles);
};

export const getPermissionInfo = (permission: string): PermissionConfig | null => {
  return PERMISSION_CONFIG.permissions[permission] || null;
};

export const getRoleInfo = (role: string): RoleConfig | null => {
  return PERMISSION_CONFIG.roles[role] || null;
};

// Export for backward compatibility
export const PERMISSIONS = PERMISSION_CONFIG.permissions;
export const ROLES = PERMISSION_CONFIG.roles;