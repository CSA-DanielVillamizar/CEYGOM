// Catalog search on /productos/: by reference code, product name or category, with a category filter.
// The index is fetched the first time the visitor focuses the field (or arrives with ?q=). Results are built with
// DOM APIs and textContent, never innerHTML. The add-to-quote buttons are handled by the global site script.
import { search, type SearchEntry } from "@shared/search";

const form = document.getElementById("catalog-search") as HTMLFormElement | null;
const input = document.getElementById("catalog-q") as HTMLInputElement | null;
const select = document.getElementById("catalog-cat") as HTMLSelectElement | null;
const finishSelect = document.getElementById("catalog-finish") as HTMLSelectElement | null;
const browse = document.getElementById("catalog-browse");
const results = document.getElementById("catalog-results");
const status = document.getElementById("catalog-status");

type Attrs = Record<string, string | number | boolean | undefined>;
function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: (Node | string)[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k === "class") node.className = String(v);
    else if (k.startsWith("data-") || k.startsWith("aria-") || k === "href" || k === "type" || k === "min" || k === "value" || k === "scope") node.setAttribute(k, String(v));
    else (node as unknown as Record<string, unknown>)[k] = v;
  }
  node.append(...children);
  return node;
}

let index: SearchEntry[] | null = null;
let loading: Promise<SearchEntry[]> | null = null;

function loadIndex(): Promise<SearchEntry[]> {
  if (index) return Promise.resolve(index);
  loading ??= fetch("/productos/search-index.json")
    .then((r) => (r.ok ? (r.json() as Promise<SearchEntry[]>) : Promise.reject(new Error(String(r.status)))))
    .then((data) => (index = data))
    .catch((e) => {
      loading = null;
      throw e;
    });
  return loading;
}

const plural = (n: number, one: string, many: string) => `${n.toLocaleString("es-CO")} ${n === 1 ? one : many}`;

function addButton(attrs: Attrs, label: string): HTMLButtonElement {
  return el("button", { type: "button", "data-cart-add": "", class: "rounded border border-steel-200 bg-white px-3 py-1.5 text-sm font-semibold hover:border-brand-600", ...attrs }, label);
}

function render(query: string, category: string, finish: string) {
  if (!index || !results || !browse || !status) return;
  const hasFilter = query.trim() !== "" || category !== "" || finish !== "";
  browse.hidden = hasFilter;
  results.hidden = !hasFilter;
  if (!hasFilter) {
    status.textContent = "";
    return;
  }

  const { products, references } = search(index, query, category, finish);
  status.textContent = products.length === 0 ? "No encontramos coincidencias." : `${plural(products.length, "producto", "productos")}${references.length ? ` y ${plural(references.length, "referencia", "referencias")}` : ""}.`;
  results.replaceChildren();

  if (products.length === 0) {
    results.append(
      el("p", { class: "rounded-lg border border-steel-200 bg-white p-6 text-steel-600" },
        "No encontramos productos ni referencias con esa búsqueda. Prueba con el código (por ejemplo BP0101), con una palabra del nombre o quita los filtros de categoría y acabado. Si no lo encuentras, ",
        el("a", { href: "/cotizador/?producto=fabricacion-a-medida", class: "font-semibold text-brand-700 underline" }, "lo fabricamos a medida"),
        "."),
    );
    return;
  }

  results.append(el("h2", { class: "text-xl font-bold" }, "Productos"));
  const list = el("ul", { class: "mt-3 grid gap-3 sm:grid-cols-2" });
  for (const p of products) {
    list.append(
      el("li", { class: "flex items-center justify-between gap-3 rounded-lg border border-steel-200 bg-white p-4" },
        el("span", {},
          el("a", { href: `/productos/${p.c}/${p.s}/`, class: "font-semibold hover:text-brand-700" }, p.n),
          el("span", { class: "block text-xs text-steel-600" }, `${p.l}${p.r.length ? ` · ${plural(p.r.length, "referencia", "referencias")}` : ""}`)),
        addButton({ "data-slug": p.s, "data-name": p.n, "data-cat": p.c }, "Agregar")),
    );
  }
  results.append(list);

  if (references.length > 0) {
    results.append(el("h2", { class: "mt-8 text-xl font-bold" }, "Referencias"));
    const tbody = el("tbody");
    for (const r of references) {
      const qty = el("input", { type: "number", min: 1, value: 1, "data-cart-qty": "", "aria-label": `Cantidad de ${r.code}`, class: "w-16 rounded border border-steel-200 px-2 py-1" });
      tbody.append(
        el("tr", { class: "border-t border-steel-200", "data-cart-row": "" },
          el("td", { class: "px-4 py-2 font-mono" }, r.code),
          el("td", { class: "px-4 py-2" }, r.text, " · ", el("a", { href: `/productos/${r.category}/${r.slug}/`, class: "text-brand-700 underline" }, r.name)),
          el("td", { class: "px-4 py-2" }, el("span", { class: "flex items-center gap-2" }, qty, addButton({ "data-slug": r.slug, "data-ref": r.code, "data-name": r.name, "data-cat": r.category }, "Agregar")))),
      );
    }
    results.append(
      el("div", { class: "mt-3 overflow-x-auto rounded-lg border border-steel-200 bg-white" },
        el("table", { class: "w-full text-left text-sm" },
          el("caption", { class: "sr-only" }, "Referencias encontradas"),
          el("thead", { class: "bg-steel-50 text-steel-600" }, el("tr", {}, el("th", { scope: "col", class: "px-4 py-2 font-semibold" }, "Código"), el("th", { scope: "col", class: "px-4 py-2 font-semibold" }, "Descripción"), el("th", { scope: "col", class: "px-4 py-2 font-semibold" }, "Cotizar"))),
          tbody)),
    );
  }
}

function sync() {
  if (!input || !select) return;
  const params = new URLSearchParams(window.location.search);
  input.value.trim() ? params.set("q", input.value.trim()) : params.delete("q");
  select.value ? params.set("cat", select.value) : params.delete("cat");
  finishSelect?.value ? params.set("acabado", finishSelect.value) : params.delete("acabado");
  const qs = params.toString();
  history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
}

let timer = 0;
async function run() {
  if (!input || !select) return;
  try {
    await loadIndex();
  } catch {
    if (status) status.textContent = "No pudimos cargar el buscador. Recarga la página o explora las categorías.";
    return;
  }
  render(input.value, select.value, finishSelect?.value ?? "");
  sync();
}

if (form && input && select) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    void run();
  });
  input.addEventListener("focus", () => void loadIndex().catch(() => undefined), { once: true });
  input.addEventListener("input", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => void run(), 120);
  });
  select.addEventListener("change", () => void run());
  finishSelect?.addEventListener("change", () => void run());
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && input.value) {
      input.value = "";
      void run();
    }
  });

  const params = new URLSearchParams(window.location.search);
  input.value = params.get("q") ?? "";
  select.value = params.get("cat") ?? "";
  if (finishSelect) finishSelect.value = params.get("acabado") ?? "";
  if (input.value || select.value || finishSelect?.value) void run();
}
