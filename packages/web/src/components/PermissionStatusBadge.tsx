import type { PermissionStatus } from '@just-recordings/recorder'

export interface PermissionStatusBadgeProps {
  status: PermissionStatus
  label: string
}

export function PermissionStatusBadge({ status, label }: PermissionStatusBadgeProps) {
  // Stub implementation
  return (
    <span>
      {label} - {status.state}
    </span>
  )
}
