import { GoogleGenAI } from "@google/genai";
import { Readability } from "@mozilla/readability";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { invariant, throttle } from "es-toolkit";
import { JSDOM } from "jsdom";
import { ExternalLinkIcon } from "lucide-react";
import { marked } from "marked";
import { useEffect, useState } from "react";
import { object, pipe, string, url } from "valibot";
import { Separator } from "~/lib/components/ui/separator";
import { db } from "~/lib/server/db";
import SYSMTEM_INSTRUCTION from "~/prompts/summerize.txt?raw";

async function fetchArticleContent(url: string) {
  const html = await fetch(url).then((res) => res.text());
  const dom = new JSDOM(html);
  return new Readability(dom.window.document).parse();
}

const summerizeWithAI = createServerFn({ method: "GET", response: "raw" })
  .validator(
    object({
      url: pipe(string(), url()),
    }),
  )
  .handler(async ({ data, signal }) => {
    const article = await fetchArticleContent(data.url);
    invariant(article?.textContent, "Failed to parse article content");

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
    const resopnse = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: article.textContent,
      config: { systemInstruction: SYSMTEM_INSTRUCTION },
    });

    const stream = new ReadableStream<string>({
      async start(controller) {
        for await (const chunk of resopnse) {
          if (signal.aborted) break;
          if (chunk.text) controller.enqueue(chunk.text);
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      },
    });
  });

const getOriginalEntry = createServerFn({ method: "GET" })
  .validator(
    object({
      providerId: string(),
      entryId: string(),
    }),
  )
  .handler(async ({ data }) => {
    const entry = await db.query.feedEntry.findFirst({
      where: (feedEntry, { and, eq }) =>
        and(eq(feedEntry.providerId, data.providerId), eq(feedEntry.id, data.entryId)),
    });
    if (!entry) throw notFound();
    return entry;
  });

export const Route = createFileRoute("/feeds/$providerId/$entryId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { providerId, entryId } = params;
    const entry = await getOriginalEntry({ data: { providerId, entryId } });
    return { entry };
  },
});

function getDomain(url: string) {
  const { hostname } = new URL(url);
  return hostname.replace("www.", "");
}

function RouteComponent() {
  const { entry } = Route.useLoaderData();
  const [response, setResponse] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    summerizeWithAI({ data: { url: entry.link }, signal: controller.signal }).then(
      async (res) => {
        const reader = res.body?.getReader();
        if (!reader) return;

        const setResponseThrottle = throttle(setResponse, 250);
        const decoder = new TextDecoder();
        let text = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (controller.signal.aborted) break;
          const chunk = decoder.decode(value, { stream: true });
          text += chunk;
          Promise.resolve(marked(text)).then(setResponseThrottle);
        }
      },
    );

    return () => {
      controller.abort();
    };
  }, [entry.link]);

  return (
    <div className="flex flex-col">
      <h2 className="mt-4 text-2xl font-bold">{entry.title}</h2>
      <div className="mt-2 flex items-center gap-3">
        <div className="text-muted-foreground text-sm">
          {format(entry.createdAt, "yyyy/MM/dd HH:mm")}
        </div>
        <a
          href={entry.link}
          target="_blank"
          className="text-muted-foreground flex items-center gap-1 text-sm"
        >
          <span>{getDomain(entry.link)}</span>
          <ExternalLinkIcon className="size-3.5" />
        </a>
      </div>
      <Separator className="mt-4" />
      <div
        className="prose mt-4 flex max-w-full flex-col whitespace-pre-line"
        dangerouslySetInnerHTML={{ __html: response }}
      />
    </div>
  );
}
