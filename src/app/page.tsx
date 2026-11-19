import type { Metadata } from "next";
import { mockViewpoints } from "@/lib/mock-viewpoints";
import { normalizeViewpointId } from "@/features/viewpoints/detail-model";
import { ViewpointDetail } from "@/features/viewpoints/viewpoint-detail";

type ViewpointPageProps = {
  params: Promise<{ id: string }>;
};

// Submitted viewpoints are stored in the browser, so only sample viewpoints can
// get a specific title on the server; everything else gets a generic one.
export async function generateMetadata({
  params,
}: ViewpointPageProps): Promise<Metadata> {
  const { id } = await params;
  const viewpoint = mockViewpoints.find(
    (candidate) => candidate.id === normalizeViewpointId(id),
  );

  return {
    title: viewpoint ? `${viewpoint.name} — ViewFinder` : "Viewpoint — ViewFinder",
    description: viewpoint?.note ?? "A viewpoint shared on ViewFinder.",
  };
}

export default async function ViewpointPage({ params }: ViewpointPageProps) {
  const { id } = await params;
  return <ViewpointDetail id={id} />;
}