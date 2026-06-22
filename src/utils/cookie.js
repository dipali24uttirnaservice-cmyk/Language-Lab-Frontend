import Cookies from "js-cookie";

export const saveAuthData = ({
  token,
  role,
  user,
}) => {
  Cookies.set("token", token, {
    expires: 7,
  });

  Cookies.set("role", role, {
    expires: 7,
  });

  Cookies.set(
    "user",
    JSON.stringify(user),
    {
      expires: 7,
    }
  );
};

export const clearAuthData = () => {
  Cookies.remove("token");
  Cookies.remove("role");
  Cookies.remove("user");
};