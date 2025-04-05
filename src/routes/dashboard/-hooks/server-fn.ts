import { GoogleGenAI } from "@google/genai";
import { Readability } from "@mozilla/readability";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { invariant } from "es-toolkit";
import { JSDOM } from "jsdom";
import { object, string } from "valibot";
import { db } from "~/lib/server/db";
import SYSMTEM_INSTRUCTION from "~/prompts/summerize.txt?raw";

async function fetchArticleContent(url: string) {
  const html = await fetch(url).then((res) => res.text());
  const dom = new JSDOM(html);
  return new Readability(dom.window.document).parse();
}

export const summerizeWithAI = createServerFn({ method: "GET", response: "raw" })
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
