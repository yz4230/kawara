import type { FeedEntry } from "~/shared/types";

export function EntryCard(props: { entry: FeedEntry }) {
  return (
    <div className="flex flex-col border-t p-4 last:border-b">
      <a href={props.entry.link} target="_blank" className="group">
        <h2 className="text-lg font-bold group-hover:underline">{props.entry.title}</h2>
      </a>
      <p className="text-sm text-gray-500">{props.entry.description}</p>
    </div>
  );
}
