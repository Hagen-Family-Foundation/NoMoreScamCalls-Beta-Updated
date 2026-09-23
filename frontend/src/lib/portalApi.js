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
  REGISTER: "/portal/auth/register",
  LOGIN: "/portal/auth/login",
  LOGOUT: "/portal/auth/logout",
  ME: "/portal/me",
  ME_ONBOARDING: "/portal/me/onboarding",
  PHONE_MODELS: "/portal/phone-models",
  ME_ONBOARDING_COMPLETION: "/portal/me/onboarding-completion",
  ME_LOCATIONS: "/portal/me/locations",
  ME_PROTECTED_LINES: (locationId) =>
    `/portal/me/locations/${locationId}/protected-lines`,
  ME_PROVISION_LINE: (lineId) =>
    `/portal/me/protected-lines/${lineId}/provision`,
  ME_CONFIRM_FORWARDING: (lineId) =>
    `/portal/me/protected-lines/${lineId}/forwarding-confirm`,
  CURRENT_AGREEMENT: "/portal/agreement/current",
  ACCEPT_AGREEMENT: "/portal/agreement/accept",
  ME_SUMMARY: "/portal/me/summary",
  ME_CALLS: "/portal/me/calls",
  ME_FEEDBACK: "/portal/me/feedback",
  ADMIN_STATS: "/portal/admin/stats",
  ADMIN_CALLS: "/portal/admin/calls",
  ADMIN_CALL: (sessionId) =>
    `/portal/admin/calls/${encodeURIComponent(sessionId)}`,
  ADMIN_PARTICIPANTS: "/portal/admin/participants",
  ADMIN_PARTICIPANT: (id) => `/portal/admin/participants/${id}`,
  ADMIN_PARTICIPANT_CALLS: (id) =>
    `/portal/admin/participants/${id}/calls`,
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

    contact_phone_number:
      user.contact_phone_number ??
      user.contactPhoneNumber ??
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
  register: async (payload) => {
    const result = await request(
      ENDPOINTS.REGISTER,
      {
        method: "POST",
        body: {
          betaAccessCode:
            payload.betaAccessCode ??
            payload.beta_access_code,
          firstName:
            payload.firstName ??
            payload.first_name,
          lastName:
            payload.lastName ??
            payload.last_name,
          email: payload.email,
          contactPhoneNumber:
            payload.contactPhoneNumber ??
            payload.contact_phone_number,
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

    return {
      ...normalizeUser(result?.user ?? result),
      locations: result?.locations ?? [],
      protected_lines: result?.protected_lines ?? [],
    };
  },

  updateMe: (payload) =>
    request(ENDPOINTS.ME_ONBOARDING, {
      method: "PATCH",
      body: {
        firstName:
          payload.firstName ?? payload.first_name,
        lastName:
          payload.lastName ?? payload.last_name,
        email: payload.email,
        contactPhoneNumber:
          payload.contactPhoneNumber ??
          payload.contact_phone_number,
        contactMethod:
          payload.contactMethod ?? payload.contact_method,
      },
      auth: true,
    }),

  listPhoneModels: async () => {
    const result = await request(ENDPOINTS.PHONE_MODELS, { auth: true });
    return result?.phoneModels ?? [];
  },

  completeBetaOnboarding: (payload) =>
    request(ENDPOINTS.ME_ONBOARDING_COMPLETION, {
      method: "POST",
      body: {
        protectedPhoneNumber: payload.protectedPhoneNumber,
        callerFacingBusinessName: payload.callerFacingBusinessName,
        carrier: payload.carrier,
        phoneModelId: payload.phoneModelId,
      },
      auth: true,
    }),

  createLocation: () =>
    request(ENDPOINTS.ME_LOCATIONS, {
      method: "POST",
      auth: true,
    }),

  createProtectedLine: (locationId, payload) =>
    request(
      ENDPOINTS.ME_PROTECTED_LINES(locationId),
      {
        method: "POST",
        body: {
          protectedPhoneNumber:
            payload.protectedPhoneNumber ??
            payload.protected_phone_number,
          callerFacingBusinessName:
            payload.callerFacingBusinessName ??
            payload.caller_facing_business_name,
          carrier: payload.carrier,
        },
        auth: true,
      }
    ),

  provisionProtectedLine: (lineId) =>
    request(ENDPOINTS.ME_PROVISION_LINE(lineId), {
      method: "POST",
      auth: true,
    }),

  confirmProtectedLineForwarding: (lineId) =>
    request(ENDPOINTS.ME_CONFIRM_FORWARDING(lineId), {
      method: "POST",
      auth: true,
    }),

  currentAgreement: async () => {
    const result = await request(
      ENDPOINTS.CURRENT_AGREEMENT,
      {
        auth: true,
      }
    );

    return result?.agreement;
  },

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

  adminCallResults: (limit = 50) =>
    request(ENDPOINTS.ADMIN_CALLS, {
      auth: true,
      query: { limit },
    }),

  adminCallResult: (sessionId) =>
    request(ENDPOINTS.ADMIN_CALL(sessionId), {
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
