import { useState, type FormEvent } from "react"
import { Link } from "react-router"
import { useLogin } from "@/hooks/useAuth"
import "./LoginPage.css"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const login = useLogin()

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        login.mutate({ email, password })
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-logo">
                        Appraisal<span>sys</span>
                    </h1>
                    <p className="login-subtitle">Sign in to your account</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
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
                        <label className="form-label" htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            className="input-field"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={login.isPending}>
                        {login.isPending ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="login-footer">
                    Don't have an account?
                    <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    )
}
