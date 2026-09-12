import {
  hasActiveProtectedLine,
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
      resolvePostLoginPath(administrator, "/portal/admin/participants")
    ).toBe("/portal/admin/participants");
  });

  it("routes customers through agreement and Protected Line activation", () => {
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
    ).toBe("/portal/setup");

    const activeCustomer = {
      role: "subscriber",
      agreement_accepted: true,
      protected_lines: [
        { id: 1, coverageStatus: "inactive" },
        { id: 2, coverageStatus: "active" },
      ],
    };
    expect(hasActiveProtectedLine(activeCustomer)).toBe(true);
    expect(resolvePostLoginPath(activeCustomer)).toBe("/portal/dashboard");
  });
});
