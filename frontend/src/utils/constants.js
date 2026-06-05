export const TICKET_STATUS = {
  CREATED: { label: 'Created', color: 'bg-gray-100 text-gray-800' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-800' },
  RESOLVED: { label: 'Resolved', color: 'bg-teal-100 text-teal-800' },
  CLOSED: { label: 'Closed', color: 'bg-green-100 text-green-800' }
}

export const PAYMENT_STATUS = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Paid', color: 'bg-green-100 text-green-800' }
}

export const USER_ROLES = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
  RECEPTIONIST: { label: 'Receptionist', color: 'bg-green-100 text-green-800' }
}

export const PAYMENT_METHODS = {
  CASH: 'Cash',
  UPI: 'UPI',
  CARD: 'Card'
}
