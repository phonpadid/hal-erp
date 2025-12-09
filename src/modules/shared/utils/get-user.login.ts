// get-user.login.ts
export const getUserApv = () => {
  const stored = localStorage.getItem("userData");
  return stored ? JSON.parse(stored) : null;
};
export const getUserRole = () => {
  const stored = localStorage.getItem("userRoles");
  return stored ? JSON.parse(stored) : null;
};
export enum UserRoleEnum {
  ACCOUNT_ADMIN = "account-admin",
  ACCOUNT_USER = "account-user",
  HAL_GROUP_ADMIN = "hal-group-admin",
}
