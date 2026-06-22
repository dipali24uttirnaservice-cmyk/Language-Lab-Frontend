import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getInstituteProfile = async () => {
  const token = Cookies.get("token");

  return axios.get(
    `${BASE_URL}/api/institute/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const updateInstituteProfile = async (
  formData
) => {
  const token = Cookies.get("token");

  return axios.put(
    `${BASE_URL}/api/institute/me`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};