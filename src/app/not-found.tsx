import { MapPinOff } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <main className="route-state">
      <p className="eyebrow">404 · Not found</p>
      <EmptyState
        titleAs="h1"
        icon={MapPinOff}
        title="We couldn't find that page."
        description="The place or address may have changed."
        action={
          <Link className="route-state-action" href="/map">
            Back to the map
          </Link>
        }
      />
    </main>
  );
}
