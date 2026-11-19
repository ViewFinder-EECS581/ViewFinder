export type DirectionsDevice = {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
};

export function isAppleDevice(device: DirectionsDevice): boolean {
  const userAgent = device.userAgent.toLowerCase();
  const platform = device.platform.toLowerCase();

  return (
    /iphone|ipad|ipod|mac/.test(userAgent) ||
    (platform.includes("mac") && device.maxTouchPoints > 1)
  );
}

export function getDirectionsDevice(): DirectionsDevice {
  if (typeof navigator === "undefined") {
    return { userAgent: "", platform: "", maxTouchPoints: 0 };
  }

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
  };
}

export function buildDirectionsUrl(
  latitude: number,
  longitude: number,
  appleDevice: boolean,
): string {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Directions require a valid latitude and longitude.");
  }

  if (appleDevice) {
    return `https://maps.apple.com/?daddr=${encodeURIComponent(`${latitude},${longitude}`)}&dirflg=d`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitude},${longitude}`)}&travelmode=driving`;
}

export function getDirectionsUrl(
  latitude: number,
  longitude: number,
  device: DirectionsDevice = getDirectionsDevice(),
): string {
  return buildDirectionsUrl(latitude, longitude, isAppleDevice(device));
}
