import { useNavigate } from "react-router"
import { ArrowLeft } from "lucide-react"
import { useCreateAppraisal } from "@/hooks/useAppraisals"
import { useEmployees } from "@/hooks/useEmployees"
import type { CreateAppraisalPayload } from "@/types"
import AppraisalForm from "@/components/AppraisalForm"
import Spinner from "@/components/Spinner"
import "./CreateAppraisalPage.css"

export default function CreateAppraisalPage() {
    const navigate = useNavigate()
    const createAppraisal = useCreateAppraisal()
    const { data: employees, isLoading } = useEmployees()

    if (isLoading) return <Spinner />

    const handleSubmit = (data: CreateAppraisalPayload) => {
        createAppraisal.mutate(data, {
            onSuccess: () => navigate("/appraisals"),
        })
    }

    return (
        <div className="create-appraisal-page animate-fadeIn">
            <button className="create-back" onClick={() => navigate(-1)}>
                <ArrowLeft size={14} />
                Back
            </button>

            <div className="page-header">
                <div>
                    <h1 className="page-title">Create Appraisal</h1>
                    <p className="page-subtitle">Fill in the details for a new appraisal</p>
                </div>
            </div>

            <AppraisalForm
                employees={employees}
                onSubmit={(data) => handleSubmit(data as CreateAppraisalPayload)}
                isSubmitting={createAppraisal.isPending}
                mode="create"
            />
        </div>
    )
}
