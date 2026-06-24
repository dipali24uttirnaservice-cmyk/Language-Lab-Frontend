import api from "../apiMethod/apiMethod";

export const licenseApi = {
  getInstituteLicenses: () =>
    api.get("/institute/me/licenses"),
};