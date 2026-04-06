import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { ArrowLeft, Pencil, Trash2, Star } from "lucide-react"
import {
    useAppraisal,
    useDecideAppraisal,
    useDeleteAppraisal,
    useSubmitAppraisal,
    useUpdateAppraisal,
} from "@/hooks/useAppraisals"
import type { UpdateAppraisalPayload } from "@/types"
import StatusBadge from "@/components/StatusBadge"
import Modal from "@/components/Modal"
import AppraisalForm from "@/components/AppraisalForm"
import Spinner from "@/components/Spinner"
import "./AppraisalDetailPage.css"

export default function AppraisalDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: appraisal, isLoading } = useAppraisal(id!)
    const deleteAppraisal = useDeleteAppraisal()
    const updateAppraisal = useUpdateAppraisal()
    const submitAppraisal = useSubmitAppraisal()
    const decideAppraisal = useDecideAppraisal()

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [decisionComment, setDecisionComment] = useState("")

    if (isLoading) return <Spinner />
    if (!appraisal) return null

    const handleDelete = () => {
        deleteAppraisal.mutate(appraisal.id, {
            onSuccess: () => navigate("/appraisals"),
        })
    }

    const handleSubmitWorkflow = () => {
        submitAppraisal.mutate(appraisal.id)
    }

    const handleDecision = (decision: "approved" | "rejected") => {
        decideAppraisal.mutate({
            id: appraisal.id,
            payload: {
                decision,
                comments: decisionComment.trim() || undefined,
            },
        })
    }

    const handleUpdate = (payload: UpdateAppraisalPayload) => {
        updateAppraisal.mutate(
            { id: appraisal.id, payload },
            { onSuccess: () => setIsEditing(false) }
        )
    }

    const stars = Array.from({ length: 5 }, (_, i) => i < appraisal.performance_rating)

    return (
        <div className="detail-page animate-fadeIn">
            <button className="detail-back" onClick={() => navigate(-1)}>
                <ArrowLeft size={14} />
                Back
            </button>

            <div className="detail-header">
                <div className="detail-header-left">
                    <h1 className="detail-period">{appraisal.appraisal_period}</h1>
                    <div className="detail-meta">
                        <StatusBadge status={appraisal.status} />
                        <span>
                            Updated {new Date(appraisal.updated_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div className="detail-actions">
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        <Pencil size={14} />
                        {isEditing ? "Cancel" : "Edit"}
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
            </div>

            {isEditing ? (
                <div className="detail-edit-form">
                    <AppraisalForm
                        initialData={appraisal}
                        onSubmit={(data) => handleUpdate(data as UpdateAppraisalPayload)}
                        isSubmitting={updateAppraisal.isPending}
                        mode="edit"
                    />
                </div>
            ) : (
                <>
                    <div className="detail-section">
                        <h3 className="detail-section-title">People</h3>
                        <div className="detail-people">
                            <div className="detail-person">
                                <div className="detail-person-label">Employee</div>
                                <div className="detail-person-name">{appraisal.employee_name}</div>
                                <div className="detail-person-id">{appraisal.employee_id}</div>
                            </div>
                            <div className="detail-person">
                                <div className="detail-person-label">Reviewer</div>
                                <div className="detail-person-name">{appraisal.reviewer_name}</div>
                                <div className="detail-person-id">{appraisal.reviewer_id}</div>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3 className="detail-section-title">Performance Rating</h3>
                        <div className="detail-rating">
                            {stars.map((filled, i) => (
                                <Star
                                    key={i}
                                    size={20}
                                    className={
                                        filled ? "detail-rating-star-filled" : "detail-rating-star"
                                    }
                                    fill={filled ? "currentColor" : "none"}
                                />
                            ))}
                            <span className="detail-rating-value">
                                {appraisal.performance_rating}/5
                            </span>
                        </div>
                    </div>

                    {appraisal.goals_achieved.length > 0 && (
                        <div className="detail-section">
                            <h3 className="detail-section-title">Goals Achieved</h3>
                            <div className="detail-goals-list">
                                {appraisal.goals_achieved.map((goal) => (
                                    <span key={goal} className="detail-goal">
                                        {goal}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {appraisal.strengths && (
                        <div className="detail-section">
                            <h3 className="detail-section-title">Strengths</h3>
                            <div className="detail-text-block">{appraisal.strengths}</div>
                        </div>
                    )}

                    {appraisal.areas_for_improvement && (
                        <div className="detail-section">
                            <h3 className="detail-section-title">Areas for Improvement</h3>
                            <div className="detail-text-block">
                                {appraisal.areas_for_improvement}
                            </div>
                        </div>
                    )}

                    {appraisal.comments && (
                        <div className="detail-section">
                            <h3 className="detail-section-title">Comments</h3>
                            <div className="detail-text-block">{appraisal.comments}</div>
                        </div>
                    )}

                    <div className="detail-section">
                        <h3 className="detail-section-title">Status Actions</h3>
                        <div className="detail-status-actions">
                            <span className="detail-status-label">Transition to:</span>
                            {appraisal.status === "draft" && (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={handleSubmitWorkflow}
                                    disabled={submitAppraisal.isPending}
                                >
                                    {submitAppraisal.isPending ? "Submitting..." : "Submit"}
                                </button>
                            )}
                            {appraisal.status === "submitted" && (
                                <>
                                    <textarea
                                        className="textarea-field"
                                        value={decisionComment}
                                        onChange={(e) => setDecisionComment(e.target.value)}
                                        placeholder="Decision notes (optional)"
                                    />
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => handleDecision("approved")}
                                        disabled={decideAppraisal.isPending}
                                    >
                                        {decideAppraisal.isPending ? "Saving..." : "Approve"}
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDecision("rejected")}
                                        disabled={decideAppraisal.isPending}
                                    >
                                        {decideAppraisal.isPending ? "Saving..." : "Reject"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            <Modal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Appraisal"
                actions={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleDelete}
                            disabled={deleteAppraisal.isPending}
                        >
                            {deleteAppraisal.isPending ? "Deleting..." : "Delete"}
                        </button>
                    </>
                }
            >
                Are you sure you want to delete this appraisal for{" "}
                <strong>{appraisal.appraisal_period}</strong>? This action cannot be
                undone.
            </Modal>
        </div>
    )
}
