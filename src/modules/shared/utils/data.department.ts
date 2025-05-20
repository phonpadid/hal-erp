import type { DepartmentApiModel } from "@/modules/interfaces/departments/department.interface";
import { ref } from "vue";
export const dataDpm = ref<DepartmentApiModel[]>([
  {id: 1, code: "A11", name:"department A", created_at: "20/02/2025", updated_at: "20-02-2025" },
    {id: 2, code: 'AA12', name:"department B", created_at: "20/02/2025", updated_at: "20-02-2025" },
    {id: 3, code: 'AA13', name:"department C", created_at: "20/02/2025", updated_at: "20-02-2025" },
    {id: 4, code: 'AA14', name:"department D", created_at: "20/02/2025", updated_at: "20-02-2025" },
    {id: 5, code: 'AA115', name:"department E", created_at: "20/02/2025", updated_at: "20-02-2025" },
    {id: 6, code: 'AA115', name:"department F", created_at: "20/02/2025", updated_at: "20-02-2025" },
    {id: 7, code: 'AA145', name:"department AA", created_at: "20/02/2025", updated_at: "20-02-2025" },
]);
