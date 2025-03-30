import { createAPIFileRoute } from "@tanstack/react-start/api";
import { serve } from "inngest/edge";
import { functions, inngest } from "~/inngest";

const handler = serve({ client: inngest, functions });

export const APIRoute = createAPIFileRoute("/api/inngest")({
  GET: ({ request }) => handler(request),
  POST: ({ request }) => handler(request),
  PUT: ({ request }) => handler(request),
});
