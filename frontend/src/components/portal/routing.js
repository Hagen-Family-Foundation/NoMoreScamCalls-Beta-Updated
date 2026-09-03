export function isAdministrativeUser(user) {
  return user?.role === "admin" || user?.role === "administrator";
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

  return requestedPath?.startsWith("/portal/")
    ? requestedPath
    : "/portal/dashboard";
}
