import { useNavigate } from "react-router"
import {
    FileText,
    ClipboardCheck,
    CheckCircle2,
    Star,
    Plus,
} from "lucide-react"
import { useMyAppraisals, useMyReviewQueue, useMySummary } from "@/hooks/useAppraisals"
import StatsCard from "@/components/StatsCard"
import AppraisalCard from "@/components/AppraisalCard"
import Spinner from "@/components/Spinner"
import EmptyState from "@/components/EmptyState"
import "./DashboardPage.css"

export default function DashboardPage() {
    const navigate = useNavigate()
    const { data: myAppraisals, isLoading: loadingAppraisals } = useMyAppraisals()
    const { data: summary, isLoading: loadingSummary } = useMySummary()
    const { data: reviewQueue, isLoading: loadingQueue } = useMyReviewQueue({
        status: "submitted",
        limit: 6,
    })

    if (loadingAppraisals || loadingSummary || loadingQueue) return <Spinner />

    const appraisals = myAppraisals?.appraisals ?? []
    const queue = reviewQueue?.appraisals ?? []

    const approvedCount = summary?.approved_count ?? 0
    const pendingReviews = summary?.submitted_reviews_count ?? 0
    const avgRating =
        typeof summary?.average_rating === "number" ? summary.average_rating.toFixed(1) : "0.0"

    const recentAppraisals = [...appraisals]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 6)

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Overview of your appraisal activity</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate("/appraisals/new")}>
                    <Plus size={16} />
                    New Appraisal
                </button>
            </div>

            <div className="dashboard-stats">
                <StatsCard
                    icon={<FileText size={20} />}
                    label="My Appraisals"
                    value={summary?.my_appraisals_count ?? appraisals.length}
                />
                <StatsCard
                    icon={<ClipboardCheck size={20} />}
                    label="Pending Reviews"
                    value={pendingReviews}
                />
                <StatsCard
                    icon={<CheckCircle2 size={20} />}
                    label="Approved"
                    value={approvedCount}
                />
                <StatsCard
                    icon={<Star size={20} />}
                    label="Avg Rating"
                    value={avgRating}
                />
            </div>

            <div className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2 className="dashboard-section-title">Recent Appraisals</h2>
                </div>
                {recentAppraisals.length > 0 ? (
                    <div className="dashboard-grid">
                        {recentAppraisals.map((appraisal) => (
                            <AppraisalCard key={appraisal.id} appraisal={appraisal} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<FileText size={40} />}
                        title="No appraisals yet"
                        description="Create your first appraisal to get started"
                        action={
                            <button className="btn btn-secondary" onClick={() => navigate("/appraisals/new")}>
                                <Plus size={14} />
                                Create Appraisal
                            </button>
                        }
                    />
                )}
            </div>

            <div className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2 className="dashboard-section-title">Review Queue</h2>
                </div>
                {queue.length > 0 ? (
                    <div className="dashboard-grid">
                        {queue.map((appraisal) => (
                            <AppraisalCard key={appraisal.id} appraisal={appraisal} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<ClipboardCheck size={40} />}
                        title="No pending reviews"
                        description="Submitted appraisals assigned to you will appear here"
                    />
                )}
            </div>
        </div>
    )
}
