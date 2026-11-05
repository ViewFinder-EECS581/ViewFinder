export type Viewpoint = {
  id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  note: string;
  image: string;
};

export const mockViewpoints: Viewpoint[] = [
  {
    id: "massachusetts-street",
    name: "Massachusetts Street",
    area: "Downtown · Lawrence",
    latitude: 38.9497772,
    longitude: -95.2359095,
    note: "A slow stroll past the heart of downtown.",
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=720&q=85",
  },
  {
    id: "burcham-park",
    name: "Burcham Park",
    area: "Kansas River · Lawrence",
    latitude: 38.9799457,
    longitude: -95.2413074,
    note: "A riverside pause beneath the open Kansas sky.",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=720&q=85",
  },
  {
    id: "potter-lake",
    name: "Potter Lake",
    area: "KU Campus · Lawrence",
    latitude: 38.9603032,
    longitude: -95.2486305,
    note: "A calm pocket of water on the hilltop campus.",
    image:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=720&q=85",
  },
  {
    id: "prairie-park",
    name: "Prairie Park Nature Center",
    area: "Prairie Park · Lawrence",
    latitude: 38.9330757,
    longitude: -95.2155032,
    note: "A quiet trail through prairie and woodland.",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=720&q=85",
  },
  {
    id: "clinton-state-park",
    name: "Clinton State Park",
    area: "Clinton Lake · Douglas County",
    latitude: 38.9381278,
    longitude: -95.3687087,
    note: "Big-sky shoreline a short drive west of town.",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=720&q=85",
  },
];
