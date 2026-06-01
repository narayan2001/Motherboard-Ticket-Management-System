import { TICKET_STATUS, TICKET_PRIORITY } from '../utils/constants'

export const StatusBadge = ({ status }) => {
  const statusInfo = TICKET_STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
  
  return (
    <span className={`badge ${statusInfo.color}`}>
      {statusInfo.label}
    </span>
  )
}

export const PriorityBadge = ({ priority }) => {
  const priorityInfo = TICKET_PRIORITY[priority] || { label: priority, color: 'bg-gray-100 text-gray-800' }
  
  return (
    <span className={`badge ${priorityInfo.color}`}>
      {priorityInfo.label}
    </span>
  )
}
