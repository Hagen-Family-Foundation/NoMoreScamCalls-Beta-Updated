/**
 * Portal API Client
 * ==================
 * Centralized fetch wrapper for the NoMoreScamCalls Beta Portal.
 * Base URL is read from REACT_APP_PORTAL_API_BASE_URL — never hard-coded.
 * All authenticated requests attach: Authorization: Bearer <token>
 *
 * If the backend endpoint contract changes, edit only the paths in ENDPOINTS
 * and (if needed) the request/response shape in the exported functions below.
 */

const API_BASE = process.env.REACT_APP_PORTAL_API_BASE_URL;

const TOKEN_STORAGE_KEY = "nmsc_portal_token";

/* ─── Token storage (centralized so it can be swapped for cookie-based later) ─── */

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* storage unavailable — no-op */
  }
}

/* ─── Endpoint paths (single source of truth) ─── */

const ENDPOINTS = {
  VALIDATE_CODE: "/portal/invite-codes/validate",
  REGISTER: "/portal/auth/register",
  LOGIN: "/portal/auth/login",
  LOGOUT: "/portal/auth/logout",
  ME: "/portal/me",
  ACCEPT_AGREEMENT: "/portal/agreement/accept",
  ME_SUMMARY: "/portal/me/summary",
  ME_CALLS: "/portal/me/calls",
  ME_FEEDBACK: "/portal/me/feedback",
  ADMIN_STATS: "/portal/admin/stats",
  ADMIN_PARTICIPANTS: "/portal/admin/participants",
  ADMIN_PARTICIPANT: (id) => `/portal/admin/participants/${id}`,
  ADMIN_PARTICIPANT_CALLS: (id) => `/portal/admin/participants/${id}/calls`,
  ADMIN_INVITE_CODES: "/portal/admin/invite-codes",
  ADMIN_INVITE_CODE: (id) => `/portal/admin/invite-codes/${id}`,
  ADMIN_FEEDBACK: "/portal/admin/feedback",
  ADMIN_FEEDBACK_ITEM: (id) => `/portal/admin/feedback/${id}`,
};

/* ─── Core fetch wrapper ─── */

async function request(path, { method = "GET", body, auth = false, query } = {}) {
  if (!API_BASE) {
    throw new Error(
      "Portal API base URL is not configured. Set REACT_APP_PORTAL_API_BASE_URL."
    );
  }

  const url = new URL(API_BASE + path);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }

  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getStoredToken();
    if (!token) throw new Error("You are signed out. Please sign in again.");
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("We could not reach the portal server. Please check your connection and try again.");
  }

  if (response.status === 401 || response.status === 403) {
    if (auth) setStoredToken(null);
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || data.error || "You are not authorized. Please sign in again.");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || data.error || `Request failed (${response.status}).`);
  }

  if (response.status === 204) return null;
  return response.json().catch(() => ({}));
}

/* ─── Public API surface ─── */

export const portalApi = {
  /* Invitation code */
  validateInviteCode: (code) =>
    request(ENDPOINTS.VALIDATE_CODE, { method: "POST", body: { code } }),

  /* Auth */
  register: (payload) =>
    request(ENDPOINTS.REGISTER, { method: "POST", body: payload }),
  login: ({ email, password }) =>
    request(ENDPOINTS.LOGIN, { method: "POST", body: { email, password } }),
  logout: () =>
    request(ENDPOINTS.LOGOUT, { method: "POST", auth: true }),

  /* Current user */
  me: () => request(ENDPOINTS.ME, { auth: true }),
  updateMe: (payload) =>
    request(ENDPOINTS.ME, { method: "PATCH", body: payload, auth: true }),
  acceptAgreement: (version) =>
    request(ENDPOINTS.ACCEPT_AGREEMENT, {
      method: "POST",
      body: { version },
      auth: true,
    }),
  mySummary: () => request(ENDPOINTS.ME_SUMMARY, { auth: true }),
  myCalls: (limit = 20) =>
    request(ENDPOINTS.ME_CALLS, { auth: true, query: { limit } }),
  submitFeedback: (payload) =>
    request(ENDPOINTS.ME_FEEDBACK, { method: "POST", body: payload, auth: true }),

  /* Admin */
  adminStats: () => request(ENDPOINTS.ADMIN_STATS, { auth: true }),
  adminParticipants: ({ search, status } = {}) =>
    request(ENDPOINTS.ADMIN_PARTICIPANTS, {
      auth: true,
      query: { search, status },
    }),
  adminParticipant: (id) => request(ENDPOINTS.ADMIN_PARTICIPANT(id), { auth: true }),
  adminUpdateParticipant: (id, payload) =>
    request(ENDPOINTS.ADMIN_PARTICIPANT(id), {
      method: "PATCH",
      body: payload,
      auth: true,
    }),
  adminParticipantCalls: (id) =>
    request(ENDPOINTS.ADMIN_PARTICIPANT_CALLS(id), { auth: true }),
  adminInviteCodes: () => request(ENDPOINTS.ADMIN_INVITE_CODES, { auth: true }),
  adminCreateInviteCode: () =>
    request(ENDPOINTS.ADMIN_INVITE_CODES, { method: "POST", auth: true }),
  adminUpdateInviteCode: (id, payload) =>
    request(ENDPOINTS.ADMIN_INVITE_CODE(id), {
      method: "PATCH",
      body: payload,
      auth: true,
    }),
  adminFeedback: () => request(ENDPOINTS.ADMIN_FEEDBACK, { auth: true }),
  adminUpdateFeedback: (id, payload) =>
    request(ENDPOINTS.ADMIN_FEEDBACK_ITEM(id), {
      method: "PATCH",
      body: payload,
      auth: true,
    }),
};
