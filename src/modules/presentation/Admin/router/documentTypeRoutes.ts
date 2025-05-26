import type { RouteRecordRaw } from "vue-router";
import DocumentType from "../views/document-types/DocumentType.vue";

export const documentTypesRoutes: RouteRecordRaw[] = [
  {
    path: "/document-types",
    name: "document_typesList",
    component: DocumentType,
    meta: {
      title: "Document Types",
      requiredAuth: true,
    },
  },
];
