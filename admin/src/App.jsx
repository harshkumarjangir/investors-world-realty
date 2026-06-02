import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './common/AuthContext.jsx';
import { I18nProvider } from './common/i18n.jsx';
import ProtectedRoute from './common/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Associates from './pages/Associates.jsx';
import AssociateDetail from './pages/AssociateDetail.jsx';
import Genealogy from './pages/Genealogy.jsx';
import Payouts from './pages/Payouts.jsx';
import Funds from './pages/Funds.jsx';
import Transactions from './pages/Transactions.jsx';
import Reports from './pages/Reports.jsx';
import Properties from './pages/Properties.jsx';
import KYC from './pages/KYC.jsx';
import Notifications from './pages/Notifications.jsx';
import Config from './pages/Config.jsx';
import Commissions from './pages/Commissions.jsx';
import Promotions from './pages/Promotions.jsx';
import CompanyDetails from './pages/CompanyDetails.jsx';
import Downline from './pages/Downline.jsx';
import Masters from './pages/Masters.jsx';

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="associates" element={<Associates />} />
              <Route path="associates/:id" element={<AssociateDetail />} />
              <Route path="genealogy" element={<Genealogy />} />
              <Route path="downline" element={<Downline />} />
              <Route path="payouts" element={<Payouts />} />
              <Route path="funds" element={<Funds />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="reports" element={<Reports />} />
              <Route path="properties" element={<Properties />} />
              <Route path="kyc" element={<KYC />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="commissions" element={<Commissions />} />
              <Route path="promotions" element={<Promotions />} />
              <Route path="company" element={<CompanyDetails />} />
              <Route path="config" element={<Config />} />
              <Route path="masters" element={<Masters />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}
