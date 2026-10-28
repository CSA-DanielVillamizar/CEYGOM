// Builds the WhatsApp click-to-chat link: https://wa.me/<number>?text=<urlencoded text>
// The number must be digits only, in international format (no "+", spaces or dashes).
import { categoryLabel, productBySlug } from "./catalog";
import type { QuoteRequest } from "./quote.schema";

// The maximum URL length accepted by wa.me is not documented; keep the message short.
export const MAX_MESSAGE_LENGTH = 800;

export function normalizeWhatsappNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

type MessageInput = Pick<QuoteRequest, "items" | "project"> & {
  contact: Pick<QuoteRequest["contact"], "fullName" | "businessName">;
};

/**
 * Message text without personal contact or tax data. Email, phone, NIT/cédula, CIIU, fiscal
 * responsibilities and the RUT file stay in the lead record, never in the URL.
 */
export function buildWhatsappMessage(reference: string | undefined, req: MessageInput): string {
  const lines: string[] = [];
  lines.push(reference ? `Hola, quiero cotizar (ref. ${reference}):` : "Hola, quiero cotizar:");

  req.items.forEach((item, i) => {
    const name = (item.productSlug && productBySlug(item.productSlug)?.name) || categoryLabel(item.category);
    const dims = [item.widthMm, item.heightMm, item.depthMm].every((d) => d !== undefined)
      ? ` ${item.widthMm}x${item.heightMm}x${item.depthMm} mm`
      : "";
    lines.push(`${i + 1}. ${name} x${item.quantity}${dims}`);
  });

  lines.push(`Ciudad: ${req.project.city}`);
  if (req.project.neededBy) lines.push(`Fecha requerida: ${req.project.neededBy}`);
  lines.push(`Soy ${req.contact.fullName}${req.contact.businessName ? ` (${req.contact.businessName})` : ""}.`);

  let text = lines.join("\n");
  if (text.length > MAX_MESSAGE_LENGTH) text = `${text.slice(0, MAX_MESSAGE_LENGTH - 1)}…`;
  return text;
}

export function buildWhatsappUrl(number: string, text: string): string {
  return `https://wa.me/${normalizeWhatsappNumber(number)}?text=${encodeURIComponent(text)}`;
}

/** Link with no message, used by the floating button when there is no product context. */
export function buildWhatsappChatUrl(number: string, text = "Hola, quiero información sobre sus productos."): string {
  return buildWhatsappUrl(number, text);
}
