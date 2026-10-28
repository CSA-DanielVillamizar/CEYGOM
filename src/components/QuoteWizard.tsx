import { useEffect, useId, useReducer, useRef, useState, type ReactNode } from "react";
import type { z } from "zod";
import { CATEGORIES, PRODUCTS, productBySlug, type CategoryId } from "@shared/catalog";
import {
  ENVIRONMENTS,
  FINISHES,
  FISCAL_RESPONSIBILITIES,
  MAX_ITEMS,
  PERSON_TYPES,
  QuoteContactSchema,
  QuoteItemSchema,
  QuoteProjectSchema,
  QuoteRequestSchema,
  RUT_MAX_BYTES,
  RutFileSchema,
  type QuoteRequest,
  type QuoteResponse,
  type RutFile,
} from "@shared/quote.schema";
import { buildWhatsappMessage, buildWhatsappUrl } from "@shared/whatsapp";

const FINISH_LABELS: Record<(typeof FINISHES)[number], string> = {
  galvanizado: "Galvanizado",
  "pintura-electrostatica": "Pintura electrostática",
  inoxidable: "Acero inoxidable",
  otro: "Otro",
};

const PERSON_LABELS: Record<(typeof PERSON_TYPES)[number], string> = { natural: "Persona natural", juridica: "Persona jurídica" };

const FISCAL_LABELS: Record<(typeof FISCAL_RESPONSIBILITIES)[number], string> = {
  "responsable-iva": "Responsable de IVA",
  "no-responsable-iva": "No responsable de IVA",
  "gran-contribuyente": "Gran contribuyente",
  autorretenedor: "Autorretenedor",
  "regimen-simple": "Régimen Simple de Tributación",
  otra: "Otra (la confirmamos con tu RUT)",
};

type FiscalResponsibility = (typeof FISCAL_RESPONSIBILITIES)[number];

// ---- Draft state (inputs are strings; they are converted and validated with the shared Zod schemas) ----

interface ItemDraft {
  category: CategoryId | "";
  productSlug: string;
  quantity: string;
  widthMm: string;
  heightMm: string;
  depthMm: string;
  finish: string;
  notes: string;
}
interface ProjectDraft { city: string; neededBy: string; environment: string; notes: string }
interface ContactDraft {
  personType: "" | (typeof PERSON_TYPES)[number];
  fullName: string;
  businessName: string;
  taxId: string;
  taxIdCheckDigit: string;
  ciiuCode: string;
  fiscalResponsibilities: FiscalResponsibility[];
  email: string;
  phone: string;
  acceptsDataPolicy: boolean;
}

interface State {
  step: number;
  items: ItemDraft[];
  project: ProjectDraft;
  contact: ContactDraft;
  // The attachment lives only in memory: it is never written to sessionStorage.
  rutFile: RutFile | null;
  rutError: string;
  honeypot: string;
}

type Action =
  | { type: "hydrate"; state: Partial<State> }
  | { type: "step"; step: number }
  | { type: "item"; index: number; patch: Partial<ItemDraft> }
  | { type: "addItem" }
  | { type: "removeItem"; index: number }
  | { type: "project"; patch: Partial<ProjectDraft> }
  | { type: "contact"; patch: Partial<ContactDraft> }
  | { type: "rut"; file: RutFile | null; error: string }
  | { type: "honeypot"; value: string };

const emptyItem = (): ItemDraft => ({ category: "", productSlug: "", quantity: "1", widthMm: "", heightMm: "", depthMm: "", finish: "", notes: "" });

