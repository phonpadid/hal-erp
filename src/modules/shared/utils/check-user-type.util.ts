export function canAccessAll() {
  const rawType = localStorage.getItem("userType");

  let userType: string[] = [];

  try {
    const parsed = JSON.parse(rawType || "[]");
    userType = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    userType = rawType ? [rawType] : [];
  }

  return userType.includes("admin");
}
