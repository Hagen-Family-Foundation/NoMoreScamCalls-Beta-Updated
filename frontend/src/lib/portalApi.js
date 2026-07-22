/**
 * Portal API Client
 * =================
 * Centralized fetch wrapper for the NoMoreScamCalls Subscriber Portal.
 *
 * The backend uses camelCase request and response fields.
 * The existing frontend pages use snake_case user fields.
 * This client performs that translation in one location.
 */

const API_BASE = process.env.REACT_APP_PORTAL_API_BASE_URL;

const TOKEN_STORAGE_KEY = "nmsc_portal_token";

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    /* Storage unavailable. */
  }
}

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
  ADMIN_PARTICIPANT_CALLS: (id) =>
    `/portal/admin/participants/${id}/calls`,
  ADMIN_INVITE_CODES: "/portal/admin/invite-codes",
  ADMIN_INVITE_CODE: (id) =>
    `/portal/admin/invite-codes/${id}`,
  ADMIN_FEEDBACK: "/portal/admin/feedback",
  ADMIN_FEEDBACK_ITEM: (id) =>
    `/portal/admin/feedback/${id}`,
};

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    return user;
  }

  return {
    ...user,

    first_name:
      user.first_name ??
      user.firstName ??
      "",

    last_name:
      user.last_name ??
      user.lastName ??
      "",

    phone:
      user.phone ??
      user.phoneNumber ??
      "",

    phone_number:
      user.phone_number ??
      user.phoneNumber ??
      user.phone ??
      "",

    contact_method:
      user.contact_method ??
      user.contactMethod ??
      "",

    agreement_accepted:
      user.agreement_accepted ??
      user.agreementAccepted ??
      false,

    agreement_accepted_at:
      user.agreement_accepted_at ??
      user.agreementAcceptedAt ??
      null,

    agreement_version:
      user.agreement_version ??
      user.agreementVersion ??
      null,
  };
}

async function request(
  path,
  {
    method = "GET",
    body,
    auth = false,
    query,
  } = {}
) {
  if (!API_BASE) {
    throw new Error(
      "Portal API base URL is not configured. Set REACT_APP_PORTAL_API_BASE_URL."
    );
  }

  const url = new URL(API_BASE + path);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        url.searchParams.set(key, value);
      }
    });
  }

  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getStoredToken();

    if (!token) {
      throw new Error(
        "You are signed out. Please sign in again."
      );
    }

    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "We could not reach the portal server. Please check your connection and try again."
    );
  }

  const responseBody =
    response.status === 204
      ? null
      : await response.json().catch(() => ({}));

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    if (auth) {
      setStoredToken(null);
    }

    throw new Error(
      responseBody?.message ||
      responseBody?.error ||
      "You are not authorized. Please sign in again."
    );
  }

  if (!response.ok) {
    throw new Error(
      responseBody?.message ||
      responseBody?.error ||
      responseBody?.reason ||
      `Request failed (${response.status}).`
    );
  }

  return responseBody;
}

export const portalApi = {
  validateInviteCode: (code) =>
    request(ENDPOINTS.VALIDATE_CODE, {
      method: "POST",
      body: { code },
    }),

  register: async (payload) => {
    const result = await request(
      ENDPOINTS.REGISTER,
      {
        method: "POST",
        body: {
          code: payload.code,
          firstName:
            payload.firstName ??
            payload.first_name,
          lastName:
            payload.lastName ??
            payload.last_name,
          email: payload.email,
          phoneNumber:
            payload.phoneNumber ??
            payload.phone_number ??
            payload.phone,
          carrier: payload.carrier,
          contactMethod:
            payload.contactMethod ??
            payload.contact_method,
          password: payload.password,
        },
      }
    );

    return {
      ...result,
      user: normalizeUser(result?.user),
    };
  },

  login: async ({ email, password }) => {
    const result = await request(
      ENDPOINTS.LOGIN,
      {
        method: "POST",
        body: {
          email,
          password,
        },
      }
    );

    return {
      ...result,
      user: normalizeUser(result?.user),
    };
  },

  logout: () =>
    request(ENDPOINTS.LOGOUT, {
      method: "POST",
      auth: true,
    }),

  me: async () => {
    const result = await request(
      ENDPOINTS.ME,
      {
        auth: true,
      }
    );

    return normalizeUser(
      result?.user ?? result
    );
  },

  updateMe: (payload) =>
    request(ENDPOINTS.ME, {
      method: "PATCH",
      body: payload,
      auth: true,
    }),

  acceptAgreement: (version) =>
    request(
      ENDPOINTS.ACCEPT_AGREEMENT,
      {
        method: "POST",
        body: { version },
        auth: true,
      }
    ),

  mySummary: () =>
    request(ENDPOINTS.ME_SUMMARY, {
      auth: true,
    }),

  myCalls: (limit = 20) =>
    request(ENDPOINTS.ME_CALLS, {
      auth: true,
      query: { limit },
    }),

  submitFeedback: (payload) =>
    request(ENDPOINTS.ME_FEEDBACK, {
      method: "POST",
      body: payload,
      auth: true,
    }),

  adminStats: () =>
    request(ENDPOINTS.ADMIN_STATS, {
      auth: true,
    }),

  adminParticipants: ({
    search,
    status,
  } = {}) =>
    request(
      ENDPOINTS.ADMIN_PARTICIPANTS,
      {
        auth: true,
        query: {
          search,
          status,
        },
      }
    ),

  adminParticipant: (id) =>
    request(
      ENDPOINTS.ADMIN_PARTICIPANT(id),
      {
        auth: true,
      }
    ),

  adminUpdateParticipant: (
    id,
    payload
  ) =>
    request(
      ENDPOINTS.ADMIN_PARTICIPANT(id),
      {
        method: "PATCH",
        body: payload,
        auth: true,
      }
    ),

  adminParticipantCalls: (id) =>
    request(
      ENDPOINTS.ADMIN_PARTICIPANT_CALLS(id),
      {
        auth: true,
      }
    ),

  adminInviteCodes: () =>
    request(
      ENDPOINTS.ADMIN_INVITE_CODES,
      {
        auth: true,
      }
    ),

  adminCreateInviteCode: () =>
    request(
      ENDPOINTS.ADMIN_INVITE_CODES,
      {
        method: "POST",
        auth: true,
      }
    ),

  adminUpdateInviteCode: (
    id,
    payload
  ) =>
    request(
      ENDPOINTS.ADMIN_INVITE_CODE(id),
      {
        method: "PATCH",
        body: payload,
        auth: true,
      }
    ),

  adminFeedback: () =>
    request(ENDPOINTS.ADMIN_FEEDBACK, {
      auth: true,
    }),

  adminUpdateFeedback: (
    id,
    payload
  ) =>
    request(
      ENDPOINTS.ADMIN_FEEDBACK_ITEM(id),
      {
        method: "PATCH",
        body: payload,
        auth: true,
      }
    ),
};

export { normalizeUser };
