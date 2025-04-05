import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, LogInIcon } from "lucide-react";
import { Button } from "~/lib/components/ui/button";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const user = Route.useRouteContext({ select: ({ user }) => user });

  return (
    <div className="mx-auto flex flex-col items-center gap-4 py-6">
      {user ? (
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold">Welcome back, {user.name}!</h1>
          <Link to="/dashboard">
            <Button>
              <span>Go to Dashboard</span>
              <ArrowRightIcon />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold">Welcome to Our App</h1>
          <Link to="/signin">
            <Button>
              <LogInIcon />
              <span>Sign In</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
