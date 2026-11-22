import { ViewpointDetail } from "@/features/viewpoints/viewpoint-detail";

export default async function ViewpointPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ViewpointDetail id={id} key={id} />;
}
