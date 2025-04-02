import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "~/lib/components/ui/button";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto flex flex-col items-center gap-4 py-6">
      <Button asChild size="lg">
        <Link to="/feeds">Go to Feeds</Link>
      </Button>
    </div>
  );
}
