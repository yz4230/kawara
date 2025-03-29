import { GoogleGenAI } from "@google/genai";
import { Readability } from "@mozilla/readability";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { invariant, isString } from "es-toolkit";
import { Window } from "happy-dom";
import { LoaderCircleIcon } from "lucide-react";
import { marked } from "marked";
import { useCallback, type FormEvent } from "react";
import { object, pipe, string, url } from "valibot";
import { Button } from "~/lib/components/ui/button";
import { Input } from "~/lib/components/ui/input";
import SYSMTEM_INSTRUCTION from "~/prompts/summerize.txt?raw";

export const Route = createFileRoute("/ai")({
  component: RouteComponent,
});

async function fetchArticleContent(url: string) {
  const window = new Window({ url });
  window.document.body.innerHTML = await fetch(url).then((res) => res.text());
  // @ts-ignore
  return new Readability(window.document).parse();
}

const summerizeWithAI = createServerFn({ method: "POST" })
  .validator(
    object({
      url: pipe(string(), url()),
    }),
  )
  .handler(async ({ data }) => {
    const article = await fetchArticleContent(data.url);
    invariant(article?.textContent, "Failed to parse article content");

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: article.textContent,
      config: { systemInstruction: SYSMTEM_INSTRUCTION },
    });
    invariant(isString(res.text), "Failed to generate content");
    const html = await marked.parse(res.text);
    return { html };
  });

function RouteComponent() {
  const { mutate, data, isPending } = useMutation({ mutationFn: summerizeWithAI });

  const handleSubmit = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      const formData = new FormData(ev.currentTarget);
      const url = formData.get("url");
      invariant(isString(url), "url must be a string");
      mutate({ data: { url } });
    },
    [mutate],
  );

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-lg flex-col gap-4 p-6">
      <Input required type="url" name="url" placeholder="Enter URL" />
      <Button type="submit" disabled={isPending}>
        {isPending && <LoaderCircleIcon className="size-4 animate-spin" />}
        <span>Send</span>
      </Button>
      {data && <div className="prose" dangerouslySetInnerHTML={{ __html: data.html }} />}
    </form>
  );
}
