import { NavLink, Outlet, useLocation } from "react-router"
import { useAtomValue } from "jotai"
import {
    LayoutDashboard,
    FileText,
    ClipboardCheck,
    BarChart3,
    Users,
    LogOut,
} from "lucide-react"
import { userAtom } from "@/store/auth"
import { useLogout } from "@/hooks/useAuth"
import "./Layout.css"

const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/my-appraisals", label: "My Appraisals", icon: FileText },
    { to: "/my-reviews", label: "My Reviews", icon: ClipboardCheck },
    { to: "/appraisals", label: "All Appraisals", icon: BarChart3 },
    { to: "/employees", label: "Employees", icon: Users },
]

const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/my-appraisals": "My Appraisals",
    "/my-reviews": "My Reviews",
    "/appraisals": "All Appraisals",
    "/appraisals/new": "Create Appraisal",
    "/employees": "Employees",
}

export default function Layout() {
    const user = useAtomValue(userAtom)
    const logout = useLogout()
    const location = useLocation()

    const currentTitle =
        pageTitles[location.pathname] ??
        (location.pathname.startsWith("/appraisals/") ? "Appraisal Details" : "")

    const initials = user?.employee_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "?"

    return (
        <div className="layout">
            <aside className="layout-sidebar">
                <div className="layout-sidebar-header">
                    <div className="layout-sidebar-logo">
                        Appraisal<span>sys</span>
                    </div>
                </div>

                <nav className="layout-sidebar-nav">
                    <span className="layout-sidebar-section-label">Menu</span>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) =>
                                `layout-nav-link ${isActive ? "layout-nav-link-active" : ""}`
                            }
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="layout-sidebar-footer">
                    <div className="layout-user-info">
                        <div className="layout-user-avatar">{initials}</div>
                        <div className="layout-user-details">
                            <div className="layout-user-name">{user?.employee_name}</div>
                            <div className="layout-user-id">{user?.employee_id}</div>
                        </div>
                        <button
                            className="layout-logout-btn"
                            onClick={() => logout.mutate()}
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            <div className="layout-main">
                <header className="layout-topbar">
                    <span className="layout-topbar-title">{currentTitle}</span>
                </header>
                <main className="layout-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
