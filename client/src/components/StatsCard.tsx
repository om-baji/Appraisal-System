import type { ReactNode } from "react"
import "./StatsCard.css"

interface StatsCardProps {
    icon: ReactNode
    label: string
    value: string | number
}

export default function StatsCard({ icon, label, value }: StatsCardProps) {
    return (
        <div className="stats-card">
            <div className="stats-card-icon">{icon}</div>
            <div className="stats-card-content">
                <span className="stats-card-value">{value}</span>
                <span className="stats-card-label">{label}</span>
            </div>
        </div>
    )
}
