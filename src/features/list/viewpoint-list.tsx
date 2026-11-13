import { ArrowUpRight, Search } from "lucide-react";
import type { Viewpoint } from "@/lib/mock-viewpoints";

type ViewpointListProps = {
  viewpoints: Viewpoint[];
  selectedId?: string;
  onSelect: (viewpoint: Viewpoint) => void;
};

export function ViewpointList({
  viewpoints,
  selectedId,
  onSelect,
}: ViewpointListProps) {
  if (viewpoints.length === 0) {
    return (
      <div className="empty-search" role="status">
        <Search aria-hidden="true" size={18} />
        <p>No places match that search.</p>
      </div>
    );
  }

  return viewpoints.map((viewpoint, index) => {
    const isSelected = selectedId === viewpoint.id;
    return (
      <button
        aria-pressed={isSelected}
        className={isSelected ? "place-row selected" : "place-row"}
        key={viewpoint.id}
        onClick={() => onSelect(viewpoint)}
        type="button"
      >
        <span className="place-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="place-row-copy">
          <strong>{viewpoint.name}</strong>
          <span>{viewpoint.area.split(" · ")[0]}</span>
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="place-arrow"
          size={16}
        />
      </button>
    );
  });
}
