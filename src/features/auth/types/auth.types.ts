
export interface LoggedUserApiResponse {
  olmId: string;
  employeeName: string;
  roleName: string;
  permissions: string[];
  moduleName: string;
  isAuthenticated: boolean;
  userId: string;
}

export interface AuthUser {
  olmId: string;
  employeeName: string;
  roleName: string;
  moduleName: string[];
  permissions: string[];
  authenticated: boolean;
  userId: string;
}

export interface StoredUser {
  olmId: string;
  employeeName: string;
  roleName: string;
  moduleName: string[];
  permissions: string[];
  userId: string;
  // authenticated: boolean;
}

export interface LoginResponse {
  status: string;
  message: string;
  accessToken?: string;

}


export interface LogoutResponse { olmId: string }
// features/auth/types/auth.types.ts

export interface LoggedUserApiResponse {
  olmId: string;
  employeeName: string;
  roleName: string;
  moduleName: string;
  permissions: string[];
  isAuthenticated: boolean;
  userId: string;
}

export interface AuthUser {
  olmId: string;
  employeeName: string;
  roleName: string;
  moduleName: string[];
  permissions: string[];
  authenticated: boolean;
  userId: string;
}

export interface StoredUser {
  olmId: string;
  employeeName: string;
  roleName: string;
  moduleName: string[];
  permissions: string[];
  userId: string;
  // authenticated: boolean;
}

export interface LoginResponse {
  status: string;
  message: string;
  accessToken?: string;
}
