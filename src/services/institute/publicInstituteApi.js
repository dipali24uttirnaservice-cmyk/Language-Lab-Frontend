import api from "../apiMethod/apiMethod";

export const publicInstituteApi = {
  // GET Institute (public, no auth) — for landing page display
  getById: (id) => api.get(`/institute/public/${id}`),

  // GET Institute by subdomain (public, no auth)
  getBySubdomain: (subdomain) => api.get(`/institute/public/subdomain/${subdomain}`),

  // GET Institute by domain (public, no auth)
  getByDomain: (domain) => api.get(`/institute/public`, { domain }),

  // GET list of active institutes (public, no auth) — feeds the
  // "Select Institute" dropdown on the student login page.
  getPublicList: (search) =>
    api.get(`/institute/public`, { params: search ? { search } : {} }),
};