const initial: State = {
  step: 0,
  items: [emptyItem()],
  project: { city: "", neededBy: "", environment: "", notes: "" },
  contact: {
    personType: "",
    fullName: "",
    businessName: "",
    taxId: "",
    taxIdCheckDigit: "",
    ciiuCode: "",
    fiscalResponsibilities: [],
    email: "",
    phone: "",
    acceptsDataPolicy: false,
  },
  rutFile: null,
  rutError: "",
  honeypot: "",
};

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case "hydrate":
      return { ...state, ...a.state, contact: { ...state.contact, ...a.state.contact } };
    case "step":
      return { ...state, step: a.step };
    case "item":
      return { ...state, items: state.items.map((it, i) => (i === a.index ? { ...it, ...a.patch } : it)) };
    case "addItem":
      return state.items.length >= MAX_ITEMS ? state : { ...state, items: [...state.items, emptyItem()] };
    case "removeItem":
      return state.items.length <= 1 ? state : { ...state, items: state.items.filter((_, i) => i !== a.index) };
    case "project":
      return { ...state, project: { ...state.project, ...a.patch } };
    case "contact":
      return { ...state, contact: { ...state.contact, ...a.patch } };
    case "rut":
      return { ...state, rutFile: a.file, rutError: a.error };
    case "honeypot":
      return { ...state, honeypot: a.value };
  }
}

// ---- Draft -> payload ----

const num = (v: string): number | undefined => (v.trim() === "" ? undefined : Number(v));
const text = (v: string): string | undefined => (v.trim() === "" ? undefined : v);

const itemPayload = (d: ItemDraft) => ({
  category: d.category || undefined,
  productSlug: text(d.productSlug),
  quantity: num(d.quantity),
  widthMm: num(d.widthMm),
  heightMm: num(d.heightMm),
  depthMm: num(d.depthMm),
  finish: text(d.finish),
  notes: text(d.notes),
});
const projectPayload = (d: ProjectDraft) => ({ city: d.city, neededBy: text(d.neededBy), environment: text(d.environment), notes: text(d.notes) });
// `??` guards: progress saved by an older version of the form may lack the newer fields.
const contactPayload = (d: ContactDraft) => ({
  personType: d.personType || undefined,
  fullName: d.fullName,
  businessName: text(d.businessName ?? ""),
  taxId: d.taxId ?? "",
  taxIdCheckDigit: text(d.taxIdCheckDigit ?? ""),
  ciiuCode: d.ciiuCode ?? "",
  fiscalResponsibilities: d.fiscalResponsibilities ?? [],
  email: d.email,
  phone: d.phone,
  acceptsDataPolicy: d.acceptsDataPolicy,
});
const requestPayload = (s: State) => ({
  items: s.items.map(itemPayload),
  project: projectPayload(s.project),
  contact: contactPayload(s.contact),
  rutFile: s.rutFile ?? undefined,
  website: s.honeypot,
});

/** Reads the chosen file as Base64 (without the data URL prefix) and validates type, size and signature. */
function readRutFile(file: File): Promise<{ file: RutFile | null; error: string }> {
  if (file.size > RUT_MAX_BYTES) return Promise.resolve({ file: null, error: "El archivo supera los 5 MB." });
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve({ file: null, error: "No pudimos leer el archivo. Intenta con otro." });
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const parsed = RutFileSchema.safeParse({
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        contentBase64: result.slice(result.indexOf(",") + 1),
      });
      resolve(parsed.success ? { file: parsed.data, error: "" } : { file: null, error: parsed.error.issues[0]?.message ?? "Archivo no válido." });
    };
    reader.readAsDataURL(file);
  });
}

const formatSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** Wizard step that holds the field behind a server-side validation path. */
const stepForPath = (path: string) => (path.startsWith("items") ? 0 : path.startsWith("project") ? 1 : 2);

type Errors = Record<string, string>;

const collect = (issues: z.ZodIssue[], prefix = ""): Errors => {
  const out: Errors = {};
  for (const i of issues) {
    const key = `${prefix}${i.path.join(".")}`;
    if (!(key in out)) out[key] = i.message;
  }
  return out;
};

