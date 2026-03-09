import { useState } from "react"
import { FileText } from "lucide-react"
import type { AppraisalStatus } from "@/types"
import { useMyAppraisals } from "@/hooks/useAppraisals"
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

export default function MyAppraisalsPage() {
    const [filter, setFilter] = useState<AppraisalStatus | "all">("all")
    const { data, isLoading } = useMyAppraisals()

    if (isLoading) return <Spinner />

    const appraisals = data?.appraisals ?? []
    const filtered =
        filter === "all" ? appraisals : appraisals.filter((a) => a.status === filter)

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Appraisals</h1>
                    <p className="page-subtitle">Appraisals where you are the subject</p>
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
                        <AppraisalCard key={appraisal.id} appraisal={appraisal} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={<FileText size={40} />}
                    title="No appraisals found"
                    description={
                        filter === "all"
                            ? "You haven't received any appraisals yet"
                            : `No ${filter} appraisals`
                    }
                />
            )}
        </div>
    )
}
