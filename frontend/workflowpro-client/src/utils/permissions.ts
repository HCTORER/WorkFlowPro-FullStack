export const getRole = () => {
  return localStorage.getItem("role") || "";
};

export const isAdminOrOwner = () => {
  const role = getRole();
  return role === "Owner" || role === "Admin";
};
