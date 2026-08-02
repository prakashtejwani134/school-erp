import type { MetadataRoute } from "next";

// "/" already redirects every session state to the right place (unauthenticated
// -> /login, PARENT -> /parent, everyone else -> /dashboard), so it's a safe
// universal start_url regardless of who installs the app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "School ERP Console",
    short_name: "School ERP",
    description: "Multi-school management dashboard",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF8",
    theme_color: "#0E7C7B",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
