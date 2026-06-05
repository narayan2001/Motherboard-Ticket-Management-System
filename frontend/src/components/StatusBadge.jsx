import { TICKET_STATUS, PAYMENT_STATUS } from '../utils/constants'

export const StatusBadge = ({ status }) => {
  const statusInfo = TICKET_STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
  
  return (
    <span className={`badge ${statusInfo.color}`}>
      {statusInfo.label}
    </span>
  )
}

export const PaymentStatusBadge = ({ status }) => {
  const statusInfo = PAYMENT_STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
  
  return (
    <span className={`badge ${statusInfo.color}`}>
      {statusInfo.label}
    </span>
  )
}
