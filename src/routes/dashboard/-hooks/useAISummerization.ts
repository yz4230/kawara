import { throttle } from "es-toolkit";
import { marked } from "marked";
import { useEffect, useState } from "react";
import { summerizeWithAI } from "./server-fn";

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

      const setResponseThrottle = throttle(setResponse, 100);
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
    });

    return () => {
      controller.abort();
    };
  }, [options.articleId]);

  return response;
}
