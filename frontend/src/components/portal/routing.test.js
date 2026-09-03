import {
  isAdministrativeUser,
  resolvePostLoginPath,
} from "./routing";

describe("portal role routing", () => {
  it("routes administrators directly to administrative tools", () => {
    const administrator = {
      role: "administrator",
      agreement_accepted: false,
    };

    expect(isAdministrativeUser(administrator)).toBe(true);
    expect(resolvePostLoginPath(administrator)).toBe("/portal/admin");
    expect(
      resolvePostLoginPath(administrator, "/portal/admin/codes")
    ).toBe("/portal/admin/codes");
  });

  it("routes beta customers through the agreement until accepted", () => {
    expect(
      resolvePostLoginPath({
        role: "subscriber",
        agreement_accepted: false,
      })
    ).toBe("/portal/agreement");

    expect(
      resolvePostLoginPath({
        role: "subscriber",
        agreement_accepted: true,
      })
    ).toBe("/portal/dashboard");
  });
});
