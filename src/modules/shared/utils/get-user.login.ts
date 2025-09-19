// get-user.login.ts
export const getUserApv = () => {
  const stored = localStorage.getItem("userData");
  return stored ? JSON.parse(stored) : null;
};
