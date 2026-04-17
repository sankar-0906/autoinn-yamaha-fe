import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Auth/Login';
import GetStarted from './pages/Auth/GetStarted';
import CompanySettings from './pages/CompanySettings';
import DepartmentPage from './pages/Department/Department';
import EmployeePage from './pages/Employee/Employee';
import ManufacturerPage from './pages/Manufacturer/Manufacturer';
import VehicleMasterPage from './pages/VehicleMaster/VehicleMaster';
import PartsMasterPage from './pages/PartsMaster/PartsMaster';
import DealerMasterPage from './pages/DealerMaster/DealerMaster';
import IdGeneratorPage from './pages/IdGenerator/IdGenerator';
import FrameNumberPage from './pages/FrameNumber/FrameNumber';
import VehicleStockInwardPage from './pages/VehicleStockInward/VehicleStockInward';
import SupplierMasterPage from './components/CompanyMasters/Company/SupplierMaster';
import HSNCodePage from './components/CompanyMasters/Company/HSNCode';
import BranchPage from './components/CompanyMasters/Company/Branch';

import {
  Dashboard,
} from './pages/ModulePlaceholders';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // or a loading spinner

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const [checking, setChecking] = React.useState(true);
  const [hasUsers, setHasUsers] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (user) {
      setChecking(false);
      return;
    }
    import('./api/onboarding').then(m => m.getUserCount()).then(res => {
      const count = res.data?.data?.count ?? (typeof res.data?.data === 'number' ? res.data.data : 0);
      setHasUsers(count > 0);
      setChecking(false);
    }).catch(() => {
      setHasUsers(true); // Default to login on error
      setChecking(false);
    });
  }, [user]);

  if (loading || checking) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return hasUsers ? <Navigate to="/login" replace /> : <Navigate to="/get-started" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Internal Redirector */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Routes */}
          <Route path="/get-started" element={<PublicRoute><GetStarted /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="/company">
              <Route index element={<CompanySettings />} />
              <Route path="settings" element={<CompanySettings />} />
              <Route path="branch" element={<BranchPage />} />
              <Route path="department" element={<DepartmentPage />} />
              <Route path="employee" element={<EmployeePage />} />
              <Route path="manufacturer" element={<ManufacturerPage />} />
              <Route path="vehicle_master" element={<VehicleMasterPage />} />
              <Route path="parts_master" element={<PartsMasterPage />} />
              <Route path="dealer_master" element={<DealerMasterPage />} />
              <Route path="idgenerator" element={<IdGeneratorPage />} />
              <Route path="frame_number" element={<FrameNumberPage />} />
              <Route path="supplier_master" element={<SupplierMasterPage />} />
              <Route path="hsn_code" element={<HSNCodePage />} />
              <Route path="vehicle-stock-inward" element={<VehicleStockInwardPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
