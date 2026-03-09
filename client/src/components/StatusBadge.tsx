import type { AppraisalStatus } from "@/types"
import "./StatusBadge.css"

interface StatusBadgeProps {
    status: AppraisalStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span className={`status-badge status-badge-${status}`}>
            <span className="status-badge-dot" />
            {status}
        </span>
    )
}
