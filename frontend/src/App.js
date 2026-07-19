import React, { useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { BetaOnboarding } from "@/components/BetaOnboarding";
import { TrustFooter } from "@/components/TrustFooter";

import { AuthProvider } from "@/contexts/AuthContext";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { RequireAuth, RequireAgreement, RequireAdmin } from "@/components/portal/guards";
import InviteCodePage from "@/components/portal/pages/InviteCodePage";
import RegisterPage from "@/components/portal/pages/RegisterPage";
import LoginPage from "@/components/portal/pages/LoginPage";
import AgreementPage from "@/components/portal/pages/AgreementPage";
import DashboardPage from "@/components/portal/pages/DashboardPage";
import ProfilePage from "@/components/portal/pages/ProfilePage";
import FeedbackPage from "@/components/portal/pages/FeedbackPage";
import AdminOverviewPage from "@/components/portal/pages/AdminOverviewPage";
import AdminParticipantsPage from "@/components/portal/pages/AdminParticipantsPage";
import AdminParticipantDetailPage from "@/components/portal/pages/AdminParticipantDetailPage";
import AdminCodesPage from "@/components/portal/pages/AdminCodesPage";
import AdminFeedbackPage from "@/components/portal/pages/AdminFeedbackPage";

function LandingPage() {
  const onboardingRef = useRef(null);
  const scrollToSetup = () => {
    onboardingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection onStartSetup={scrollToSetup} />
        <HowItWorks />
        <BetaOnboarding ref={onboardingRef} />
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
          {/* Public landing (unchanged) */}
          <Route path="/" element={<LandingPage />} />

          {/* Public portal auth flow */}
          <Route path="/portal/join" element={<InviteCodePage />} />
          <Route path="/portal/register" element={<RegisterPage />} />
          <Route path="/portal/login" element={<LoginPage />} />
          <Route path="/portal/agreement" element={<RequireAuth><AgreementPage /></RequireAuth>} />

          {/* Participant portal (agreement required) */}
          <Route
            path="/portal"
            element={
              <RequireAuth>
                <RequireAgreement>
                  <PortalLayout mode="participant" />
                </RequireAgreement>
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin portal */}
          <Route
            path="/portal/admin"
            element={
              <RequireAuth>
                <RequireAgreement>
                  <RequireAdmin>
                    <PortalLayout mode="admin" />
                  </RequireAdmin>
                </RequireAgreement>
              </RequireAuth>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="participants" element={<AdminParticipantsPage />} />
            <Route path="participants/:id" element={<AdminParticipantDetailPage />} />
            <Route path="codes" element={<AdminCodesPage />} />
            <Route path="feedback" element={<AdminFeedbackPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
