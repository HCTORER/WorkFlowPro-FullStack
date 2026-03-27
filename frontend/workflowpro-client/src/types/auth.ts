export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  userId: number;
  token: string;
  fullName: string;
  email: string;
  role: string;
  tenantId: number;
};
