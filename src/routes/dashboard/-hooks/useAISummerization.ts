import { GoogleGenAI } from "@google/genai";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { invariant } from "es-toolkit";
import { useEffect, useState } from "react";
import { object, string } from "valibot";
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
      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (controller.signal.aborted) break;
        const chunk = decoder.decode(value, { stream: true });
        text += chunk;
        setResponse(text);
      }
    });

    return () => {
      controller.abort();
    };
  }, [options.articleId]);

  return response;
}
