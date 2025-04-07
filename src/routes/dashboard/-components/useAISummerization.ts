import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { processTextStream, streamText } from "ai";
import { invariant } from "es-toolkit";
import { useEffect, useState } from "react";
import { object, string } from "valibot";
import { gemini } from "~/lib/ai-models";
import { fetchArticleContent } from "~/lib/crawl";
import { db } from "~/lib/server/db";
import SYSMTEM_INSTRUCTION from "~/prompts/summerize.txt?raw";

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

    const result = streamText({
      model: gemini,
      messages: [
        { role: "system", content: SYSMTEM_INSTRUCTION },
        { role: "user", content: content.textContent },
      ],
      abortSignal: signal,
    });

    return result.toTextStreamResponse({
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  });

export default function useAISummerization(options: { articleId: string }) {
  const [response, setResponse] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    summerizeWithAI({
      data: { articleId: options.articleId },
      signal: controller.signal,
    }).then(async (res) => {
      if (!res.body) return;
      let text = "";
      processTextStream({
        stream: res.body,
        onTextPart: (chunk) => {
          text += chunk;
          setResponse(text);
        },
      });
    });

    return () => {
      controller.abort();
    };
  }, [options.articleId]);

  return response;
}
