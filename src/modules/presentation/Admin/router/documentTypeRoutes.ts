import type { RouteRecordRaw } from "vue-router";
import DocumentType from "../views/document-types/DocumentType.vue";

export const documentTypesRoutes: RouteRecordRaw[] = [
  {
    path: "/document-types",
    name: "document.type.index",
    component: DocumentType,
    meta: {
      title: "Document Types",
      requiredAuth: true,
    },
  },
];
