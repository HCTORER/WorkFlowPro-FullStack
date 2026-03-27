export const saveAuth = (
  userId: number,
  token: string,
  fullName: string,
  email: string,
  role: string,
  tenantId: number,
) => {
  localStorage.setItem("userId", userId.toString());
  localStorage.setItem("token", token);
  localStorage.setItem("fullName", fullName);
  localStorage.setItem("email", email);
  localStorage.setItem("role", role);
  localStorage.setItem("tenantId", tenantId.toString());
};

export const clearAuth = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("token");
  localStorage.removeItem("fullName");
  localStorage.removeItem("email");
  localStorage.removeItem("role");
  localStorage.removeItem("tenantId");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};
