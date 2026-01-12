// features/auth/types/auth.types.ts

export interface LoggedUserApiResponse {
  username: string;
  employeeName: string;
  teamFunction: string;
  roles: string;
  modules: string;
  permissions: string;
  authenticated: boolean;
}

export interface AuthUser {
  username: string;
  employeeName: string;
  teamFunction: string;
  roles: string[];
  modules: string[];
  permissions: string[];
  authenticated: boolean;
}

export interface StoredUser {
  username: string;
  employeeName: string;
  teamFunction: string;
  roles: string[];
  modules: string[];
  permissions: string[];
}

export interface LoginResponse {
  status: string;
  message: string;
  accessToken?: string;
}


export interface LogoutResponse { olmId: string }
// features/auth/types/auth.types.ts

export interface LoggedUserApiResponse {
  username: string;
  employeeName: string;
  teamFunction: string;
  roles: string;
  modules: string;
  permissions: string;
  authenticated: boolean;
}

export interface AuthUser {
  username: string;
  employeeName: string;
  teamFunction: string;
  roles: string[];
  modules: string[];
  permissions: string[];
  authenticated: boolean;
}

export interface StoredUser {
  username: string;
  employeeName: string;
  teamFunction: string;
  roles: string[];
  modules: string[];
  permissions: string[];
}

export interface LoginResponse {
  status: string;
  message: string;
  accessToken?: string;
}
