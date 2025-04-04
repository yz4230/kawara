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
import { object, string } from "valibot";
import { Separator } from "~/lib/components/ui/separator";
import { db } from "~/lib/server/db";
import SYSMTEM_INSTRUCTION from "~/prompts/summerize.txt?raw";
import { DateFormat } from "~/shared/format";

async function fetchArticleContent(url: string) {
  const html = await fetch(url).then((res) => res.text());
  const dom = new JSDOM(html);
  return new Readability(dom.window.document).parse();
}

const summerizeWithAI = createServerFn({ method: "GET", response: "raw" })
  .validator(
    object({
      articleId: string(),
    }),
  )
  .handler(async ({ data, signal }) => {
    const article = await db.query.articles.findFirst({
      where: (articles, { eq }) => eq(articles.id, data.articleId),
    });
    if (!article) throw notFound();
    if (!article.url) throw new Error("Article URL is not available");

    const content = await fetchArticleContent(article.url);
    invariant(content?.textContent, "Failed to parse article content");

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
    const resopnse = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: content.textContent,
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

const getOriginalArticle = createServerFn({ method: "GET" })
  .validator(
    object({
      providerId: string(),
      articleId: string(),
    }),
  )
  .handler(async ({ data }) => {
    const article = await db.query.articles.findFirst({
      where: (articles, { and, eq }) =>
        and(eq(articles.providerId, data.providerId), eq(articles.id, data.articleId)),
    });
    if (!article) throw notFound();
    return article;
  });

export const Route = createFileRoute("/feeds/$providerId/$articleId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { providerId, articleId } = params;
    const article = await getOriginalArticle({
      data: { providerId, articleId },
    });
    return { article };
  },
});

function extractDomain(url: string) {
  const { hostname } = new URL(url);
  const domainParts = hostname.split(".");
  // if the domain starts with "www.", remove it
  if (domainParts.at(0) === "www") domainParts.shift();
  return domainParts.join(".");
}

function RouteComponent() {
  const { article } = Route.useLoaderData();
  const [response, setResponse] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    summerizeWithAI({ data: { articleId: article.id }, signal: controller.signal }).then(
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
  }, [article.id]);

  return (
    <div className="flex flex-col">
      <h2 className="mt-4 text-2xl font-bold">{article.title}</h2>
      <div className="mt-2 flex items-center gap-3">
        {article.datePublished && (
          <div className="text-muted-foreground text-sm">
            {format(article.datePublished, DateFormat.dateTime)}
          </div>
        )}
        {article.url && (
          <a
            href={article.url}
            target="_blank"
            className="text-muted-foreground flex items-center gap-1 text-sm"
          >
            <span>{extractDomain(article.url)}</span>
            <ExternalLinkIcon className="size-3.5" />
          </a>
        )}
      </div>
      <Separator className="mt-4" />
      <div
        className="prose dark:prose-invert mt-4 flex max-w-full flex-col whitespace-pre-line"
        dangerouslySetInnerHTML={{ __html: response }}
      />
    </div>
  );
}
