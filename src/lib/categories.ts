export const categoryGroups = [
  {
    id: "water-bodies",
    label: "Water bodies",
    categories: [
      { id: "river", label: "River" },
      { id: "lake", label: "Lake" },
      { id: "waterfall", label: "Waterfall" },
      { id: "ocean", label: "Ocean" },
      { id: "wetland", label: "Wetland" },
    ],
  },
  {
    id: "terrain",
    label: "Terrain",
    categories: [
      { id: "mountain", label: "Mountain" },
      { id: "hill", label: "Hill" },
      { id: "forest", label: "Forest" },
      { id: "prairie", label: "Prairie" },
      { id: "canyon", label: "Canyon" },
      { id: "coast", label: "Coast" },
    ],
  },
  {
    id: "lighting-astronomy",
    label: "Lighting & astronomy",
    categories: [
      { id: "sunrise", label: "Sunrise" },
      { id: "sunset", label: "Sunset" },
      { id: "golden-hour", label: "Golden hour" },
      { id: "night-sky", label: "Night sky" },
      { id: "stargazing", label: "Stargazing" },
      { id: "city-lights", label: "City lights" },
    ],
  },
] as const;

export type CategoryGroupId = (typeof categoryGroups)[number]["id"];
export type CategoryId = (typeof categoryGroups)[number]["categories"][number]["id"];

const categoryLabels = new Map<string, string>(
  categoryGroups.flatMap((group) => group.categories.map(({ id, label }) => [id, label])),
);

export function getCategoryLabel(id: string): string {
  return categoryLabels.get(id) ?? id;
}

export function getCategoryGroupLabel(id: string): string | undefined {
  return categoryGroups.find((group) => group.categories.some((category) => category.id === id))?.label;
}
