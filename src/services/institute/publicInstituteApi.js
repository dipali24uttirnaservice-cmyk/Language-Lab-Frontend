import api from "../apiMethod/apiMethod";

export const publicInstituteApi = {
  // GET Institute (public, no auth) — for landing page display
  getById: (id) => api.get(`/institute/public/${id}`),

  // GET Institute by subdomain (public, no auth)
  getBySubdomain: (subdomain) => api.get(`/institute/public/subdomain/${subdomain}`),

  // GET Institute by domain (public, no auth)
  getByDomain: (domain) => api.get(`/institute/public`, { domain }),
};

