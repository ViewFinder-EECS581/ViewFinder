import { DiscoveryMap } from "@/features/map/discovery-map";
import { listViewpoints } from "@/lib/viewpoints";

export default async function MapPage() {
  const { data, error } = await listViewpoints();

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center p-6 text-center">
        <p role="alert">Couldn&apos;t load viewpoints. {error.message}</p>
      </main>
    );
  }

  return <DiscoveryMap viewpoints={data} />;
}