function validateStep(step: number, s: State): Errors {
  if (step === 0) {
    const errors: Errors = {};
    s.items.forEach((it, idx) => {
      const r = QuoteItemSchema.safeParse(itemPayload(it));
      if (!r.success) Object.assign(errors, collect(r.error.issues, `items.${idx}.`));
    });
    return errors;
  }
  if (step === 1) {
    const r = QuoteProjectSchema.safeParse(projectPayload(s.project));
    return r.success ? {} : collect(r.error.issues, "project.");
  }
  if (step === 2) {
    const r = QuoteContactSchema.safeParse(contactPayload(s.contact));
    return r.success ? {} : collect(r.error.issues, "contact.");
  }
  return {};
}

// ---- Persistence (progress survives a reload; consent is never stored) ----

const STORAGE_KEY = "ceygom-quote-v1";
const WHATSAPP_NUMBER = (import.meta.env.PUBLIC_WHATSAPP_NUMBER as string | undefined) ?? "";

const saveProgress = (s: State) => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...s, step: Math.min(s.step, 2), honeypot: "", rutFile: null, rutError: "", contact: { ...s.contact, acceptsDataPolicy: false } }),
    );
  } catch {
    /* storage can be unavailable (private mode); the wizard works without it */
  }
};
const loadProgress = (): Partial<State> | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<State>) : null;
  } catch {
    return null;
  }
};
const clearProgress = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

// ---- UI helpers ----

const STEPS = ["Productos", "Proyecto", "Contacto", "Resumen"] as const;
const inputCls = "mt-1 block w-full rounded border border-steel-200 bg-white px-3 py-2 text-base aria-[invalid=true]:border-brand-600";

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string | undefined; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
      {children}
      {hint && !error ? <p id={`${id}-hint`} className="mt-1 text-xs text-steel-600">{hint}</p> : null}
      {error ? <p id={`${id}-err`} className="mt-1 text-sm text-brand-700">{error}</p> : null}
    </div>
  );
}

type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done"; result: QuoteResponse }
  | { kind: "error"; message: string; fallbackUrl?: string };

