"use client";

import { useEffect, useState } from "react";
import { publicInstituteApi } from "@/services/institute/publicInstituteApi";
import { getDomain } from "@/utils/getDomain";

// Fallback ID when running without a subdomain (e.g., localhost:3000 or main landing page)
const FALLBACK_INSTITUTE_ID = "6a38e1d3bb9f88682d4363d7";

export function useFeaturedInstitute() {
  const [institute, setInstitute] = useState(null);

  useEffect(() => {
    const domainUrl = getDomain();

    if (domainUrl) {
      // Extract subdomain (e.g. "abc" from "https://abc.languagelab.com")
      const parsedHost = domainUrl.replace(/^https?:\/\//, ""); // "abc.languagelab.com"
      const subdomain = parsedHost.split(".")[0];

      publicInstituteApi
        .getBySubdomain(subdomain)
        .then((res) => setInstitute(res?.data?.data ?? null))
        .catch(() => {
          // Fallback if subdomain fetch fails
          publicInstituteApi
            .getById(FALLBACK_INSTITUTE_ID)
            .then((res) => setInstitute(res?.data?.data ?? null))
            .catch(() => setInstitute(null));
        });
    } else {
      // Fallback for localhost / default base domain
      publicInstituteApi
        .getById(FALLBACK_INSTITUTE_ID)
        .then((res) => setInstitute(res?.data?.data ?? null))
        .catch(() => setInstitute(null));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && institute?.logo) {
      let iconLink = document.querySelector("link[rel~='icon']");
      if (!iconLink) {
        iconLink = document.createElement("link");
        iconLink.rel = "icon";
        document.head.appendChild(iconLink);
      }
      iconLink.href = institute.logo;
    }
  }, [institute]);

  return institute;
}
