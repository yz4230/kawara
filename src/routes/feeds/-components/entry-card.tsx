import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { SparkleIcon } from "lucide-react";
import { Button } from "~/lib/components/ui/button";
import { DateFormat } from "~/shared/format";
import type { FeedEntryModel } from "../-types";

export function EntryCard(props: { entry: FeedEntryModel }) {
  const { entry } = props;
  return (
    <div className="flex flex-col border-t p-4 last:border-b">
      <a href={entry.url ?? "#"} target="_blank" className="group">
        <h2 className="text-lg font-bold group-hover:underline">{entry.title}</h2>
      </a>
      {entry.datePublished && (
        <div className="text-muted-foreground text-sm">
          {format(entry.datePublished, DateFormat.dateTime)}
        </div>
      )}
      <p className="text-muted-foreground line-clamp-2 text-sm">{entry.summary}</p>
      <div className="mt-2 flex justify-end">
        <Button asChild>
          <Link
            to="/feeds/$providerId/$entryId"
            params={{ providerId: entry.providerId, entryId: entry.id }}
          >
            <SparkleIcon className="size-4" />
            <span>Follow up</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
