import { getApi } from "../apiMethod/apiMethod";

export const publicInstituteApi = {
  // GET Institute (public, no auth) — for landing page display
  getById: (id) => getApi(`/institute/public/${id}`),

  // GET Institute by subdomain (public, no auth)
  getBySubdomain: (subdomain) => getApi(`/institute/public/subdomain/${subdomain}`),

  // GET Institute by domain (public, no auth)
  getByDomain: (domain) => getApi(`/institute/public`, { domain }),
};

