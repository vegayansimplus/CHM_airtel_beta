export interface LeaveRequest {
  id: string
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
}

export interface CreateLeavePayload {
  leaveType: string
  startDate: string
  endDate: string
  reason: string
}