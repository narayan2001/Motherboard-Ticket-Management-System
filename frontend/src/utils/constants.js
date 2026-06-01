export const TICKET_STATUS = {
  CREATED: { label: 'Created', color: 'bg-gray-100 text-gray-800' },
  ASSIGNED: { label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
  IN_DIAGNOSIS: { label: 'In Diagnosis', color: 'bg-purple-100 text-purple-800' },
  AWAITING_APPROVAL: { label: 'Awaiting Approval', color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  DECLINED: { label: 'Declined', color: 'bg-red-100 text-red-800' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-800' },
  RESOLVED: { label: 'Resolved', color: 'bg-teal-100 text-teal-800' },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
}

export const TICKET_PRIORITY = {
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
}

export const USER_ROLES = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
  EMPLOYEE: { label: 'Employee', color: 'bg-blue-100 text-blue-800' },
  RECEPTIONIST: { label: 'Receptionist', color: 'bg-green-100 text-green-800' }
}

export const PAYMENT_METHODS = {
  CASH: 'Cash',
  UPI: 'UPI',
  CARD: 'Card'
}