export default function QuoteWizard() {
  const uid = useId();
  const [state, dispatch] = useReducer(reducer, initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submit, setSubmit] = useState<SubmitState>({ kind: "idle" });
  const [hydrated, setHydrated] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const rutInputRef = useRef<HTMLInputElement>(null);

  // Restore progress and prefill from /cotizador/?producto=<slug>.
  useEffect(() => {
    const saved = loadProgress();
    if (saved) dispatch({ type: "hydrate", state: saved });
    const slug = new URLSearchParams(window.location.search).get("producto");
    const product = slug ? productBySlug(slug) : undefined;
    if (product) dispatch({ type: "item", index: 0, patch: { category: product.category, productSlug: product.slug } });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && submit.kind !== "done") saveProgress(state);
  }, [state, hydrated, submit.kind]);

  // Move focus to the heading on step change, or to the first invalid field when validation fails.
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [errors]);
  useEffect(() => {
    if (hydrated) headingRef.current?.focus();
  }, [state.step, hydrated]);

  const go = (step: number) => {
    setErrors({});
    dispatch({ type: "step", step });
  };
  const next = () => {
    const found = validateStep(state.step, state);
    if (Object.keys(found).length > 0) return setErrors(found);
    go(state.step + 1);
  };

  const onSend = async () => {
    const parsed = QuoteRequestSchema.safeParse(requestPayload(state));
    if (!parsed.success) {
      setErrors(collect(parsed.error.issues));
      return;
    }
    const payload: QuoteRequest = parsed.data;
    const fallbackUrl = WHATSAPP_NUMBER ? buildWhatsappUrl(WHATSAPP_NUMBER, buildWhatsappMessage(undefined, payload)) : undefined;
    setSubmit({ kind: "sending" });
    try {
      const res = await fetch("/api/quote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        setSubmit({ kind: "done", result: (await res.json()) as QuoteResponse });
        clearProgress();
        return;
      }
      if (res.status === 400) {
        const body = (await res.json().catch(() => null)) as { issues?: { path: string; message: string }[] } | null;
        const issues = body?.issues ?? [];
        setErrors(Object.fromEntries(issues.map((i) => [i.path, i.message])));
        setSubmit({ kind: "idle" });
        dispatch({ type: "step", step: Math.min(...issues.map((i) => stepForPath(i.path)), 3) });
        return;
      }
      setSubmit({ kind: "error", message: "No pudimos registrar tu solicitud en este momento.", fallbackUrl });
    } catch {
      setSubmit({ kind: "error", message: "Sin conexión con el servidor.", fallbackUrl });
    }
  };

  const f = (name: string) => `${uid}-${name}`;
  const describedBy = (id: string, hasErr: boolean, hasHint = false) => (hasErr ? `${id}-err` : hasHint ? `${id}-hint` : undefined);

  // ---- Success screen ----
  if (submit.kind === "done") {
    return (
      <div role="status" className="rounded-lg border border-steel-200 bg-white p-6">
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">¡Solicitud recibida!</h2>
        <p className="mt-2">Tu referencia es <strong>{submit.result.reference}</strong>.</p>
        <p className="mt-2 text-steel-600">
          {submit.result.webhookDelivered ? "Un asesor revisará tu solicitud." : "Para agilizar, escríbenos ahora por WhatsApp."}
        </p>
        {!submit.result.webhookDelivered && state.rutFile && (
          <p className="mt-2 text-steel-600">No pudimos guardar el RUT que adjuntaste. Envíalo por WhatsApp junto con tu referencia para completar la facturación.</p>
        )}
        <a href={submit.result.whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700">
          Enviar resumen por WhatsApp
        </a>
      </div>
    );
  }

  const e = (k: string) => errors[k];
  const preview = QuoteRequestSchema.safeParse(requestPayload(state));
  const c = state.contact;
  const juridica = c.personType === "juridica";
  const toggleResponsibility = (value: FiscalResponsibility, on: boolean) => {
    const current = c.fiscalResponsibilities ?? [];
    const next = on ? [...current.filter((v) => v !== value), value] : current.filter((v) => v !== value);
    dispatch({ type: "contact", patch: { fiscalResponsibilities: next } });
  };
  const onRutChange = async (input: HTMLInputElement) => {
    const file = input.files?.[0];
    if (!file) return dispatch({ type: "rut", file: null, error: "" });
    const result = await readRutFile(file);
    if (result.error) input.value = "";
    dispatch({ type: "rut", file: result.file, error: result.error });
  };

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        if (state.step === 3) void onSend();
        else next();
      }}
      className="rounded-lg border border-steel-200 bg-white p-4 sm:p-6"
    >
      <ol className="mb-6 flex flex-wrap gap-2 text-sm" aria-label="Pasos del cotizador">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === state.step ? "step" : undefined} className={`rounded-full px-3 py-1 ${i === state.step ? "bg-brand-600 text-white" : i < state.step ? "bg-steel-200" : "bg-steel-50 text-steel-600"}`}>
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {Object.keys(errors).length > 0 && (
        <p role="alert" className="mb-4 rounded bg-brand-50 p-3 text-sm text-brand-700">Revisa los campos marcados antes de continuar.</p>
      )}

      <h2 ref={headingRef} tabIndex={-1} className="mb-4 text-xl font-bold outline-none">{STEPS[state.step]}</h2>

      {/* Step 1: items */}
      {state.step === 0 && (
        <div className="space-y-6">
          {state.items.map((it, idx) => {
            const p = `items.${idx}.`;
            const products = PRODUCTS.filter((x) => x.category === it.category);
            return (
              <fieldset key={idx} className="space-y-3 rounded border border-steel-200 p-4">
                <legend className="px-1 text-sm font-semibold">Producto {idx + 1}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id={f(`cat${idx}`)} label="Categoría" error={e(`${p}category`)}>
                    <select id={f(`cat${idx}`)} className={inputCls} value={it.category} aria-invalid={!!e(`${p}category`)} aria-describedby={describedBy(f(`cat${idx}`), !!e(`${p}category`))}
                      onChange={(ev) => dispatch({ type: "item", index: idx, patch: { category: ev.target.value as CategoryId | "", productSlug: "" } })}>
                      <option value="">Selecciona…</option>
                      {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </Field>
                  <Field id={f(`prod${idx}`)} label="Producto (opcional)">
                    <select id={f(`prod${idx}`)} className={inputCls} value={it.productSlug} disabled={!it.category}
                      onChange={(ev) => dispatch({ type: "item", index: idx, patch: { productSlug: ev.target.value } })}>
                      <option value="">Cualquiera / no sé</option>
                      {products.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
                    </select>
                  </Field>
                  <Field id={f(`qty${idx}`)} label="Cantidad" error={e(`${p}quantity`)}>
                    <input id={f(`qty${idx}`)} type="number" inputMode="numeric" min={1} className={inputCls} value={it.quantity} aria-invalid={!!e(`${p}quantity`)} aria-describedby={describedBy(f(`qty${idx}`), !!e(`${p}quantity`))}
                      onChange={(ev) => dispatch({ type: "item", index: idx, patch: { quantity: ev.target.value } })} />
                  </Field>
                  <Field id={f(`fin${idx}`)} label="Acabado (opcional)">
                    <select id={f(`fin${idx}`)} className={inputCls} value={it.finish} onChange={(ev) => dispatch({ type: "item", index: idx, patch: { finish: ev.target.value } })}>
                      <option value="">Por definir</option>
                      {FINISHES.map((x) => <option key={x} value={x}>{FINISH_LABELS[x]}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(["widthMm", "heightMm", "depthMm"] as const).map((k, n) => (
                    <Field key={k} id={f(`${k}${idx}`)} label={`${["Ancho", "Alto", "Fondo"][n]} (mm)`} error={e(`${p}${k}`)}>
                      <input id={f(`${k}${idx}`)} type="number" inputMode="numeric" min={1} className={inputCls} value={it[k]} aria-invalid={!!e(`${p}${k}`)} aria-describedby={describedBy(f(`${k}${idx}`), !!e(`${p}${k}`))}
                        onChange={(ev) => dispatch({ type: "item", index: idx, patch: { [k]: ev.target.value } })} />
                    </Field>
                  ))}
                </div>
                <Field id={f(`notes${idx}`)} label="Observaciones (opcional)" error={e(`${p}notes`)}>
                  <textarea id={f(`notes${idx}`)} rows={2} className={inputCls} value={it.notes} onChange={(ev) => dispatch({ type: "item", index: idx, patch: { notes: ev.target.value } })} />
                </Field>
                {state.items.length > 1 && (
                  <button type="button" className="text-sm text-brand-700 underline" onClick={() => dispatch({ type: "removeItem", index: idx })}>Quitar este producto</button>
                )}
              </fieldset>
            );
          })}
          {e("items") && <p className="text-sm text-brand-700">{e("items")}</p>}
          {state.items.length < MAX_ITEMS && (
            <button type="button" className="rounded border border-steel-200 px-4 py-2 text-sm font-semibold hover:bg-steel-50" onClick={() => dispatch({ type: "addItem" })}>+ Agregar otro producto</button>
          )}
        </div>
      )}

      {/* Step 2: project */}
      {state.step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id={f("city")} label="Ciudad de entrega" error={e("project.city")}>
            <input id={f("city")} className={inputCls} autoComplete="address-level2" value={state.project.city} aria-invalid={!!e("project.city")} aria-describedby={describedBy(f("city"), !!e("project.city"))}
              onChange={(ev) => dispatch({ type: "project", patch: { city: ev.target.value } })} />
          </Field>
          <Field id={f("needed")} label="Fecha requerida (opcional)" error={e("project.neededBy")}>
            <input id={f("needed")} type="date" className={inputCls} value={state.project.neededBy} aria-invalid={!!e("project.neededBy")} aria-describedby={describedBy(f("needed"), !!e("project.neededBy"))}
              onChange={(ev) => dispatch({ type: "project", patch: { neededBy: ev.target.value } })} />
          </Field>
          <Field id={f("env")} label="Ambiente de instalación (opcional)">
            <select id={f("env")} className={inputCls} value={state.project.environment} onChange={(ev) => dispatch({ type: "project", patch: { environment: ev.target.value } })}>
              <option value="">Por definir</option>
              {ENVIRONMENTS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field id={f("pnotes")} label="Detalles del proyecto (opcional)" error={e("project.notes")}>
              <textarea id={f("pnotes")} rows={3} className={inputCls} value={state.project.notes} onChange={(ev) => dispatch({ type: "project", patch: { notes: ev.target.value } })} />
            </Field>
          </div>
        </div>
      )}

      {/* Step 3: contact */}
      {state.step === 2 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-semibold">Tipo de persona</legend>
            <div className="mt-1 flex flex-wrap gap-4">
              {PERSON_TYPES.map((t, i) => (
                <label key={t} className="flex items-center gap-2">
                  <input type="radio" name={f("personType")} value={t} className="h-4 w-4" checked={c.personType === t}
                    aria-invalid={i === 0 && !!e("contact.personType")} aria-describedby={e("contact.personType") ? f("personType-err") : undefined}
                    onChange={() => dispatch({ type: "contact", patch: { personType: t } })} />
                  {PERSON_LABELS[t]}
                </label>
              ))}
            </div>
            {e("contact.personType") && <p id={f("personType-err")} className="mt-1 text-sm text-brand-700">{e("contact.personType")}</p>}
          </fieldset>
          {juridica && (
            <div className="sm:col-span-2">
              <Field id={f("businessName")} label="Razón social o nombre comercial" error={e("contact.businessName")}>
                <input id={f("businessName")} className={inputCls} autoComplete="organization" value={c.businessName ?? ""} aria-invalid={!!e("contact.businessName")} aria-describedby={describedBy(f("businessName"), !!e("contact.businessName"))}
                  onChange={(ev) => dispatch({ type: "contact", patch: { businessName: ev.target.value } })} />
              </Field>
            </div>
          )}
          <Field id={f("name")} label={juridica ? "Nombre de la persona de contacto" : "Nombre completo"} error={e("contact.fullName")}>
            <input id={f("name")} className={inputCls} autoComplete="name" value={c.fullName} aria-invalid={!!e("contact.fullName")} aria-describedby={describedBy(f("name"), !!e("contact.fullName"))}
              onChange={(ev) => dispatch({ type: "contact", patch: { fullName: ev.target.value } })} />
          </Field>
          <Field id={f("taxId")} label={juridica ? "NIT (sin dígito de verificación)" : "Cédula"} error={e("contact.taxId")} hint={juridica ? "Solo el número, sin puntos. Ej.: 900123456" : "Solo el número, sin puntos. Ej.: 1020304050"}>
            <input id={f("taxId")} inputMode="numeric" className={inputCls} autoComplete="off" value={c.taxId ?? ""} aria-invalid={!!e("contact.taxId")} aria-describedby={describedBy(f("taxId"), !!e("contact.taxId"), true)}
              onChange={(ev) => dispatch({ type: "contact", patch: { taxId: ev.target.value } })} />
          </Field>
          {juridica && (
            <Field id={f("dv")} label="Dígito de verificación (DV)" error={e("contact.taxIdCheckDigit")} hint="El número que va después del guion del NIT. Ej.: 8">
              <input id={f("dv")} inputMode="numeric" maxLength={1} className={inputCls} autoComplete="off" value={c.taxIdCheckDigit ?? ""} aria-invalid={!!e("contact.taxIdCheckDigit")} aria-describedby={describedBy(f("dv"), !!e("contact.taxIdCheckDigit"), true)}
                onChange={(ev) => dispatch({ type: "contact", patch: { taxIdCheckDigit: ev.target.value } })} />
            </Field>
          )}
          <Field id={f("ciiu")} label="Actividad económica (código CIIU)" error={e("contact.ciiuCode")} hint="4 dígitos; aparece en la sección de actividad económica de tu RUT. Ej.: 2599">
            <input id={f("ciiu")} inputMode="numeric" maxLength={4} className={inputCls} autoComplete="off" value={c.ciiuCode ?? ""} aria-invalid={!!e("contact.ciiuCode")} aria-describedby={describedBy(f("ciiu"), !!e("contact.ciiuCode"), true)}
              onChange={(ev) => dispatch({ type: "contact", patch: { ciiuCode: ev.target.value } })} />
          </Field>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-semibold">Responsabilidades fiscales (según tu RUT)</legend>
            <div className="mt-1 grid gap-1 sm:grid-cols-2">
              {FISCAL_RESPONSIBILITIES.map((v, i) => (
                <label key={v} className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" checked={(c.fiscalResponsibilities ?? []).includes(v)}
                    aria-invalid={i === 0 && !!e("contact.fiscalResponsibilities")} aria-describedby={e("contact.fiscalResponsibilities") ? f("fiscal-err") : undefined}
                    onChange={(ev) => toggleResponsibility(v, ev.target.checked)} />
                  {FISCAL_LABELS[v]}
                </label>
              ))}
            </div>
            {e("contact.fiscalResponsibilities") && <p id={f("fiscal-err")} className="mt-1 text-sm text-brand-700">{e("contact.fiscalResponsibilities")}</p>}
          </fieldset>
          <div className="sm:col-span-2">
            <label htmlFor={f("rut")} className="block text-sm font-semibold">Adjuntar RUT (opcional)</label>
            <input id={f("rut")} ref={rutInputRef} type="file" accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png" className="mt-1 block w-full text-sm"
              aria-invalid={!!state.rutError} aria-describedby={state.rutError ? f("rut-err") : f("rut-hint")}
              onChange={(ev) => void onRutChange(ev.currentTarget)} />
            {state.rutFile && (
              <p className="mt-1 text-sm">
                Adjunto: <strong>{state.rutFile.fileName}</strong> ({formatSize(state.rutFile.sizeBytes)}){" "}
                <button type="button" className="font-semibold text-brand-700 underline" onClick={() => { if (rutInputRef.current) rutInputRef.current.value = ""; dispatch({ type: "rut", file: null, error: "" }); }}>Quitar</button>
              </p>
            )}
            {state.rutError ? (
              <p id={f("rut-err")} role="alert" className="mt-1 text-sm text-brand-700">{state.rutError}</p>
            ) : (
              <p id={f("rut-hint")} className="mt-1 text-xs text-steel-600">PDF, JPG o PNG, hasta 5 MB. Se usa solo para facturar y crear tu registro como cliente.</p>
            )}
          </div>
          <Field id={f("email")} label="Correo" error={e("contact.email")}>
            <input id={f("email")} type="email" className={inputCls} autoComplete="email" value={state.contact.email} aria-invalid={!!e("contact.email")} aria-describedby={describedBy(f("email"), !!e("contact.email"))}
              onChange={(ev) => dispatch({ type: "contact", patch: { email: ev.target.value } })} />
          </Field>
          <Field id={f("phone")} label="Celular / WhatsApp" error={e("contact.phone")} hint="Con indicativo de país si es posible. Ej.: 57 300 000 0000">
            <input id={f("phone")} type="tel" className={inputCls} autoComplete="tel" value={state.contact.phone} aria-invalid={!!e("contact.phone")} aria-describedby={describedBy(f("phone"), !!e("contact.phone"), true)}
              onChange={(ev) => dispatch({ type: "contact", patch: { phone: ev.target.value } })} />
          </Field>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1 h-4 w-4" checked={state.contact.acceptsDataPolicy} aria-invalid={!!e("contact.acceptsDataPolicy")} aria-describedby={e("contact.acceptsDataPolicy") ? f("consent-err") : undefined}
                onChange={(ev) => dispatch({ type: "contact", patch: { acceptsDataPolicy: ev.target.checked } })} />
              <span>
                He leído la{" "}
                <a href="/privacidad/" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">política de tratamiento de datos personales</a>{" "}
                y autorizo el tratamiento de mis datos para gestionar esta cotización.
              </span>
            </label>
            {e("contact.acceptsDataPolicy") && <p id={f("consent-err")} className="mt-1 text-sm text-brand-700">{e("contact.acceptsDataPolicy")}</p>}
          </div>
          {/* Honeypot: hidden from users and assistive tech, bots fill it. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>No llenar<input tabIndex={-1} autoComplete="off" value={state.honeypot} onChange={(ev) => dispatch({ type: "honeypot", value: ev.target.value })} /></label>
          </div>
        </div>
      )}

      {/* Step 4: summary + JSON */}
      {state.step === 3 && (
        <div className="space-y-4">
          <ul className="list-disc space-y-1 pl-5">
            {state.items.map((it, i) => (
              <li key={i}>
                {(it.productSlug && productBySlug(it.productSlug)?.name) || CATEGORIES.find((c) => c.id === it.category)?.label} × {it.quantity}
                {it.widthMm && it.heightMm && it.depthMm ? ` (${it.widthMm}×${it.heightMm}×${it.depthMm} mm)` : ""}
              </li>
            ))}
          </ul>
          <p>Entrega en <strong>{state.project.city}</strong>{state.project.neededBy ? ` para el ${state.project.neededBy}` : ""}.</p>
          <p>
            {c.personType ? PERSON_LABELS[c.personType] : ""}: {juridica && c.businessName ? `${c.businessName} · ` : ""}{c.fullName} · {juridica ? `NIT ${c.taxId}${c.taxIdCheckDigit ? `-${c.taxIdCheckDigit}` : ""}` : `CC ${c.taxId}`} · {c.email}
          </p>
          <p>CIIU {c.ciiuCode} · {(c.fiscalResponsibilities ?? []).map((v) => FISCAL_LABELS[v]).join(", ")}</p>
          <p>{state.rutFile ? `RUT adjunto: ${state.rutFile.fileName} (${formatSize(state.rutFile.sizeBytes)})` : "Sin RUT adjunto."}</p>
          <details>
            <summary className="cursor-pointer text-sm font-semibold">Ver resumen en JSON</summary>
            <pre className="mt-2 max-h-72 overflow-auto rounded bg-steel-50 p-3 text-xs">{preview.success ? JSON.stringify({ ...preview.data, website: undefined, rutFile: preview.data.rutFile ? { ...preview.data.rutFile, contentBase64: "[omitido en esta vista]" } : undefined }, null, 2) : "Hay campos por corregir en pasos anteriores."}</pre>
          </details>
          {submit.kind === "error" && (
            <div role="alert" className="rounded bg-brand-50 p-3 text-sm text-brand-700">
              {submit.message}{" "}
              {submit.fallbackUrl ? <a className="font-semibold underline" href={submit.fallbackUrl} target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a> : "Intenta de nuevo o llámanos."}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-between gap-3">
        <button type="button" onClick={() => go(state.step - 1)} disabled={state.step === 0 || submit.kind === "sending"} className="rounded border border-steel-200 px-4 py-2 font-semibold disabled:invisible">
          Atrás
        </button>
        <button type="submit" disabled={submit.kind === "sending" || (state.step === 2 && !state.contact.acceptsDataPolicy)} className="rounded bg-brand-600 px-6 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {state.step === 3 ? (submit.kind === "sending" ? "Enviando…" : "Enviar solicitud") : "Siguiente"}
        </button>
      </div>
    </form>
  );
}
