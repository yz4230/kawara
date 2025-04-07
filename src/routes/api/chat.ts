import { createAPIFileRoute } from "@tanstack/react-start/api";
import { notFound } from "@tanstack/router-core";
import { streamText } from "ai";
import { any, array, object, parser, string } from "valibot";
import { gemini } from "~/lib/ai-models";
import { fetchArticleContent } from "~/lib/crawl";
import { db } from "~/lib/server/db";

const schema = object({
  messages: array(any()),
  articleId: string(),
});

export const APIRoute = createAPIFileRoute("/api/chat")({
  POST: async ({ request }) => {
    const body = await request.json().then(parser(schema));

    const article = await db.query.articles.findFirst({
      where: (articles, { eq }) => eq(articles.id, body.articleId),
    });
    if (!article?.url) throw notFound();

    const content = await fetchArticleContent(article.url);
    if (!content) throw notFound();

    const systemInstruction = `
You are a helpful assistant.
Answer the user's questions based on the article content in the user's language.
Article content:
${content.textContent}`.trimStart();

    const result = streamText({
      model: gemini,
      messages: [{ role: "system", content: systemInstruction }, ...body.messages],
      abortSignal: request.signal,
    });

    return result.toDataStreamResponse({
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  },
});
