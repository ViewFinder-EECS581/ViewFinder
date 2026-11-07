import type { ViewpointWithPhotos } from "./types";
 
/**
 * Fixture data for the mock data source. 14 Lawrence-area viewpoints with
 * approximate (not surveyed) coordinates and Unsplash image URLs, newest first.
 * `id`s are readable slugs here; the real database will use UUIDs.
 */
 
export const MOCK_USER_ID = "00000000-0000-4000-8000-000000000001";
 
export const mockViewpoints: ViewpointWithPhotos[] = [
  {
    id: "massachusetts-street",
    user_id: MOCK_USER_ID,
    title: "Massachusetts Street",
    description: "A slow stroll past the heart of downtown.",
    latitude: 38.9497772,
    longitude: -95.2359095,
    created_at: "2026-10-14T15:00:00.000Z",
    photos: [
      {
        id: "massachusetts-street-photo-1",
        viewpoint_id: "massachusetts-street",
        url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=720&q=85",
        sort_order: 0,
        created_at: "2026-10-14T15:00:00.000Z",
      },
    ],
  },
  {
    id: "burcham-park",
    user_id: MOCK_USER_ID,
    title: "Burcham Park",
    description: "A riverside pause beneath the open Kansas sky.",
    latitude: 38.9799457,
    longitude: -95.2413074,
    created_at: "2026-10-13T15:00:00.000Z",
    photos: [
      {
        id: "burcham-park-photo-1",
        viewpoint_id: "burcham-park",
        url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=720&q=85",
        sort_order: 0,
        created_at: "2026-10-13T15:00:00.000Z",
      },
    ],
  },
  {
    id: "potter-lake",
    user_id: MOCK_USER_ID,
    title: "Potter Lake",
    description: "A calm pocket of water on the hilltop campus.",
    latitude: 38.9603032,
    longitude: -95.2486305,
    created_at: "2026-10-12T15:00:00.000Z",
    photos: [
      {
        id: "potter-lake-photo-1",
        viewpoint_id: "potter-lake",
        url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=720&q=85",
        sort_order: 0,
        created_at: "2026-10-12T15:00:00.000Z",
      },
    ],
  },
  {
    id: "prairie-park",
    user_id: MOCK_USER_ID,
    title: "Prairie Park Nature Center",
    description: "A quiet trail through prairie and woodland.",
    latitude: 38.9330757,
    longitude: -95.2155032,
    created_at: "2026-10-11T15:00:00.000Z",
    photos: [
      {
        id: "prairie-park-photo-1",
        viewpoint_id: "prairie-park",
        url: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=720&q=85",
        sort_order: 0,
        created_at: "2026-10-11T15:00:00.000Z",
      },
    ],
  },
  {
    id: "clinton-state-park",
    user_id: MOCK_USER_ID,
    title: "Clinton State Park",
    description: "Big-sky shoreline a short drive west of town.",
    latitude: 38.9381278,
    longitude: -95.3687087,
    created_at: "2026-10-10T15:00:00.000Z",
    photos: [
      {
        id: "clinton-state-park-photo-1",
        viewpoint_id: "clinton-state-park",
        url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=720&q=85",
        sort_order: 0,
        created_at: "2026-10-10T15:00:00.000Z",
      },
    ],
  },
  {
    id: "campanile-hill",
    user_id: MOCK_USER_ID,
    title: "Campanile Hill",
    description: "Bells, brick, and a long view down Mount Oread.",
    latitude: 38.9585,
    longitude: -95.2442,
    created_at: "2026-10-09T15:00:00.000Z",
    photos: [
      {
        id: "campanile-hill-photo-1",
        viewpoint_id: "campanile-hill",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=720&q=85",
        sort_order: 0,
        created_at: "2026-10-09T15:00:00.000Z",
      },
    ],
  },
  {
    id: "baker-wetlands",
    user_id: MOCK_USER_ID,
    title: "Baker Wetlands",
    description: "Boardwalk birding over restored prairie marsh.",
    latitude: 38.9085,
    longitude: -95.2081,
    created_at: "2026-10-08T15:00:00.000Z",
    photos: [
      {
        id: "baker-wetlands-photo-1",
        viewpoint_id: "baker-wetlands",
        url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=720&q=85",
        sort_order: 0,
        created_at: "2026-10-08T15:00:00.000Z",
      },
    ],
  },
  {
    id: "lone-star-lake",
    user_id: MOCK_USER_ID,
    title: "Lone Star Lake",
    description: "Still water and tall grass south of town.",
    latitude: 38.8467,
    longitude: -95.3622,
    created_at: "2026-10-07T15:00:00.000Z",
    photos: [
      {
        id: "lone-star-lake-photo-1",
        viewpoint_id: "lone-star-lake",
        url: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?auto=format&fit=crop&w=720&q=85",
        sort_order: 0,
        created_at: "2026-10-07T15:00:00.000Z",
      },
    ],
  },
  {
    id: "oak-hill-cemetery",
    user_id: MOCK_USER_ID,
    title: "Oak Hill Cemetery",
    description: "Old trees and a hush above East Lawrence.",
    latitude: 38.9535,
    longitude: -95.2218,
    created_at: "2026-10-06T15:00:00.000Z",
    photos: [
      {
        id: "oak-hill-cemetery-photo-1",
        viewpoint_id: "oak-hill-cemetery",
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=720&q=85",
        sort_order: 0,
        created_at: "2026-10-06T15:00:00.000Z",
      },
    ],
  },
  {
    id: "clinton-lake-dam",
    user_id: MOCK_USER_ID,
    title: "Clinton Lake Dam Overlook",
    description: "Sunset over the spillway and the open valley.",
    latitude: 38.9278,
    longitude: -95.3472,
    created_at: "2026-10-05T15:00:00.000Z",
    photos: [
      {
        id: "clinton-lake-dam-photo-1",
        viewpoint_id: "clinton-lake-dam",
        url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=720&q=85",
        sort_order: 0,
        created_at: "2026-10-05T15:00:00.000Z",
      },
    ],
  },
  {
    id: "riverfront-plaza",
    user_id: MOCK_USER_ID,
    title: "Lawrence Riverfront Plaza",
    description: "Kansas River light from the old warehouse district.",
    latitude: 38.9742,
    longitude: -95.2327,
    created_at: "2026-10-04T15:00:00.000Z",
    photos: [
      {
        id: "riverfront-plaza-photo-1",
        viewpoint_id: "riverfront-plaza",
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=720&q=85",
        sort_order: 0,
        created_at: "2026-10-04T15:00:00.000Z",
      },
    ],
  },
  {
    id: "memorial-stadium",
    user_id: MOCK_USER_ID,
    title: "Kansas Memorial Stadium",
    description: "Bleacher views across the valley on a quiet morning.",
    latitude: 38.9634,
    longitude: -95.2468,
    created_at: "2026-10-03T15:00:00.000Z",
    photos: [
      {
        id: "memorial-stadium-photo-1",
        viewpoint_id: "memorial-stadium",
        url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=720&q=85",
        sort_order: 0,
        created_at: "2026-10-03T15:00:00.000Z",
      },
    ],
  },
  {
    id: "jayhawk-boulevard",
    user_id: MOCK_USER_ID,
    title: "Jayhawk Boulevard",
    description: "A tree-lined ridge walk through the heart of campus.",
    latitude: 38.9565,
    longitude: -95.2465,
    created_at: "2026-10-02T15:00:00.000Z",
    photos: [
      {
        id: "jayhawk-boulevard-photo-1",
        viewpoint_id: "jayhawk-boulevard",
        url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=720&q=85",
        sort_order: 0,
        created_at: "2026-10-02T15:00:00.000Z",
      },
    ],
  },
  {
    id: "kaw-river-levee",
    user_id: MOCK_USER_ID,
    title: "Kaw River Levee Trail",
    description: "A flat, open path along the river's north bank.",
    latitude: 38.9825,
    longitude: -95.2585,
    created_at: "2026-10-01T15:00:00.000Z",
    photos: [
      {
        id: "kaw-river-levee-photo-1",
        viewpoint_id: "kaw-river-levee",
        url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=720&q=85",
        sort_order: 0,
        created_at: "2026-10-01T15:00:00.000Z",
      },
    ],
  },
];