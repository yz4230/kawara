import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { SendIcon, SparkleIcon, UserIcon } from "lucide-react";
import { MemoizedMarkdown } from "~/lib/components/memorized-markdown";
import { Button } from "~/lib/components/ui/button";
import { Input } from "~/lib/components/ui/input";

export default function AIFollowUp(props: { articleId: string }) {
  const { messages, input, handleInputChange, handleSubmit, status, error } = useChat({
    body: {
      articleId: props.articleId,
    },
  });

  return (
    <div className="flex flex-col gap-2 rounded-xl border p-4">
      <h3 className="flex items-center gap-2 font-bold">
        <SparkleIcon className="size-4" />
        <span>AI Follow Up</span>
      </h3>
      <p className="text-muted-foreground text-sm">
        Ask follow up questions about the article.
      </p>
      <div className="flex flex-col gap-4">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>
      {error && <div className="text-destructive">{error.message}</div>}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
        />
        <Button type="submit" size="icon" disabled={status !== "ready"}>
          <SendIcon />
        </Button>
      </form>
    </div>
  );
}

function Message(props: { message: UIMessage }) {
  const isUser = props.message.role === "user";

  return (
    <div className="flex gap-2">
      <div className="bg-accent grid size-8 shrink-0 place-items-center rounded-full border">
        {isUser ? (
          <UserIcon className="text-primary size-4.5" />
        ) : (
          <SparkleIcon className="text-primary size-4.5" />
        )}
      </div>
      {props.message.parts
        .filter((part) => part.type === "text")
        .map((part, i) => (
          <MemoizedMarkdown
            key={`${props.message.id}-${i}`}
            className="bg-accent prose-sm overflow-x-hidden rounded-lg border px-4 py-2"
          >
            {part.text}
          </MemoizedMarkdown>
        ))}
    </div>
  );
}
