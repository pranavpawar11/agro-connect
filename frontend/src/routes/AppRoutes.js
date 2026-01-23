import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Loading from '../components/common/Loading';

// Public Pages
import SplashScreen from '../pages/SplashScreen';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Farmer Pages
import FarmerHome from '../pages/farmer/FarmerHome';
import CropPrediction from '../pages/farmer/CropPrediction';
import PredictionHistory from '../pages/farmer/PredictionHistory';
import Contracts from '../pages/farmer/Contracts';
import ContractDetail from '../pages/farmer/ContractDetail';
import MyApplications from '../pages/farmer/MyApplications';
import Alerts from '../pages/farmer/Alerts';
import MandiPrices from '../pages/farmer/MandiPrices';
import Schemes from '../pages/farmer/Schemes';
import SchemeDetail from '../pages/farmer/SchemeDetail';
import FarmerProfile from '../pages/farmer/Profile';

// Company Pages
import CompanyDashboard from '../pages/company/CompanyDashboard';
import CreateContract from '../pages/company/CreateContract';
import MyContracts from '../pages/company/MyContracts';
import ContractApplicants from '../pages/company/ContractApplicants';
import CompanyDisputes from '../pages/company/Disputes';
import CompanyProfile from '../pages/company/Profile';

// Admin Pages 
import AdminDashboard from '../pages/admin/AdminDashboard';
import CompanyVerification from '../pages/admin/CompanyVerification';
import UserManagement from '../pages/admin/UserManagement';
import ContractManagement from '../pages/admin/ContractManagement';
import DisputeManagement from '../pages/admin/DisputeManagement';
import AlertManagement from '../pages/admin/AlertManagement';
import MandiPriceManagement from '../pages/admin/MandiPriceManagement';
import SchemeManagement from '../pages/admin/SchemeManagement';
import AdminProfile from '../pages/admin/Profile';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<SplashScreen />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}/home`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}/home`} /> : <Register />} />

      {/* Farmer Routes */}
      <Route
        path="/farmer/home"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/crop-prediction"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <CropPrediction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/prediction-history"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <PredictionHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/contracts"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <Contracts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/contracts/:contractId"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <ContractDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/applications"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <MyApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/alerts"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <Alerts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/mandi-prices"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <MandiPrices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/schemes"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <Schemes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/schemes/:schemeId"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <SchemeDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/profile"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerProfile />
          </ProtectedRoute>
        }
      />

      {/* Company Routes */}
      <Route
        path="/company/home"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/dashboard"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/create-contract"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <CreateContract />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/contracts"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <MyContracts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/contracts/:contractId/applicants"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <ContractApplicants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/contracts/:contractId"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <ContractApplicants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/disputes"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <CompanyDisputes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/profile"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <CompanyProfile />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/home"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CompanyVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/contracts"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ContractManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/disputes"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DisputeManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/alerts"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AlertManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/mandi-prices"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MandiPriceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/schemes"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SchemeManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;