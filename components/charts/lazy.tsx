"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

// Recharts pulls in a non-trivial amount of JS that isn't needed for the
// dashboard's first paint (stat cards render above these). Splitting them
// into their own client-only chunk keeps them off the initial bundle;
// `ssr: false` requires this to live in a Client Component, which is why
// it's a separate file rather than called directly from the (Server
// Component) dashboard page.
export const CollectionsBarChart = dynamic(
  () => import("./collections-bar-chart").then((m) => m.CollectionsBarChart),
  { ssr: false, loading: () => <Skeleton className="h-[280px] w-full" /> },
);

export const FeeCategoryDonut = dynamic(
  () => import("./fee-category-donut").then((m) => m.FeeCategoryDonut),
  { ssr: false, loading: () => <Skeleton className="h-[280px] w-full" /> },
);
