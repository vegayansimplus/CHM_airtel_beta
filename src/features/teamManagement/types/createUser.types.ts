
// export type EmploymentType = "ONROLE" | "OFFROLE" | "PROJECT";
export type Gender = "Male" | "Female" | "Other";

export interface CreateEmployeeRequest {
  actorUserId: number; // userId of logged user
  olmid: string;
  employeeName: string;
  emailId: string;
  mobileNo: string;
  employmentType: string;
  vendorCompany?: string;
  designation: string;
  jobLevel: string;
  officeLocation: string;
  gender: Gender;
  deviceVendorCapability?: string;
  dateOfJoining: string; // yyyy-MM-dd
  verticalId: number;
  functionId: number;
  domainId: number;
  subDomainId: number;
  roleId: number;
  roleCode: string;
}

export interface ApiResponse {
  status: string;
  message: string;
}
