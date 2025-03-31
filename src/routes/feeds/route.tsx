import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { HomeIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { providerMetas } from "~/shared/provider";

export const Route = createFileRoute("/feeds")({
  component: RouteComponent,
});

const linkClassName = cn(
  "grid size-14 place-items-center rounded-full border-gray-700 data-[status=active]:border-2",
);

function RouteComponent() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <div className="flex flex-row gap-2 p-2">
        <Link to="/feeds" activeOptions={{ exact: true }} className={linkClassName}>
          <span className="grid size-12 place-items-center rounded-full bg-black">
            <HomeIcon className="text-white" />
          </span>
        </Link>
        {Object.entries(providerMetas).map(([id, meta]) => (
          <Link
            key={id}
            to="/feeds/$providerId"
            params={{ providerId: id }}
            className={linkClassName}
          >
            <img
              src={meta.icon}
              alt={meta.name}
              title={meta.name}
              className="size-12 rounded-full select-none"
            />
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
