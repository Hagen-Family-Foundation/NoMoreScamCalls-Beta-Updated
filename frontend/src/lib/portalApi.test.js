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
});
