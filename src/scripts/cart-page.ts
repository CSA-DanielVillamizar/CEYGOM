// "Mi cotización" page: shows the quote list, lets the visitor change quantities or remove lines.
// Built with DOM APIs and textContent only: the stored list is untrusted (loadCart already sanitizes it).
import { annexFor, type AnnexIndex } from "@shared/annex";
import { CART_KEY, cartUnits, clearStoredCart, lineKey, loadCart, removeLine, saveCart, setQty, type Cart } from "@shared/cart";

const store = (() => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
})();

const rows = document.getElementById("cart-rows");
const empty = document.getElementById("cart-empty");
const content = document.getElementById("cart-content");
const summary = document.getElementById("cart-summary");
const live = document.getElementById("cart-live");
const clear = document.getElementById("cart-clear") as HTMLButtonElement | null;

const plural = (n: number, one: string, many: string) => `${n.toLocaleString("es-CO")} ${n === 1 ? one : many}`;

function persist(cart: Cart) {
  saveCart(store, cart);
  window.dispatchEvent(new Event("ceygom:cart"));
}

function renderSummary(cart: Cart) {
  if (summary) summary.textContent = `${plural(cart.lines.length, "línea", "líneas")} · ${plural(cartUnits(cart), "unidad", "unidades")}`;
}

// Technical annex printed with the list. The index is fetched only when the list has lines; the annex is built with
// DOM APIs and textContent, and stays hidden on screen (print only).
const annex = document.getElementById("cart-annex");
let annexIndex: Promise<AnnexIndex | null> | null = null;
function loadAnnexIndex(): Promise<AnnexIndex | null> {
  annexIndex ??= fetch("/productos/anexo-index.json")
    .then((r) => (r.ok ? (r.json() as Promise<AnnexIndex>) : null))
    .catch(() => null);
  return annexIndex;
}

const text = (tag: "h2" | "h3" | "p" | "li" | "ul", content: string, className = "") => Object.assign(document.createElement(tag), { textContent: content, className });

async function renderAnnex(cart: Cart) {
  if (!annex) return;
  annex.replaceChildren();
  if (cart.lines.length === 0) return;
  const index = await loadAnnexIndex();
  if (!index) return;
  const entries = annexFor(index, cart.lines);
  if (entries.length === 0) return;

  const title = text("h2", "Anexo técnico", "text-xl font-bold");
  title.id = "annex-title";
  annex.append(title, text("p", "Información tomada de las fichas técnicas de la empresa. Las medidas están en milímetros salvo que se indique otra unidad. Un asesor confirma especificaciones y disponibilidad al cotizar.", "mt-1 text-xs"));

  for (const e of entries) {
    const block = document.createElement("div");
    block.className = "mt-4 break-inside-avoid border-t border-steel-200 pt-3 text-sm";
    block.append(text("h3", e.name, "font-bold"));
    if (e.material) block.append(text("p", `Material: ${e.material}`));
    if (e.finishes.length) block.append(text("p", `Acabado: ${e.finishes.join(" o ")}`));
    if (e.colors) block.append(text("p", `Colores (los dos últimos dígitos de la referencia): ${e.colors}`));
    if (e.ficha) block.append(text("p", `Ficha técnica: ${e.ficha.code ?? "PDF"} (${window.location.origin}${e.ficha.path})`));
    if (e.refs.length) {
      const list = document.createElement("ul");
      list.className = "mt-1 list-disc pl-5";
      for (const r of e.refs) list.append(text("li", `${r.code}: ${r.text}${r.specs.length ? ` · ${r.specs.map(([label, value]) => `${label} ${value}`).join(" · ")}` : ""}`, "tabular-nums"));
      block.append(list);
    }
    annex.append(block);
  }
}

function render() {
  if (!rows || !empty || !content) return;
  const cart = loadCart(store);
  empty.hidden = cart.lines.length > 0;
  content.hidden = cart.lines.length === 0;
  rows.replaceChildren();
  renderSummary(cart);
  void renderAnnex(cart);

  for (const line of cart.lines) {
    const key = lineKey(line);
    const label = line.name ?? line.slug;

    const name = line.cat
      ? Object.assign(document.createElement("a"), { href: `/productos/${line.cat}/${line.slug}/`, className: "font-semibold hover:text-brand-700", textContent: label })
      : Object.assign(document.createElement("span"), { className: "font-semibold", textContent: label });

    const qty = Object.assign(document.createElement("input"), { type: "number", min: "1", value: String(line.qty), className: "w-20 rounded border border-steel-200 px-2 py-1" });
    qty.setAttribute("aria-label", `Cantidad de ${label}${line.ref ? ` ${line.ref}` : ""}`);
    qty.addEventListener("change", () => {
      const next = setQty(loadCart(store), key, Number(qty.value));
      persist(next);
      if (next.lines.length !== cart.lines.length) return render();
      qty.value = String(next.lines.find((l) => lineKey(l) === key)?.qty ?? 1);
      renderSummary(next);
    });

    const remove = Object.assign(document.createElement("button"), { type: "button", className: "text-sm font-semibold text-brand-700 underline", textContent: "Quitar" });
    remove.setAttribute("aria-label", `Quitar ${label}${line.ref ? ` ${line.ref}` : ""} de la lista`);
    remove.addEventListener("click", () => {
      persist(removeLine(loadCart(store), key));
      if (live) live.textContent = `${label} quitado de tu lista.`;
      render();
    });

    const tr = document.createElement("tr");
    tr.className = "border-t border-steel-200";
    const cells: (Node | string)[][] = [[name], [line.ref ? Object.assign(document.createElement("span"), { className: "font-mono", textContent: line.ref }) : "General"], [qty], [remove]];
    for (const [i, nodes] of cells.entries()) {
      const td = document.createElement("td");
      td.className = i === 3 ? "px-4 py-2 print:hidden" : "px-4 py-2";
      td.append(...nodes);
      tr.append(td);
    }
    rows.append(tr);
  }
}

// Two clicks to empty the list, without browser dialogs.
let armed = 0;
clear?.addEventListener("click", () => {
  if (!armed) {
    clear.textContent = "¿Seguro? Pulsa de nuevo para vaciar";
    armed = window.setTimeout(() => {
      armed = 0;
      clear.textContent = "Vaciar lista";
    }, 4000);
    return;
  }
  window.clearTimeout(armed);
  armed = 0;
  clear.textContent = "Vaciar lista";
  clearStoredCart(store);
  window.dispatchEvent(new Event("ceygom:cart"));
  if (live) live.textContent = "Tu lista quedó vacía.";
  render();
});

// The browser's print dialog offers "Save as PDF": no PDF library is shipped. The page prints with the company letterhead.
document.getElementById("cart-print")?.addEventListener("click", () => window.print());
window.addEventListener("beforeprint", () => {
  const date = document.getElementById("print-date");
  if (date) date.textContent = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
});

window.addEventListener("storage", (e) => e.key === CART_KEY && render());
render();
