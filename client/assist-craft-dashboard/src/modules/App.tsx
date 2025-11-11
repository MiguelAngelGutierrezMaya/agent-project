//
// React
//
import { useAuth } from '@clerk/clerk-react';
import React, { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

//
// Components
//
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
//
// Layout
//
import { DashboardLayout } from '@/modules/shared/presentation/components/Layout/DashboardLayout';
//
// Pages
//
import { useBillingValidation } from '@/modules/shared/presentation/hooks/useBillingValidation';
import { LoadingPage } from '@/modules/shared/presentation/pages/Loading/LoadingPage';
import { PaymentRequiredPage } from '@/modules/shared/presentation/pages/PaymentRequired/PaymentRequiredPage';
//
// Router
//
import { ROUTES } from '@/modules/shared/presentation/router';
//
// Hooks
//
//
// Async pages
//
const LoginPage = lazy(() =>
  import('@/modules/auth/presentation/pages/Login/LoginPage').then(module => ({
    default: module.LoginPage,
  }))
);
const DashboardPage = lazy(() =>
  import('@/modules/home/presentation/pages/Dashboard/DashboardPage').then(
    module => ({
      default: module.DashboardPage,
    })
  )
);
const AssistantPage = lazy(() =>
  import('@/modules/assistant/presentation/pages/Assistant/AssistantPage').then(
    module => ({
      default: module.AssistantPage,
    })
  )
);
const TrainingPage = lazy(() =>
  import('@/modules/training/presentation/pages/Training/TrainingPage').then(
    module => ({
      default: module.TrainingPage,
    })
  )
);
const ProfilePage = lazy(() =>
  import('@/modules/profile/presentation/pages/Profile/ProfilePage').then(
    module => ({
      default: module.ProfilePage,
    })
  )
);
const ConfigurePage = lazy(() =>
  import('@/modules/Config/presentation/pages/Configure/ConfigurePage').then(
    module => ({
      default: module.ConfigurePage,
    })
  )
);
const NotFound = lazy(() =>
  import('@/modules/shared/presentation/pages/NotFound/NotFoundPage').then(
    module => ({
      default: module.NotFound,
    })
  )
);

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { isValid, isLoading: isBillingLoading } = useBillingValidation();

  if (!isLoaded || isBillingLoading) {
    return <LoadingPage />;
  }

  if (!isSignedIn) {
    return <Navigate to='/login' />;
  }

  if (!isValid) {
    return <PaymentRequiredPage />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <TooltipProvider>
      <Router>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path={ROUTES.login.main} element={<LoginPage />} />
            <Route
              path={ROUTES.dashboard.main}
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Outlet />
                  </DashboardLayout>
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path={ROUTES.assistant.main} element={<AssistantPage />} />
              <Route path={ROUTES.training.main} element={<TrainingPage />} />
              <Route path={ROUTES.profile.main} element={<ProfilePage />} />
              <Route path={ROUTES.configure.main} element={<ConfigurePage />} />
            </Route>
            <Route path={ROUTES.notFound.main} element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
};

export default App;
