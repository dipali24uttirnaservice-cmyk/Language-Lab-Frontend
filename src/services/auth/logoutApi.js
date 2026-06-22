import Cookies from "js-cookie";
import { postApi } from "../apiMethod/apiMethod";

export const logoutUser = async () => {
  const token = Cookies.get("token");

  const role = Cookies.get("role");

  const endpoint =
    role === "student"
      ? "/api/student/logout"
      : "/api/institute/logout";

  return postApi(
    endpoint,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};