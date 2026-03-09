import { Users } from "lucide-react"
import { useEmployees } from "@/hooks/useEmployees"
import Spinner from "@/components/Spinner"
import EmptyState from "@/components/EmptyState"
import "./EmployeesPage.css"

export default function EmployeesPage() {
    const { data: employees, isLoading } = useEmployees()

    if (isLoading) return <Spinner />

    if (!employees || employees.length === 0) {
        return (
            <EmptyState
                icon={<Users size={40} />}
                title="No employees found"
                description="No employees have been registered yet"
            />
        )
    }

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Employees</h1>
                    <p className="page-subtitle">{employees.length} registered employees</p>
                </div>
            </div>

            <div className="employees-table-wrapper">
                <table className="employees-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>ID</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => {
                            const initials = emp.employee_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)

                            return (
                                <tr key={emp.id}>
                                    <td>
                                        <div className="employee-name-cell">
                                            <div className="employee-avatar">{initials}</div>
                                            {emp.employee_name}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="employee-id-badge">{emp.employee_id}</span>
                                    </td>
                                    <td>{emp.email}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
