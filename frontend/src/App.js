import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import "@/App.css";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { TrustFooter } from "@/components/TrustFooter";

import { AuthProvider } from "@/contexts/AuthContext";
import { PortalLayout } from "@/components/portal/PortalLayout";
import {
  RequireAuth,
  RequireAgreement,
  RequireCustomer,
  RequireAdmin,
} from "@/components/portal/guards";
import RegisterPage from "@/components/portal/pages/RegisterPage";
import LoginPage from "@/components/portal/pages/LoginPage";
import AgreementPage from "@/components/portal/pages/AgreementPage";
import ProtectedLineSetupPage from "@/components/portal/pages/ProtectedLineSetupPage";
import DashboardPage from "@/components/portal/pages/DashboardPage";
import ProfilePage from "@/components/portal/pages/ProfilePage";
import FeedbackPage from "@/components/portal/pages/FeedbackPage";
import AdminOverviewPage from "@/components/portal/pages/AdminOverviewPage";
import AdminParticipantsPage from "@/components/portal/pages/AdminParticipantsPage";
import AdminParticipantDetailPage from "@/components/portal/pages/AdminParticipantDetailPage";
import AdminFeedbackPage from "@/components/portal/pages/AdminFeedbackPage";

function LandingPage() {
  const navigate = useNavigate();

  const startBetaSetup = () => {
    navigate("/portal/register");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection onStartSetup={startBetaSetup} />
        <HowItWorks />
      </main>
      <TrustFooter />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/portal/register" element={<RegisterPage />} />
          <Route path="/portal/login" element={<LoginPage />} />
          <Route
            path="/portal/agreement"
            element={
              <RequireAuth>
                <RequireCustomer>
                  <AgreementPage />
                </RequireCustomer>
              </RequireAuth>
            }
          />

          <Route
            path="/portal"
            element={
              <RequireAuth>
                <RequireCustomer>
                  <RequireAgreement>
                    <PortalLayout mode="participant" />
                  </RequireAgreement>
                </RequireCustomer>
              </RequireAuth>
            }
          >
            <Route path="setup" element={<ProtectedLineSetupPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route
            path="/portal/admin"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <PortalLayout mode="admin" />
                </RequireAdmin>
              </RequireAuth>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="participants" element={<AdminParticipantsPage />} />
            <Route
              path="participants/:id"
              element={<AdminParticipantDetailPage />}
            />
            <Route path="feedback" element={<AdminFeedbackPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
