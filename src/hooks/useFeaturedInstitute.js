"use client";

import { useEffect, useState } from "react";
import { publicInstituteApi } from "@/services/institute/publicInstituteApi";
import { getDomain } from "@/utils/getDomain";

// Falls back to the first licensed institute from the public list — not a
// hardcoded id, since that id has no guarantee of existing in any given
// database and silently 404s (which is why the Hero used to always show the
// static placeholder instead of real data).
function loadFirstPublicInstitute(setInstitute) {
  publicInstituteApi
    .getPublicList()
    .then((res) => {
      const list = res?.data?.data ?? [];
      setInstitute(list[0] ?? null);
    })
    .catch(() => setInstitute(null));
}

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
        .catch(() => loadFirstPublicInstitute(setInstitute));
    } else {
      // Fallback for localhost / default base domain
      loadFirstPublicInstitute(setInstitute);
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
