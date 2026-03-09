import { useState, type FormEvent } from "react"
import { Link } from "react-router"
import { useSignup } from "@/hooks/useAuth"
import "./LoginPage.css"

export default function SignupPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const signup = useSignup()

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        signup.mutate({ employee_name: name, email, password })
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-logo">
                        Appraisal<span>sys</span>
                    </h1>
                    <p className="login-subtitle">Create a new account</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-name">Full Name</label>
                        <input
                            id="signup-name"
                            className="input-field"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-email">Email</label>
                        <input
                            id="signup-email"
                            className="input-field"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-password">Password</label>
                        <input
                            id="signup-password"
                            className="input-field"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={signup.isPending}>
                        {signup.isPending ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <div className="login-footer">
                    Already have an account?
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    )
}
