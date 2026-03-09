import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Layout from "@/components/Layout"
import ProtectedRoute from "@/components/ProtectedRoute"
import LoginPage from "@/pages/LoginPage"
import SignupPage from "@/pages/SignupPage"
import DashboardPage from "@/pages/DashboardPage"
import MyAppraisalsPage from "@/pages/MyAppraisalsPage"
import MyReviewsPage from "@/pages/MyReviewsPage"
import AllAppraisalsPage from "@/pages/AllAppraisalsPage"
import AppraisalDetailPage from "@/pages/AppraisalDetailPage"
import CreateAppraisalPage from "@/pages/CreateAppraisalPage"
import EmployeesPage from "@/pages/EmployeesPage"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="my-appraisals" element={<MyAppraisalsPage />} />
            <Route path="my-reviews" element={<MyReviewsPage />} />
            <Route path="appraisals" element={<AllAppraisalsPage />} />
            <Route path="appraisals/new" element={<CreateAppraisalPage />} />
            <Route path="appraisals/:id" element={<AppraisalDetailPage />} />
            <Route path="employees" element={<EmployeesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
