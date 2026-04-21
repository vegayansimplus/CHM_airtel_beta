export interface ModulePermission {
  moduleName: string;
  permissions: string[];
}

export interface LoggedUserApiResponse {
  olmId: string;
  employeeName: string;
  roleCode: string;
  modules: ModulePermission[];
  userId: string;
}

export interface AuthUser {
  olmId: string;
  employeeName: string;
  roleCode: string;
  userId: string;
  modules: Record<string, string[]>;
  authenticated: boolean;
}

export interface StoredUser {
  olmId: string;
  employeeName: string;
  roleCode: string;
  userId: string;
  modules: Record<string, string[]>;
}


export interface LoginResponse {
  status: string;
  message: string;
  accessToken?: string;
}
