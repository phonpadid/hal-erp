export function canAccessAll() {
  const rawType = localStorage.getItem("userType");

  let userType: string[] = [];

  try {
    const parsed = JSON.parse(rawType || "[]");
    userType = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    userType = rawType ? [rawType] : [];
  }
  // Fixed: Check both company-user (dash) and company_user (underscore)
  return userType.includes("admin") || userType.includes("company-user") || userType.includes("company_user") || userType.includes("company-admin");
}
