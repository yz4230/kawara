import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { db } from "~/lib/server/db";
import { EntryCard } from "./-components/entry-card";

const fetchFeedEntries = createServerFn({ method: "GET" }).handler(async () => {
  const entries = await db.query.feedEntry.findMany({
    orderBy: (feedEntry, { desc }) => desc(feedEntry.updatedAt),
  });
  return entries;
});

export const Route = createFileRoute("/feeds/")({
  component: RouteComponent,
  loader: async () => {
    const entries = await fetchFeedEntries();
    return { entries };
  },
});

function RouteComponent() {
  const { entries } = Route.useLoaderData();

  return (
    <div className="mx-auto flex max-w-3xl flex-col border-x">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
