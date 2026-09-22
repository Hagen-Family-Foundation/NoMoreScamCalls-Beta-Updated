describe("portal agreement API", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.REACT_APP_PORTAL_API_BASE_URL = "https://api.example.test";
    localStorage.clear();
    localStorage.setItem("nmsc_portal_token", "test-session");
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it("retrieves the backend agreement and submits that exact version", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          agreement: {
            version: "canonical-from-backend",
            title: "Agreement",
            effectiveAt: "2026-07-19T00:00:00Z",
            preamble: [],
            sections: [],
            acceptanceHeading: "Acceptance",
            acceptance: [],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ accepted: true }),
      });

    const { portalApi } = require("./portalApi");
    const agreement = await portalApi.currentAgreement();
    await portalApi.acceptAgreement(agreement.version);

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "https://api.example.test/portal/agreement/current",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-session",
        }),
      })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "https://api.example.test/portal/agreement/accept",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ version: "canonical-from-backend" }),
      })
    );
  });

  it("submits account contact data and the participant-entered beta code", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        registered: true,
        token: "synthetic-session-token",
        user: {
          firstName: "Portal",
          contactPhoneNumber: "+15550001234",
        },
      }),
    });

    const { portalApi } = require("./portalApi");
    const result = await portalApi.register({
      beta_access_code: "2468",
      first_name: "Portal",
      last_name: "Participant",
      email: "portal-participant@example.com",
      contact_phone_number: "+15550001234",
      contact_method: "email",
      password: "synthetic-password",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.test/portal/auth/register",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          betaAccessCode: "2468",
          firstName: "Portal",
          lastName: "Participant",
          email: "portal-participant@example.com",
          contactPhoneNumber: "+15550001234",
          contactMethod: "email",
          password: "synthetic-password",
        }),
      })
    );
    expect(result.user.contact_phone_number).toBe("+15550001234");
  });

  it("keeps backend-owned locations and Protected Lines on the current user", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        user: {
          id: 7,
          firstName: "Portal",
          agreementAccepted: true,
          contactPhoneNumber: "+15550001234",
        },
        locations: [{ id: 10 }],
        protected_lines: [
          {
            id: 20,
            protectedPhoneNumber: "+15550002000",
            coverageStatus: "active",
          },
        ],
      }),
    });

    const { portalApi } = require("./portalApi");
    const currentUser = await portalApi.me();

    expect(currentUser).toMatchObject({
      id: 7,
      agreement_accepted: true,
      contact_phone_number: "+15550001234",
      locations: [{ id: 10 }],
      protected_lines: [
        {
          id: 20,
          protectedPhoneNumber: "+15550002000",
          coverageStatus: "active",
        },
      ],
    });
  });

  it("uses the authenticated exact-line setup and activation routes", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ location: { id: 10 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          protectedLine: {
            id: 20,
            protectedPhoneNumber: "+15550002000",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          provisioning: {
            protectedLine: { id: 20 },
            forwardingInstructions: {
              protectedPhoneNumber: "+15550002000",
              screeningNumber: "+15550003000",
              instructions: "Backend-owned exact-line instructions",
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          coverageActive: true,
          protectedLine: { id: 20, coverageStatus: "active" },
        }),
      });

    const { portalApi } = require("./portalApi");
    await portalApi.createLocation();
    await portalApi.createProtectedLine(10, {
      protectedPhoneNumber: "+15550002000",
      callerFacingBusinessName: "Exact Customer Phrase",
      carrier: "Example Carrier",
    });
    const provisioned = await portalApi.provisionProtectedLine(20);
    await portalApi.confirmProtectedLineForwarding(20);

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "https://api.example.test/portal/me/locations",
      expect.objectContaining({ method: "POST" })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "https://api.example.test/portal/me/locations/10/protected-lines",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          protectedPhoneNumber: "+15550002000",
          callerFacingBusinessName: "Exact Customer Phrase",
          carrier: "Example Carrier",
        }),
      })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      3,
      "https://api.example.test/portal/me/protected-lines/20/provision",
      expect.objectContaining({ method: "POST" })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      4,
      "https://api.example.test/portal/me/protected-lines/20/forwarding-confirm",
      expect.objectContaining({ method: "POST" })
    );
    expect(provisioned.provisioning.forwardingInstructions.instructions)
      .toBe("Backend-owned exact-line instructions");
  });

  it("uses one authenticated onboarding-completion request with recorded Phone Model", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          phoneModels: [
            {
              id: "apple-iphone-16-pro-max",
              manufacturer: "Apple",
              displayName: "iPhone 16 Pro Max",
              platform: "ios",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          completed: true,
          protectedLine: { id: 20, systemNumber: "+15550003000" },
          applicationHandoff: {
            compatibility: "supported",
            platform: "ios",
            status: "available",
            url: "https://example.test/ios",
          },
        }),
      });

    const { portalApi } = require("./portalApi");
    await expect(portalApi.listPhoneModels()).resolves.toHaveLength(1);
    await portalApi.completeBetaOnboarding({
      protectedPhoneNumber: "+15550002000",
      callerFacingBusinessName: "Exact Customer Phrase",
      carrier: "Example Carrier",
      phoneModelId: "apple-iphone-16-pro-max",
    });

    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "https://api.example.test/portal/me/onboarding-completion",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          protectedPhoneNumber: "+15550002000",
          callerFacingBusinessName: "Exact Customer Phrase",
          carrier: "Example Carrier",
          phoneModelId: "apple-iphone-16-pro-max",
        }),
      })
    );
  });
});
