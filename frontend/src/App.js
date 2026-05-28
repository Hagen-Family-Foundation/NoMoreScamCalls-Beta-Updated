import React, { useRef } from "react";
import "@/App.css";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { BetaOnboarding } from "@/components/BetaOnboarding";
import { TrustFooter } from "@/components/TrustFooter";

function App() {
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

export default App;
