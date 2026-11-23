import Cookies from "js-cookie";

// js-cookie runs client-side, so it can never set httpOnly (only a server's
// Set-Cookie header can) — secure + sameSite are the strongest flags
// available from here. secure is skipped on http (e.g. local dev) since
// browsers silently drop "Secure" cookies set over a non-https origin.
export const secureCookieOptions = (days = 7) => ({
  expires: days,
  sameSite: "strict",
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
});

export const saveAuthData = ({
  token,
  role,
  userData,
  studentData,
}) => {
  Cookies.set("token", token, secureCookieOptions());

  if (role) {
    Cookies.set("role", role, secureCookieOptions());
  }

  // Institute Data
  if (userData) {
    Cookies.set(
      "userData",
      JSON.stringify(userData),
      secureCookieOptions()
    );
  }

  // Student Data
  if (studentData) {
    Cookies.set(
      "studentData",
      JSON.stringify(studentData),
      secureCookieOptions()
    );
  }
};

export const clearAuthData = () => {
  Cookies.remove("token");
  Cookies.remove("masterToken");
  Cookies.remove("role");
  Cookies.remove("userData");
  Cookies.remove("studentData");
};