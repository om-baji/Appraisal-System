import "./Spinner.css"

interface SpinnerProps {
    size?: "sm" | "md" | "lg"
}

export default function Spinner({ size = "md" }: SpinnerProps) {
    return (
        <div className="spinner-container">
            <div className={`spinner ${size !== "md" ? `spinner-${size}` : ""}`} />
        </div>
    )
}
