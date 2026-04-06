import { useState } from "react"
import { ClipboardCheck } from "lucide-react"
import type { AppraisalStatus } from "@/types"
import { useDecideAppraisal, useMyReviews } from "@/hooks/useAppraisals"
import AppraisalCard from "@/components/AppraisalCard"
import Spinner from "@/components/Spinner"
import EmptyState from "@/components/EmptyState"
import "./MyAppraisalsPage.css"

const tabs: { label: string; value: AppraisalStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Submitted", value: "submitted" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
]

export default function MyReviewsPage() {
    const [filter, setFilter] = useState<AppraisalStatus | "all">("all")
    const { data, isLoading } = useMyReviews()
    const decideAppraisal = useDecideAppraisal()

    if (isLoading) return <Spinner />

    const reviews = data?.appraisals ?? []
    const filtered =
        filter === "all" ? reviews : reviews.filter((a) => a.status === filter)

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Reviews</h1>
                    <p className="page-subtitle">Appraisals where you are the reviewer</p>
                </div>
            </div>

            <div className="appraisals-page-filters">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        className={`filter-tab ${filter === tab.value ? "filter-tab-active" : ""}`}
                        onClick={() => setFilter(tab.value)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {filtered.length > 0 ? (
                <div className="appraisals-grid">
                    {filtered.map((appraisal) => (
                        <div key={appraisal.id}>
                            <AppraisalCard appraisal={appraisal} />
                            {appraisal.status === "submitted" && (
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                        marginTop: "8px",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <button
                                        className="btn btn-success btn-sm"
                                        disabled={decideAppraisal.isPending}
                                        onClick={() =>
                                            decideAppraisal.mutate({
                                                id: appraisal.id,
                                                payload: { decision: "approved" },
                                            })
                                        }
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        disabled={decideAppraisal.isPending}
                                        onClick={() =>
                                            decideAppraisal.mutate({
                                                id: appraisal.id,
                                                payload: { decision: "rejected" },
                                            })
                                        }
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={<ClipboardCheck size={40} />}
                    title="No reviews found"
                    description={
                        filter === "all"
                            ? "You haven't reviewed any appraisals yet"
                            : `No ${filter} reviews`
                    }
                />
            )}
        </div>
    )
}
