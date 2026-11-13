import { useMemo, useState } from "react";
import { mockViewpoints } from "@/lib/mock-viewpoints";

export function useViewpointSearch() {
  const [search, setSearch] = useState("");
  const visibleViewpoints = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return mockViewpoints;

    return mockViewpoints.filter((viewpoint) =>
      [viewpoint.name, viewpoint.city, viewpoint.landmark, ...viewpoint.keywords]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search]);

  return { search, setSearch, visibleViewpoints };
}
