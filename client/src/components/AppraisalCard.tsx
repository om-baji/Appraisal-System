import { useNavigate } from "react-router"
import { Star } from "lucide-react"
import type { Appraisal } from "@/types"
import StatusBadge from "./StatusBadge"
import "./AppraisalCard.css"

interface AppraisalCardProps {
    appraisal: Appraisal
}

export default function AppraisalCard({ appraisal }: AppraisalCardProps) {
    const navigate = useNavigate()

    const stars = Array.from({ length: 5 }, (_, i) => i < appraisal.performance_rating)

    return (
        <div
            className="appraisal-card animate-fadeIn"
            onClick={() => navigate(`/appraisals/${appraisal.id}`)}
        >
            <div className="appraisal-card-header">
                <span className="appraisal-card-period">{appraisal.appraisal_period}</span>
                <StatusBadge status={appraisal.status} />
            </div>

            <div className="appraisal-card-people">
                <div className="appraisal-card-person">
                    <span className="appraisal-card-person-label">Employee</span>
                    <span>{appraisal.employee_name}</span>
                </div>
                <div className="appraisal-card-person">
                    <span className="appraisal-card-person-label">Reviewer</span>
                    <span>{appraisal.reviewer_name}</span>
                </div>
            </div>

            <div className="appraisal-card-footer">
                <div className="appraisal-card-rating">
                    {stars.map((filled, i) => (
                        <Star
                            key={i}
                            size={14}
                            className={filled ? "appraisal-card-star-filled" : "appraisal-card-star"}
                            fill={filled ? "currentColor" : "none"}
                        />
                    ))}
                </div>
                <span className="appraisal-card-date">
                    {new Date(appraisal.updated_at).toLocaleDateString()}
                </span>
            </div>
        </div>
    )
}
