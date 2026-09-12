export function isAdministrativeUser(user) {
  return user?.role === "admin" || user?.role === "administrator";
}

export function hasActiveProtectedLine(user) {
  return Array.isArray(user?.protected_lines) &&
    user.protected_lines.some(
      (line) => line?.coverageStatus === "active"
    );
}

export function resolvePostLoginPath(user, requestedPath) {
  if (isAdministrativeUser(user)) {
    return requestedPath?.startsWith("/portal/admin")
      ? requestedPath
      : "/portal/admin";
  }

  if (!user?.agreement_accepted) {
    return "/portal/agreement";
  }

  if (!hasActiveProtectedLine(user)) {
    return "/portal/setup";
  }

  return requestedPath?.startsWith("/portal/")
    ? requestedPath
    : "/portal/dashboard";
}
