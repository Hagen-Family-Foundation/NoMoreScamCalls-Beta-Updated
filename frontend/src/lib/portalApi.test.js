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
});
