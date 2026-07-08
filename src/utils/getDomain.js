// utils/getDomain.js
export const getDomain = (paramDomain) => {
    // ✅ If domain is provided from route (path-based)
    if (paramDomain) {
        // Already a full URL like "https://abc.mazanagarsevak.com"
        if (paramDomain.startsWith("http://") || paramDomain.startsWith("https://")) {
            return paramDomain;
        }

        // Otherwise, treat it as raw domain like "abc.mazanagarsevak.com"
        return `https://${paramDomain}`;
    }

    // Guard for Next.js SSR (Server-Side Rendering)
    if (typeof window === "undefined") return null;

    // 🌐 Production: extract from subdomain
    const host = window.location.hostname; // e.g. abc.mazanagarsevak.com

    // Skip if localhost
    if (host.includes("localhost")) return null;

    // Check if it's a valid subdomain (like abc.mazanagarsevak.com)
    const parts = host.split(".");
    if (parts.length === 3) {
        return `https://${host}`; // Return full domain
    }

    return null; // Invalid or base domain
};
