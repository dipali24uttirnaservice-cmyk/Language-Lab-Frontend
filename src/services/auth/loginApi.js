import Cookies from "js-cookie";
import api, { masterApiInstance } from "../apiMethod/apiMethod";
import { secureCookieOptions } from "../../utils/cookie";

export const studentLogin = async (payload) => {
  return await api.post("/student/login", payload);
};

// Used by /config (first-time institute setup wizard): check credentials
// against master first, then log in against the LOCAL backend — which (on
// first login) mirrors this institute into local Mongo (see
// instituteController.login). Master's own token is stashed in a separate
// "masterToken" cookie for the master-routed course calls (courseApi.js) —
// it must never be confused with the local token below, since the two are
// signed with different JWT_SECRETs and each only validates on its own side.
export const instituteConfigLogin = async (payload) => {
  const masterResponse = await masterApiInstance.post("/institute/login", payload);
  const masterToken = masterResponse?.data?.data?.token;
  if (masterToken) {
    Cookies.set("masterToken", masterToken, secureCookieOptions());
  }

  return await api.post("/institute/login", payload);
};

// Used by the regular /login page, once this institute is already synced
// locally (via /config) — logs in against the local backend (the call the
// caller awaits), and best-effort refreshes the "masterToken" cookie too.
// Without this, masterToken was only ever set once during the one-time
// /config wizard (instituteConfigLogin below) and never renewed on daily
// logins — so once it expired, every master-dependent check (courseApi's
// getCourseSyncStatus "Update Data" flag, course downloads' local mirror)
// silently fell back to its no-master behavior forever, even though the
// institute account is perfectly able to reach master. Fire-and-forget and
// swallowed on failure (network error, or this institute genuinely has no
// master account) so a slow/unreachable master never blocks or fails local
// login itself — same offline-first spirit as courseApi's masterWithLocalFallback.
export const instituteLogin = async (payload) => {
  masterApiInstance
    .post("/institute/login", payload)
    .then((masterResponse) => {
      const masterToken = masterResponse?.data?.data?.token;
      if (masterToken) {
        Cookies.set("masterToken", masterToken, secureCookieOptions());
      }
    })
    .catch(() => {});

  return await api.post("/institute/login", payload);
};

// Code-verify/OTP steps go straight to master — these are just the /config
// pre-checks before the actual login above, so there's nothing to save locally yet.
export const verifyInstituteCode = async (code) => {
  return await masterApiInstance.get(`/institute/verify-code/${code}`);
};

export const sendInstituteOtp = async (institute_code) => {
  return await masterApiInstance.post("/institute/send-otp", {
    institute_code,
  });
};

export const verifyInstituteOtp = async (institute_code, otp) => {
  return await masterApiInstance.post("/institute/verify-otp", {
    institute_code,
    otp,
  });
};
