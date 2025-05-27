// import type { DepartmentApproverEntity } from "@/modules/domain/entities/departments/department-approver.entity";
import type { DepartmentApiModel } from "@/modules/interfaces/departments/department.interface";
import { ref } from "vue";
enum doc {
  aa = "Document A",
  bb = "Document b",
  cc = "Document c",
}
enum status {
  approl = "Approved",
  padding = "Padding",
  other = "Other",
}
enum approval {
  a = "Approval worklow demo1",
  b = "Approval worklow demo1",
  c = "Approval worklow demo1",
  d= "ອະນຸມັດ ເທັສ1",
  e = "Approval worklow demo1",
  f = "Approval worklow demo1",
  g = "Approval worklow demo1",
}
export const dataUserApv = ref<any[]>([
  { id: 1, document: doc.aa, status: status.other,  apv_workflow: approval.a, name: "department A", created_at: "20/02/2025", updated_at: "20-02-2025" },
  { id: 2, document: doc.bb, status: status.approl,  apv_workflow: approval.b, name: "department B", created_at: "20/02/2025", updated_at: "20-02-2025" },
  { id: 3, document: doc.aa, status: status.other,  apv_workflow: approval.d, name: "department C", created_at: "20/02/2025", updated_at: "20-02-2025" },
  { id: 4, document: doc.aa, status: status.approl,  apv_workflow: approval.e, name: "department D", created_at: "20/02/2025", updated_at: "20-02-2025" },
  { id: 5, document: doc.cc, status: status.padding,  apv_workflow: approval.f, name: "department E", created_at: "20/02/2025", updated_at: "20-02-2025" },
  { id: 6, document: doc.aa, status: status.other,  apv_workflow: approval.g, name: "department F", created_at: "20/02/2025", updated_at: "20-02-2025" },
  { id: 7, document: doc.cc, status: status.padding,  apv_workflow: approval.c, name: "department AA", created_at: "20/02/2025", updated_at: "20-02-2025" },
]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dataDpmUser = ref<any[]>([
  {
    id: 1,
    signature_file: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmjMF37BD-Dfy0FUiGtSJKX-gAI98L4HXub7U-aFAe8LT2x4JgSpPC_1p1yGFhKhhPybE&usqp=CAU",
    department:'Department A' , user: "John",
    position: "position A",
    createdAt: "20/02/2025",
    updatedAt: "20-02-2025"
  },
  { id: 2, signature_file: "https://bridge58.qodeinteractive.com/wp-content/uploads/2016/06/signature.png", department:'Department A' , user: 'Joe', position: "position B", createdAt: "20/02/2025", updatedAt: "20-02-2025" },
  { id: 3, signature_file: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdYDaY3hzzs2Onze-KKma0zw3_fFfyXWy2OBjgbXwU3TwX-1r1FK6DSURNQTwx1_Dyg_k&usqp=CAU", department:'Department A' , user: 'Jannifer', position: "position C", createdAt: "20/02/2025", updatedAt: "20-02-2025" },
  { id: 4, signature_file: "https://img.freepik.com/premium-vector/fake-hand-drawn-autographs-handwritten-signature-scribble-business-certificate-letter_490811-3579.jpg?semt=ais_hybrid&w=740", department:'Department A' , user: 'Any', position: "position D", createdAt: "20/02/2025", updatedAt: "20-02-2025" },
  { id: 5, signature_file: "https://cdn.vectorstock.com/i/500p/09/77/isolated-handwritten-signature-vector-51130977.jpg", department:'Department A' , user: 'ManyOne', position: "position E", createdAt: "20/02/2025", updatedAt: "20-02-2025" },
  { id: 6, signature_file: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmjMF37BD-Dfy0FUiGtSJKX-gAI98L4HXub7U-aFAe8LT2x4JgSpPC_1p1yGFhKhhPybE&usqp=CAU", department:'Department A' , user: 'Jani', position: "position F", createdAt: "20/02/2025", updatedAt: "20-02-2025" },
  { id: 7, signature_file: "https://img.freepik.com/premium-vector/fake-autograph-samples-handdrawn-signature_721791-5877.jpg", department:'Department A' , user: 'Somsee', position: "position AA", createdAt: "20/02/2025", updatedAt: "20-02-2025" },
]);

export const statusItem = [
  { id: "1", name: "Approved" },
  { id: "2", name: "Padding" },
  { id: "3", name: "Other" },
].map((item) => ({
  value: item.id,
  label: item.name,
}));
export const documentItem = [
  { id: "1", name: "Document A" },
  { id: "2", name: "Document B" },
  { id: "3", name: "Document C" },
  { id: "4", name: "Document D" },
  { id: "5", name: "Document E" },
].map((item) => ({
  value: item.id,
  label: item.name,
}));
export const approval_workflowItem = [
  { id: "1", name: "ອະນຸມັດ ເທັສ1" },
  { id: "2", name: "Approval worklow demo1" },
  { id: "3", name: "Approval worklow demo1 C" },
  { id: "4", name: "Approval worklow demo1 D" },
  { id: "5", name: "Approval worklow demo1 E" },
].map((item) => ({
  value: item.id,
  label: item.name,
}));
