import { SparkleIcon } from "lucide-react";
import { MemoizedMarkdown } from "~/lib/components/memorized-markdown";
import { Skeleton } from "~/lib/components/ui/skeleton";
import useAISummerization from "./useAISummerization";

export default function AISummerization(props: { articleId: string }) {
  const summerization = useAISummerization({ articleId: props.articleId });

  return (
    <div className="flex flex-col gap-2 rounded-xl border p-4">
      <h3 className="flex items-center gap-2 font-bold">
        <SparkleIcon className="size-4" />
        <span>AI Summerization</span>
      </h3>
      {!summerization && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
        </div>
      )}
      <MemoizedMarkdown className="prose-sm">{summerization}</MemoizedMarkdown>
    </div>
  );
}
