// Small script loaded on every page: the quote-list counter in the header and the "Agregar a mi cotización"
// buttons (any element with data-cart-add). The list lives in localStorage and holds no personal data.
import { CART_KEY, CART_MAX_LINES, addLine, loadCart, saveCart } from "@shared/cart";

const store = (() => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
})();

const counters = document.querySelectorAll<HTMLElement>("[data-cart-count]");
const toast = document.getElementById("cart-toast");
let timer = 0;

function renderCount() {
  const lines = loadCart(store).lines.length;
  counters.forEach((el) => {
    el.textContent = String(lines);
    el.hidden = lines === 0;
  });
}

function announce(message: string) {
  const text = toast?.querySelector("[data-toast-text]");
  if (!toast || !text) return;
  text.textContent = message;
  toast.hidden = false;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => (toast.hidden = true), 5000);
}

renderCount();

// Offline mode (public/sw.js): pages and data sheets already opened keep working without a connection.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js").catch(() => undefined));
}
window.addEventListener("offline", () => announce("Sin conexión: puedes ver lo que ya abriste y tu lista se conserva. Para enviar una solicitud necesitas internet."));

window.addEventListener("storage", (e) => e.key === CART_KEY && renderCount());
window.addEventListener("ceygom:cart", renderCount);

document.addEventListener("click", (event) => {
  const button = (event.target as Element | null)?.closest<HTMLElement>("[data-cart-add]");
  if (!button) return;
  const row = button.closest<HTMLElement>("[data-cart-row]");
  const qtyInput = row?.querySelector<HTMLInputElement>("[data-cart-qty]");
  const { slug, ref, name, cat } = button.dataset;
  const label = `${name ?? slug}${ref ? ` (${ref})` : ""}`;

  const { cart, status } = addLine(loadCart(store), { slug, ref, name, cat, qty: qtyInput ? qtyInput.value : 1 });
  if (status === "invalid") return;
  if (status === "full") return announce(`Tu lista ya tiene el máximo de ${CART_MAX_LINES} productos. Envía la solicitud o quita alguno.`);
  if (!saveCart(store, cart)) return announce("Tu navegador no permite guardar la lista. Usa el botón Cotizar de la página del producto.");

  renderCount();
  window.dispatchEvent(new Event("ceygom:cart"));
  announce(`${label} agregado a tu cotización.`);

  // Brief confirmation on the button itself.
  const original = button.textContent;
  button.textContent = "Agregado ✓";
  window.setTimeout(() => (button.textContent = original), 1500);
});

// "Copiar" buttons (data-copy="<text>"): copy a reference code to the clipboard, e.g. to paste it into an order or email.
document.addEventListener("click", async (event) => {
  const button = (event.target as Element | null)?.closest<HTMLElement>("[data-copy]");
  if (!button?.dataset.copy) return;
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(button.dataset.copy);
    button.textContent = "Copiado ✓";
  } catch {
    button.textContent = "No se pudo copiar";
  }
  window.setTimeout(() => (button.textContent = original), 1500);
});
