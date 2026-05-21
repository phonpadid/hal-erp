/* eslint-disable @typescript-eslint/no-explicit-any */

export function getUserDisplayName(user: any, fallback: string = "_______________"): string {
  if (!user) return fallback;
  const first = (user.first_name ?? "").toString().trim();
  const last = (user.last_name ?? "").toString().trim();
  const full = `${first} ${last}`.trim();
  if (full) return full;
  if (user.username) return String(user.username);
  return fallback;
}

const DIRECTOR_LABEL = "ຜູ້ອຳນວຍການ";
const DIRECTOR_USERNAMES = new Set(["sisavanh", "super-admin"]);

function hasSuperAdminRole(user: any): boolean {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r: any) => {
    const name = typeof r === "string" ? r : r?.name;
    return typeof name === "string" && name.toLowerCase() === "super-admin";
  });
}

function isDirectorUser(user: any): boolean {
  if (!user) return false;
  const username = (user.username ?? "").toString().toLowerCase();
  if (username && DIRECTOR_USERNAMES.has(username)) return true;
  return hasSuperAdminRole(user);
}

export function getApprovalStepLabel(step: any, fallback: string = "ອະນຸມັດໂດຍ"): string {
  const approver = step?.approver;
  const docUser = step?.doc_approver?.[0]?.user;
  if (isDirectorUser(approver) || isDirectorUser(docUser)) return DIRECTOR_LABEL;
  const deptName = step?.doc_approver?.[0]?.department?.name;
  return deptName || fallback;
}
