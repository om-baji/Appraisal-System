import { useState } from "react"
import { useNavigate } from "react-router"
import { BarChart3, Plus } from "lucide-react"
import type { AppraisalStatus } from "@/types"
import { useAppraisals } from "@/hooks/useAppraisals"
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

export default function AllAppraisalsPage() {
    const navigate = useNavigate()
    const [statusFilter, setStatusFilter] = useState<AppraisalStatus | "all">("all")
    const { data, isLoading } = useAppraisals(
        statusFilter === "all" ? undefined : { status: statusFilter }
    )

    if (isLoading) return <Spinner />

    const appraisals = data?.appraisals ?? []

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">All Appraisals</h1>
                    <p className="page-subtitle">{data?.count ?? 0} total appraisals</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate("/appraisals/new")}>
                    <Plus size={16} />
                    New Appraisal
                </button>
            </div>

            <div className="appraisals-page-filters">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        className={`filter-tab ${statusFilter === tab.value ? "filter-tab-active" : ""}`}
                        onClick={() => setStatusFilter(tab.value)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {appraisals.length > 0 ? (
                <div className="appraisals-grid">
                    {appraisals.map((appraisal) => (
                        <AppraisalCard key={appraisal.id} appraisal={appraisal} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={<BarChart3 size={40} />}
                    title="No appraisals found"
                    description="Get started by creating a new appraisal"
                    action={
                        <button className="btn btn-secondary" onClick={() => navigate("/appraisals/new")}>
                            <Plus size={14} />
                            Create Appraisal
                        </button>
                    }
                />
            )}
        </div>
    )
}
