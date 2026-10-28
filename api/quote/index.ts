import { app } from "@azure/functions";
import { handleQuote } from "./handler";

// Managed function in Azure Static Web Apps: reachable as POST /api/quote.
// SWA proxies /api/*, so the browser never needs CORS and authLevel stays "anonymous".
app.http("quote", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "quote",
  handler: (req, ctx) => handleQuote(req, ctx),
});
