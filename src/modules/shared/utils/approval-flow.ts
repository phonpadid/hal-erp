import { ref } from "vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dataApprovalFlow = ref<any[]>([
  {
    id: 1,
    name: 'ຟອມ A',
    document_type: "Proposals",
    code: "DT-201",
    createdAt: "20/02/2025",
    updatedAt: "20-02-2025"
  },
  {
    id: 2,
    name: 'ຟອມ B',
    document_type: "Progress Reports",
    code: "DT-201",
    createdAt: "20/02/2025",
    updatedAt: "20-02-2025"
  },
  {
    id: 3,
    name: 'ຟອມ C',
    document_type: "Instructions",
    code: "DT-201",
    createdAt: "20/02/2025",
    updatedAt: "20-02-2025"
  },
  {
    id: 4,
    name: 'ຟອມ D',
    document_type: "Lab Reports",
    code: "DT-201",
    createdAt: "20/02/2025",
    updatedAt: "20-02-2025"
  },
  {
    id: 5,
    name: 'ຟອມ E',
    document_type: "Technical Descriptions and Definitions",
    code: "DT-201",
    createdAt: "20/02/2025",
    updatedAt: "20-02-2025"
  },
]);
