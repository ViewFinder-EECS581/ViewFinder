/**
 * Builds tiny image files with real EXIF/metadata structures for tests.
 * The "image data" is fake (it only needs to be recognisable bytes), because
 * the code under test only reads and rewrites the container around it.
 */

export type FixtureOptions = {
    latitude?: number;
    longitude?: number;
    /** EXIF format, e.g. "2024:06:03 16:12:09". */
    dateTime?: string;
    orientation?: number;
  };
  
  export const SCAN_DATA = [0x12, 0x34, 0x56];
  
  const u16 = (n: number) => [(n >> 8) & 0xff, n & 0xff];
  const u32 = (n: number) => [(n >>> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  const u32le = (n: number) => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >>> 24) & 0xff];
  const text = (s: string) => [...s].map((c) => c.charCodeAt(0));
  
  function dmsRationals(value: number): number[] {
    const abs = Math.abs(value);
    const degrees = Math.floor(abs);
    const minutesFull = (abs - degrees) * 60;
    const minutes = Math.floor(minutesFull);
    const seconds = (minutesFull - minutes) * 60;
    return [
      ...u32(degrees), ...u32(1),
      ...u32(minutes), ...u32(1),
      ...u32(Math.round(seconds * 10000)), ...u32(10000),
    ];
  }
  
  /** Big-endian TIFF structure with the requested EXIF tags, or null if none. */
  function buildTiff(options: FixtureOptions): number[] | null {
    const { latitude, longitude, dateTime, orientation } = options;
    const hasGps = latitude !== undefined && longitude !== undefined;
    const hasDate = Boolean(dateTime);
    const hasOrientation = orientation !== undefined;
  
    const ifd0Count = Number(hasOrientation) + Number(hasDate) + Number(hasGps);
    if (ifd0Count === 0) return null;
  
    const ifdSize = (entries: number) => 2 + 12 * entries + 4;
    const exifOffset = 8 + ifdSize(ifd0Count);
    const gpsOffset = exifOffset + (hasDate ? ifdSize(1) : 0);
    const dataStart = gpsOffset + (hasGps ? ifdSize(4) : 0);
  
    const data: number[] = [];
    const place = (bytes: number[]) => {
      const offset = dataStart + data.length;
      data.push(...bytes);
      return offset;
    };
    const entry = (tag: number, type: number, count: number, value: number[]) => [
      ...u16(tag), ...u16(type), ...u32(count), ...value,
    ];
    const ifd = (entries: number[][]) => [...u16(entries.length), ...entries.flat(), ...u32(0)];
  
    const ifd0: number[][] = [];
    if (hasOrientation) ifd0.push(entry(0x0112, 3, 1, [...u16(orientation), 0, 0]));
    if (hasDate) ifd0.push(entry(0x8769, 4, 1, u32(exifOffset)));
    if (hasGps) ifd0.push(entry(0x8825, 4, 1, u32(gpsOffset)));
  
    const exifIfd: number[] = [];
    if (hasDate) {
      const bytes = [...text(dateTime as string), 0];
      exifIfd.push(...ifd([entry(0x9003, 2, bytes.length, u32(place(bytes)))]));
    }
  
    const gpsIfd: number[] = [];
    if (hasGps) {
      gpsIfd.push(...ifd([
        entry(0x0001, 2, 2, [...text(latitude >= 0 ? "N" : "S"), 0, 0, 0]),
        entry(0x0002, 5, 3, u32(place(dmsRationals(latitude)))),
        entry(0x0003, 2, 2, [...text(longitude >= 0 ? "E" : "W"), 0, 0, 0]),
        entry(0x0004, 5, 3, u32(place(dmsRationals(longitude)))),
      ]));
    }
  
    return [
      ...text("MM"), ...u16(42), ...u32(8),
      ...ifd(ifd0), ...exifIfd, ...gpsIfd, ...data,
    ];
  }
  
  function jpegSegment(marker: number, payload: number[]): number[] {
    return [0xff, marker, ...u16(payload.length + 2), ...payload];
  }
  
  export function makeJpeg(
    options: FixtureOptions = {},
    extras: { comment?: string; xmp?: string } = {},
  ): Uint8Array {
    const tiff = buildTiff(options);
    const bytes = [
      0xff, 0xd8,
      ...jpegSegment(0xe0, [...text("JFIF"), 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]),
      ...(tiff ? jpegSegment(0xe1, [...text("Exif"), 0, 0, ...tiff]) : []),
      ...(extras.xmp
        ? jpegSegment(0xe1, [...text("http://ns.adobe.com/xap/1.0/"), 0, ...text(extras.xmp)])
        : []),
      ...(extras.comment ? jpegSegment(0xfe, text(extras.comment)) : []),
      0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
      ...SCAN_DATA,
      0xff, 0xd9,
    ];
    return Uint8Array.from(bytes);
  }
  
  function pngChunk(type: string, data: number[]): number[] {
    return [...u32(data.length), ...text(type), ...data, 0, 0, 0, 0]; // CRC not checked
  }
  
  export function makePng(options: { withMetadata: boolean }): Uint8Array {
    const tiff = buildTiff({ latitude: 38.9, longitude: -95.2, dateTime: "2024:06:03 16:12:09" });
    return Uint8Array.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ...pngChunk("IHDR", [0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]),
      ...(options.withMetadata ? pngChunk("eXIf", tiff as number[]) : []),
      ...(options.withMetadata ? pngChunk("tEXt", [...text("Comment"), 0, ...text("secret")]) : []),
      ...pngChunk("IDAT", SCAN_DATA),
      ...pngChunk("IEND", []),
    ]);
  }
  
  function webpChunk(type: string, data: number[]): number[] {
    return [...text(type), ...u32le(data.length), ...data, ...(data.length % 2 ? [0] : [])];
  }
  
  export function makeWebp(): Uint8Array {
    const chunks = [
      // VP8X flags 0x0C = EXIF + XMP present.
      ...webpChunk("VP8X", [0x0c, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      ...webpChunk("VP8 ", SCAN_DATA),
      ...webpChunk("EXIF", [...text("Exif"), 0, 0, 1]),
      ...webpChunk("XMP ", text("<x:xmpmeta/>")),
    ];
    return Uint8Array.from([
      ...text("RIFF"), ...u32le(chunks.length + 4), ...text("WEBP"), ...chunks,
    ]);
  }
  
  export function contains(haystack: Uint8Array, needle: string): boolean {
    return Buffer.from(haystack).includes(Buffer.from(needle, "latin1"));
  }  