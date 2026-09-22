import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock(
  "react-router-dom",
  () => ({ Link: ({ children }) => children }),
  { virtual: true }
);

import { ProtectedLinesList } from "./DashboardPage";
import { ApplicationHandoff, ForwardingInstructions } from "./ProtectedLineSetupPage";

describe("customer lifecycle views", () => {
  it("renders the backend-owned exact-line forwarding instructions", () => {
    const markup = renderToStaticMarkup(
      <ForwardingInstructions
        provisioning={{
          forwardingInstructions: {
            protectedPhoneNumber: "+15550002000",
            screeningNumber: "+15550003000",
            instructions: "Backend says to forward this exact line to its assigned system number.",
          },
        }}
      />
    );

    expect(markup).toContain("+15550002000");
    expect(markup).toContain("+15550003000");
    expect(markup).toContain(
      "Backend says to forward this exact line to its assigned system number."
    );
  });

  it("renders independent line-level coverage and system numbers", () => {
    const markup = renderToStaticMarkup(
      <ProtectedLinesList
        protectedLines={[
          {
            id: 1,
            protectedPhoneNumber: "+15550002111",
            callerFacingBusinessName: "First Line",
            screeningNumber: "+15550003111",
            coverageStatus: "active",
            forwardingStatus: "confirmed",
            carrier: "Carrier One",
          },
          {
            id: 2,
            protectedPhoneNumber: "+15550002222",
            callerFacingBusinessName: "Second Line",
            screeningNumber: null,
            coverageStatus: "inactive",
            forwardingStatus: "not_started",
            carrier: "Carrier Two",
          },
        ]}
        copiedLineId={null}
        onCopy={() => {}}
      />
    );

    expect(markup).toContain("+15550002111");
    expect(markup).toContain("+15550003111");
    expect(markup).toContain("Active");
    expect(markup).toContain("+15550002222");
    expect(markup).toContain("Inactive");
    expect(markup).toContain("Not assigned");
  });

  it("presents only the Phone-Model-derived application handoff", () => {
    const available = renderToStaticMarkup(
      <ApplicationHandoff handoff={{
        compatibility: "supported",
        platform: "ios",
        status: "available",
        url: "https://example.test/ios",
      }} />
    );
    expect(available).toContain("Install NMSC for");
    expect(available).toContain("iPhone");
    expect(available).toContain("https://example.test/ios");

    const unavailable = renderToStaticMarkup(
      <ApplicationHandoff handoff={{
        compatibility: "supported",
        platform: "android",
        status: "distribution_unavailable",
        url: null,
      }} />
    );
    expect(unavailable).toContain("Application installation is not available yet");
    expect(unavailable).toContain("Android");

    const unsupported = renderToStaticMarkup(
      <ApplicationHandoff handoff={{
        compatibility: "unsupported",
        platform: null,
        status: "unsupported",
        url: null,
      }} />
    );
    expect(unsupported).toContain("not currently supported");
    expect(unsupported).toContain("No System Number was assigned");
  });
});
