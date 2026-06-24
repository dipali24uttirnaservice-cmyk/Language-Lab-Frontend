import Cookies from "js-cookie";

export const saveAuthData = ({
  token,
  role,
  userData,
  studentData,
}) => {
  Cookies.set("token", token, {
    expires: 7,
  });
I
  Cookies.set("role", role, {
    expires: 7,
  });

  // Institute Data
  if (userData) {
    Cookies.set(
      "userData",
      JSON.stringify(userData),
      {
        expires: 7,
      }
    );
  }

  // Student Data
  if (studentData) {
    Cookies.set(
      "studentData",
      JSON.stringify(studentData),
      {
        expires: 7,
      }
    );
  }
};

export const clearAuthData = () => {
  Cookies.remove("token");
  Cookies.remove("role");
  Cookies.remove("userData");
  Cookies.remove("studentData");
};