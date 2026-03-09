import { useState, type FormEvent } from "react"
import { Star, X, Plus } from "lucide-react"
import type { Appraisal, CreateAppraisalPayload, Employee, UpdateAppraisalPayload } from "@/types"
import "./AppraisalForm.css"

interface AppraisalFormProps {
    employees?: Employee[]
    initialData?: Appraisal
    onSubmit: (data: CreateAppraisalPayload | UpdateAppraisalPayload) => void
    isSubmitting: boolean
    mode: "create" | "edit"
}

export default function AppraisalForm({
    employees,
    initialData,
    onSubmit,
    isSubmitting,
    mode,
}: AppraisalFormProps) {
    const [employeeId, setEmployeeId] = useState(initialData?.employee_id ?? "")
    const [period, setPeriod] = useState(initialData?.appraisal_period ?? "")
    const [rating, setRating] = useState(initialData?.performance_rating ?? 0)
    const [goals, setGoals] = useState<string[]>(initialData?.goals_achieved ?? [])
    const [goalInput, setGoalInput] = useState("")
    const [strengths, setStrengths] = useState(initialData?.strengths ?? "")
    const [improvements, setImprovements] = useState(initialData?.areas_for_improvement ?? "")
    const [comments, setComments] = useState(initialData?.comments ?? "")

    const handleAddGoal = () => {
        const trimmed = goalInput.trim()
        if (trimmed && !goals.includes(trimmed)) {
            setGoals([...goals, trimmed])
            setGoalInput("")
        }
    }

    const handleRemoveGoal = (goal: string) => {
        setGoals(goals.filter((g) => g !== goal))
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()

        if (mode === "create") {
            const payload: CreateAppraisalPayload = {
                employee_id: employeeId,
                appraisal_period: period,
                performance_rating: rating,
                goals_achieved: goals,
                strengths,
                areas_for_improvement: improvements,
                comments,
            }
            onSubmit(payload)
        } else {
            const payload: UpdateAppraisalPayload = {
                appraisal_period: period,
                performance_rating: rating,
                goals_achieved: goals,
                strengths,
                areas_for_improvement: improvements,
                comments,
            }
            onSubmit(payload)
        }
    }

    const stars = Array.from({ length: 5 }, (_, i) => i + 1)

    return (
        <form className="appraisal-form" onSubmit={handleSubmit}>
            <div className="appraisal-form-row">
                {mode === "create" && (
                    <div className="form-group">
                        <label className="form-label" htmlFor="employee-select">Employee</label>
                        <select
                            id="employee-select"
                            className="select-field"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            required
                        >
                            <option value="">Select employee</option>
                            {employees?.map((emp) => (
                                <option key={emp.employee_id} value={emp.employee_id}>
                                    {emp.employee_name} ({emp.employee_id})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="form-group">
                    <label className="form-label" htmlFor="period-input">Appraisal Period</label>
                    <input
                        id="period-input"
                        className="input-field"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        placeholder="e.g. Q1 2026"
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Performance Rating</label>
                <div className="appraisal-form-rating">
                    {stars.map((value) => (
                        <button
                            key={value}
                            type="button"
                            className={`appraisal-form-rating-star ${value <= rating ? "appraisal-form-rating-star-active" : ""
                                }`}
                            onClick={() => setRating(value === rating ? 0 : value)}
                        >
                            <Star size={24} fill={value <= rating ? "currentColor" : "none"} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group appraisal-form-goals">
                <label className="form-label">Goals Achieved</label>
                {goals.length > 0 && (
                    <div className="appraisal-form-goals-list">
                        {goals.map((goal) => (
                            <span key={goal} className="appraisal-form-goal-chip">
                                {goal}
                                <button type="button" onClick={() => handleRemoveGoal(goal)}>
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                <div className="appraisal-form-goal-input-row">
                    <input
                        className="input-field"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder="Add a goal"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddGoal()
                            }
                        }}
                    />
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddGoal}>
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="strengths-input">Strengths</label>
                <textarea
                    id="strengths-input"
                    className="textarea-field"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="Key strengths observed"
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="improvements-input">Areas for Improvement</label>
                <textarea
                    id="improvements-input"
                    className="textarea-field"
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="Suggested areas to improve"
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="comments-input">Comments</label>
                <textarea
                    id="comments-input"
                    className="textarea-field"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Additional comments"
                />
            </div>

            <div className="appraisal-form-actions">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting
                        ? mode === "create"
                            ? "Creating..."
                            : "Saving..."
                        : mode === "create"
                            ? "Create Appraisal"
                            : "Save Changes"}
                </button>
            </div>
        </form>
    )
}
