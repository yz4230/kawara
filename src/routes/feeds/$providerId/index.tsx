import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { object, picklist } from "valibot";
import { db } from "~/lib/server/db";
import { providerIds, type ProviderId } from "~/shared/provider";
import { EntryCard } from "../-components/entry-card";

const fetchFeedEntries = createServerFn({ method: "GET" })
  .validator(object({ providerId: picklist(providerIds) }))
  .handler(async ({ data }) => {
    const entries = await db.query.feedEntry.findMany({
      where: (feedEntry, { eq }) => eq(feedEntry.providerId, data.providerId),
      orderBy: (feedEntry, { desc, sql }) => {
        const sortKeys = [
          feedEntry.datePublished,
          feedEntry.dateModified,
          feedEntry.createdAt,
        ] as const;
        return desc(sql`coalesce(${sortKeys.join(", ")})`);
      },
    });
    return entries;
  });

export const Route = createFileRoute("/feeds/$providerId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const entries = await fetchFeedEntries({
      data: { providerId: params.providerId as ProviderId },
    });
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
