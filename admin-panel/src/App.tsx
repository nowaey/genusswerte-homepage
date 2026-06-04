import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext, useAuthInit } from './store/auth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { OrdersPage } from './pages/OrdersPage'
import { VouchersPage } from './pages/VouchersPage'
import { SlotsPage } from './pages/SlotsPage'
import { ReservationsPage } from './pages/ReservationsPage'

export function App() {
  const { state, signIn, signOut } = useAuthInit()

  const authValue = {
    ...state,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="orders"       element={<OrdersPage />} />
            <Route path="vouchers"     element={<VouchersPage />} />
            <Route path="slots"        element={<SlotsPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
