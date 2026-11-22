"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import "./zapols.css";
import {
  isSupabaseConfigured,
  saveOrderToSupabase,
  fetchOrdersFromSupabase,
  updateOrderStatusInSupabase,
  deleteOrderFromSupabase,
  supabase,
} from "./lib/supabase";

/* Zapols Restaurant & Lounge: WhatsApp ordering with pickup-code handover & Supabase sync.
   Mobile-first, responsive, with real-time kitchen verification. */

export type Item = { id: string; name: string; price: number; category: string; desc?: string; available: boolean };
export type Settings = { vendorName: string; vendorPhone: string; bankInfo: string; staffPin: string };
export type Status = "pending" | "packed" | "delivered";
export type Ticket = {
  id: string;
  customer: string;
  summary: string;
  notes: string;
  total: number;
  payment: string;
  time: string;
  code: string;
  status: Status;
};
export type Entry = {
  id: string;
  date: string;
  summaryText: string;
  total: number;
  cart: Record<string, number>;
  packaging: Pack;
  payment: string;
  name: string;
  loc: string;
  notes: string;
  code: string;
};
export type Pack = "takeaway" | "eatin";

const PACK_FEE = 300;
const SERVICE_FEE = 100;
const PAYMENTS = ["Transfer on delivery", "Paid via transfer", "Cash"];
const DEFAULT_SETTINGS: Settings = {
  vendorName: "Zapols Restaurant & Lounge",
  vendorPhone: "2348000000000",
  bankInfo: "",
  staffPin: "1234",
};

const m = (id: string, name: string, price: number, category: string, desc = ""): Item => ({
  id,
  name,
  price,
  category,
  desc,
  available: true,
});

const DEFAULT_MENU: Item[] = [
  m("r1", "Jollof Rice", 1000, "Rice", "Smoky party jollof"),
  m("r2", "White Rice", 1000, "Rice", "Steamed white rice"),
  m("s1", "Coleslaw", 500, "Sides", "Cabbage and carrot"),
  m("s2", "Fried Plantain", 500, "Sides", "Golden dodo, per portion"),
  m("s3", "Beans", 500, "Sides", "Seasoned beans"),
  m("o1", "Egusi Soup", 700, "Soups", "Melon seed soup"),
  m("o2", "Vegetable Soup", 1000, "Soups", "Leafy green soup"),
  m("o3", "Afang Soup", 1000, "Soups", "Calabar afang"),
  m("o4", "Bitterleaf Soup", 700, "Soups", "Washed bitterleaf"),
  m("o5", "Okra Soup", 700, "Soups", "Fresh draw okra"),
  m("o6", "White Soup", 2000, "Soups", "Ofe nsala"),
  m("o7", "Fisherman Soup", 12000, "Soups", "Loaded seafood native soup"),
  m("w1", "Pounded Yam", 800, "Swallows", "Per piece"),
  m("w2", "Garri (Eba)", 500, "Swallows", "Per piece"),
  m("w3", "Semolina", 500, "Swallows", "Per piece"),
  m("w4", "Fufu", 500, "Swallows", "Per piece"),
  m("p1", "Goat Meat", 700, "Proteins", "Peppered, per piece"),
  m("p2", "Beef", 500, "Proteins", "Stewed, per piece"),
  m("p3", "Pomo (Cow Skin)", 500, "Proteins", "Spiced, per piece"),
  m("p4", "Titus Fish", 1500, "Proteins", "Fried or stewed, per piece"),
  m("p5", "Boiled Egg", 300, "Proteins", "Whole egg"),
  m("x1", "Bottled Water", 250, "Extras", "Chilled 75cl"),
];

/* ---------- Helpers ---------- */
function useStored<T>(key: string, fallback: T) {
  const [v, setV] = useState<T>(fallback);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const r = localStorage.getItem(key);
      if (r) setV(JSON.parse(r) as T);
    } catch {
      /* storage unavailable */
    }
    loaded.current = true;
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* storage unavailable */
    }
  }, [key, v]);

  return [v, setV] as const;
}

const naira = (n: number) => "₦" + Number(n || 0).toLocaleString("en-NG");
const clock = () => new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
const newOrderId = () =>
  `ZPL-${Math.floor(100 + Math.random() * 900)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
const newCode = () => String(Math.floor(1000 + Math.random() * 9000));
const cleanCode = (str: string) => (str || "").replace(/\D/g, "").trim();

/* ---------- Mobile Sheet Component ---------- */
function Sheet({
  title,
  sub,
  onClose,
  children,
}: {
  title: string;
  sub?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="zp-backdrop" onClick={onClose}>
      <div role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()} className="zp-sheet">
        <div className="zp-sheet-handle" />
        <div className="zp-sheet-head">
          <div>
            <h2>{title}</h2>
            {sub && <p>{sub}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="zp-x">
            ×
          </button>
        </div>
        <div className="zp-sheet-body">{children}</div>
      </div>
    </div>
  );
}

const B = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

/* ---------- Main Component ---------- */
export default function ZapolsOrdering() {
  const [settings, setSettings] = useStored<Settings>("zapols_settings_v4", DEFAULT_SETTINGS);
  const [menu, setMenu] = useStored<Item[]>("zapols_menu_v4", DEFAULT_MENU);
  const [history, setHistory] = useStored<Entry[]>("zapols_history_v4", []);
  const [tickets, setTickets] = useStored<Ticket[]>("zapols_tickets_v4", []);
  const [profile, setProfile] = useStored<{ name: string; loc: string }>("zapols_profile_v4", { name: "", loc: "" });

  const [cart, setCart] = useState<Record<string, number>>({});
  const [pack, setPack] = useState<Pack>("takeaway");
  const [pay, setPay] = useState(PAYMENTS[0]);
  const [name, setName] = useState("");
  const [loc, setLoc] = useState("");
  const [notes, setNotes] = useState("");
  const [orderId, setOrderId] = useState(newOrderId);
  const [code, setCode] = useState(newCode);
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");

  const [activePlacedOrder, setActivePlacedOrder] = useState<Ticket | null>(null);
  const [view, setView] = useState<"customer" | "kitchen">("customer");
  const [staff, setStaff] = useState(false);
  const [modal, setModal] = useState<null | "settings" | "pin" | "history" | "confirmed">(null);
  const [pin, setPin] = useState("");
  const [toast, setToast] = useState<{ text: string; error: boolean } | null>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, boolean>>({});

  const taps = useRef({ n: 0, t: 0 as ReturnType<typeof setTimeout> | 0 });
  const checkoutRef = useRef<HTMLElement>(null);

  // Sync profile when loaded from localStorage
  useEffect(() => {
    if (profile.name && !name) setName(profile.name);
    if (profile.loc && !loc) setLoc(profile.loc);
  }, [profile]);

  // Check staff auth on client
  useEffect(() => {
    try {
      const isStaff =
        sessionStorage.getItem("zapols_staff") === "1" ||
        new URLSearchParams(window.location.search).get("vendor") === "1";
      if (isStaff) setStaff(true);
    } catch { }
  }, []);

  // Supabase Initial Fetch and Realtime Subscription
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Load initial orders from Supabase
    fetchOrdersFromSupabase().then((dbOrders) => {
      if (dbOrders && dbOrders.length > 0) {
        setTickets((prev) => {
          const map = new Map(prev.map((t) => [t.id, t]));
          dbOrders.forEach((o) => {
            map.set(o.order_id, {
              id: o.order_id,
              customer: `${o.customer_name} — ${o.customer_location}`,
              summary: o.summary,
              notes: o.notes || "",
              total: Number(o.total),
              payment: o.payment_method,
              time: o.created_at ? new Date(o.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : clock(),
              code: o.pickup_code,
              status: o.status,
            });
          });
          return Array.from(map.values()).sort((a, b) => (b.id > a.id ? 1 : -1));
        });
      }
    });

    // Real-time channel subscription
    const channel = supabase
      .channel("public:orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const o = payload.new as any;
          if (!o) return;
          const newTicket: Ticket = {
            id: o.order_id,
            customer: `${o.customer_name} — ${o.customer_location}`,
            summary: o.summary,
            notes: o.notes || "",
            total: Number(o.total),
            payment: o.payment_method,
            time: clock(),
            code: o.pickup_code,
            status: o.status,
          };
          setTickets((prev) => [newTicket, ...prev.filter((t) => t.id !== newTicket.id)]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const o = payload.new as any;
          if (!o) return;
          setTickets((prev) =>
            prev.map((t) => (t.id === o.order_id ? { ...t, status: o.status } : t))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "orders" },
        (payload) => {
          const o = payload.old as any;
          if (o && o.order_id) {
            setTickets((prev) => prev.filter((t) => t.id !== o.order_id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  const say = (text: string, error = false) => {
    setToast({ text, error });
    setTimeout(() => setToast(null), 3200);
  };

  /* Totals */
  const lines = useMemo(
    () => menu.filter((i) => cart[i.id]).map((i) => ({ ...i, qty: cart[i.id], line: cart[i.id] * i.price })),
    [menu, cart]
  );
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.line, 0);
  const packFee = count && pack === "takeaway" ? PACK_FEE : 0;
  const service = count ? SERVICE_FEE : 0;
  const total = subtotal + packFee + service;

  const categories = ["All", ...Array.from(new Set(menu.map((i) => i.category)))];
  const shown = menu.filter(
    (i) =>
      (cat === "All" || i.category === cat) &&
      (!query.trim() || `${i.name} ${i.desc || ""}`.toLowerCase().includes(query.trim().toLowerCase()))
  );
  const grouped = shown.reduce<Record<string, Item[]>>((a, i) => ((a[i.category] ||= []).push(i), a), {});

  const ticketText = (targetId = orderId, targetCode = code) => {
    const itemLines = lines.length
      ? lines.map((l) => `• ${l.qty}x ${l.name} — ${naira(l.line)}`).join("\n")
      : "• (No items selected yet)";
    const extras = count
      ? `\n• ${pack === "takeaway" ? `Takeaway pack — ${naira(PACK_FEE)}` : "Own plate / eat-in — ₦0"}\n• Service charge — ${naira(SERVICE_FEE)}`
      : "";
    return [
      `*🍽️ New order — ${settings.vendorName}*`,
      `*Order ID:* #${targetId} (${clock()})`,
      `*Customer:* ${name.trim() || "[Your name]"}`,
      `*Location/Time:* ${loc.trim() || "[Floor / desk / time]"}`,
      `*Pickup code:* ${targetCode} (give this only to the person collecting)`,
      "------------------------------",
      `*Items:*\n${itemLines}${extras}`,
      "------------------------------",
      `*TOTAL:* ${naira(total)}`,
      `*Payment:* ${pay}`,
      notes.trim() && `*Prep note:* ${notes.trim()}`,
      settings.bankInfo && pay.includes("transfer") ? `*Account:* ${settings.bankInfo}` : "",
      `_Please confirm receipt of #${targetId}_`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const adjust = (id: string, d: number) =>
    setCart((c) => {
      const n = Math.max(0, (c[id] || 0) + d);
      const { [id]: _drop, ...rest } = c;
      return n ? { ...rest, [id]: n } : rest;
    });

  const send = async () => {
    if (!count) return say("Add at least one item to your plate first.", true);
    if (!name.trim() || !loc.trim()) {
      checkoutRef.current?.scrollIntoView({ behavior: "smooth" });
      return say("Enter your name and floor or pickup time.", true);
    }

    const currentOrderId = orderId;
    const currentCode = code;
    const text = ticketText(currentOrderId, currentCode);
    const summary = [
      ...lines.map((l) => `${l.qty}x ${l.name}`),
      pack === "takeaway" ? `Takeaway pack (₦${PACK_FEE})` : "",
      `Service charge (₦${SERVICE_FEE})`,
    ]
      .filter(Boolean)
      .join(", ");

    setProfile({ name: name.trim(), loc: loc.trim() });

    const newTicket: Ticket = {
      id: currentOrderId,
      customer: `${name.trim()} — ${loc.trim()}`,
      summary,
      notes: notes.trim(),
      total,
      payment: pay,
      time: clock(),
      code: currentCode,
      status: "pending",
    };

    // Save to local history
    setHistory((h) => [
      {
        id: currentOrderId,
        date: new Date().toLocaleString("en-NG", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        summaryText: summary,
        total,
        cart,
        packaging: pack,
        payment: pay,
        name: name.trim(),
        loc: loc.trim(),
        notes: notes.trim(),
        code: currentCode,
      },
      ...h,
    ].slice(0, 30));

    // Add to tickets for kitchen
    setTickets((t) => [newTicket, ...t]);

    // Save to Supabase DB if configured
    if (isSupabaseConfigured) {
      saveOrderToSupabase({
        order_id: currentOrderId,
        customer_name: name.trim(),
        customer_location: loc.trim(),
        summary,
        notes: notes.trim(),
        total,
        payment_method: pay,
        packaging: pack,
        pickup_code: currentCode,
        status: "pending",
        items_json: lines.map((l) => ({ id: l.id, name: l.name, qty: l.qty, price: l.price })),
      }).then((ok) => {
        if (ok) say("Order saved to database & sent!");
      });
    }

    // Set as active placed order to show confirmation sheet
    setActivePlacedOrder(newTicket);
    setModal("confirmed");

    // Launch WhatsApp
    const waUrl = `https://wa.me/${settings.vendorPhone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");

    say(`Order sent! Pickup code: ${currentCode}`);
  };

  const startNewOrder = () => {
    setCart({});
    setOrderId(newOrderId());
    setCode(newCode());
    setNotes("");
    setModal(null);
  };

  const copyTicket = async () => {
    try {
      await navigator.clipboard.writeText(ticketText());
      say("Ticket copied! Paste it in WhatsApp.");
    } catch {
      say("Could not copy. Select the ticket text manually.", true);
    }
  };

  const copyActiveCode = async (c: string) => {
    try {
      await navigator.clipboard.writeText(c);
      say(`Pickup code ${c} copied!`);
    } catch {
      say(`Code is: ${c}`);
    }
  };

  const reorder = (e: Entry) => {
    setCart(e.cart);
    setPack(e.packaging);
    setPay(e.payment);
    setName(e.name);
    setLoc(e.loc);
    setNotes(e.notes);
    setOrderId(newOrderId());
    setCode(newCode());
    setModal(null);
    say("Past order loaded. Check it and send.");
    setTimeout(() => checkoutRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  /* Staff Unlock: Tap the logo 5 times */
  const tapLogo = () => {
    if (taps.current.t) clearTimeout(taps.current.t);
    taps.current.n += 1;
    taps.current.t = setTimeout(() => (taps.current.n = 0), 1500);
    if (taps.current.n >= 5) {
      taps.current.n = 0;
      staff ? say("Staff controls are already on.") : (setPin(""), setModal("pin"));
    }
  };

  const unlock = () => {
    if (pin.trim() === (settings.staffPin || "1234")) {
      try {
        sessionStorage.setItem("zapols_staff", "1");
      } catch { }
      setStaff(true);
      setModal(null);
      say("Staff controls on.");
    } else {
      say("Wrong PIN.", true);
      setPin("");
    }
  };

  const lock = () => {
    try {
      sessionStorage.removeItem("zapols_staff");
    } catch { }
    setStaff(false);
    setView("customer");
  };

  /* Kitchen Actions */
  const setStatus = async (id: string, status: Status) => {
    setTickets((t) => t.map((x) => (x.id === id ? { ...x, status } : x)));
    if (isSupabaseConfigured) {
      updateOrderStatusInSupabase(id, status);
    }
  };

  const removeTicket = async (id: string) => {
    setTickets((x) => x.filter((y) => y.id !== id));
    if (isSupabaseConfigured) {
      deleteOrderFromSupabase(id);
    }
  };

  const [paste, setPaste] = useState("");
  const [codeIn, setCodeIn] = useState<Record<string, string>>({});

  const pin_ = (re: RegExp) => paste.match(re)?.[1]?.trim() ?? "";

  const extractCode = (str: string) => {
    const m =
      str.match(/(?:pickup\s*code|code)\*?[:\s-]*\*?(\d{4})/i) ||
      str.match(/pickup\s*code[^\d]*(\d{4})/i) ||
      str.match(/\b(\d{4})\b/);
    return m ? m[1] : "";
  };

  const pinTicket = () => {
    if (!paste.trim()) return say("Paste a WhatsApp order first.", true);
    const items = paste
      .split("\n")
      .filter((l) => l.trim().startsWith("•"))
      .map((l) => l.replace(/^•\s*/, "").trim());

    const extractedPickupCode = extractCode(paste);
    const extractedId = (paste.match(/#([A-Z0-9-]+)/i)?.[1] || newOrderId()).toUpperCase();

    const t: Ticket = {
      id: extractedId,
      customer: `${pin_(/Customer:\*?\s*(.+)/i) || "Walk-in"}${pin_(/Location\/Time:\*?\s*(.+)/i) ? " — " + pin_(/Location\/Time:\*?\s*(.+)/i) : ""
        }`,
      summary: items.length ? items.join(", ") : paste.trim(),
      notes: pin_(/Prep note:\*?\s*(.+)/i),
      total: parseInt((pin_(/TOTAL:\*?\s*₦?([\d,]+)/i) || "0").replace(/,/g, ""), 10),
      payment: pin_(/Payment:\*?\s*(.+)/i) || "Pending",
      time: clock(),
      code: extractedPickupCode,
      status: "pending",
    };

    setTickets((x) => [t, ...x]);
    setPaste("");
    say(`Order #${t.id} pinned.`);

    if (isSupabaseConfigured) {
      saveOrderToSupabase({
        order_id: t.id,
        customer_name: t.customer,
        customer_location: "",
        summary: t.summary,
        notes: t.notes,
        total: t.total,
        payment_method: t.payment,
        packaging: "takeaway",
        pickup_code: t.code,
        status: "pending",
      });
    }
  };

  const handOver = (t: Ticket) => {
    const entered = cleanCode(codeIn[t.id]);
    const expected = cleanCode(t.code);

    if (expected) {
      if (!entered) {
        return say("Enter the 4-digit customer pickup code.", true);
      }
      if (entered !== expected) {
        return say(`Wrong code! Customer gave ${entered}, does not match order #${t.id}.`, true);
      }
    }
    setStatus(t.id, "delivered");
    say(`Order #${t.id} verified and handed over!`);
  };

  /* Settings */
  const [draft, setDraft] = useState(settings);
  const [nu, setNu] = useState({ name: "", price: "", category: "Rice" });
  const openSettings = () => {
    setDraft(settings);
    setModal("settings");
  };
  const addItem = () => {
    const price = parseInt(nu.price, 10);
    if (!nu.name.trim() || !(price > 0)) return say("Enter an item name and a price in naira.", true);
    setMenu((x) => [...x, m("c" + Date.now(), nu.name.trim(), price, nu.category)]);
    setNu({ ...nu, name: "", price: "" });
    say(`${nu.name.trim()} added.`);
  };

  const openCount = tickets.filter((t) => t.status !== "delivered").length;

  return (
    <div className="zp-app">
      {toast && (
        <div role="status" className={B("zp-toast", toast.error && "is-error")}>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <header className="zp-header">
        <div className="zp-header-in">
          <button onClick={tapLogo} className="zp-brand" aria-label={settings.vendorName}>
            <img src="/logo.png" alt="" className="zp-brand-logo" />
            <span className="zp-brand-text">
              <span className="zp-brand-name">{settings.vendorName}</span>
              <span className="zp-brand-sub">Office meals · WhatsApp ticketing</span>
            </span>
          </button>
          <div className="zp-actions">
            <button onClick={() => setModal("history")} className="zp-btn zp-btn-line" aria-label="My orders">
              Orders
              {history.length > 0 && <span className="zp-count">{history.length}</span>}
            </button>
            {staff && (
              <>
                <button
                  onClick={() => setView(view === "customer" ? "kitchen" : "customer")}
                  className="zp-btn zp-btn-dark"
                >
                  {view === "customer" ? `Kitchen (${openCount})` : "Menu"}
                </button>
                <button onClick={openSettings} className="zp-btn zp-btn-line" aria-label="Settings">
                  ⚙
                </button>
                <button onClick={lock} className="zp-btn zp-btn-line" aria-label="Lock staff controls">
                  Lock
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      {view === "customer" ? (
        <main className="zp-main">
          {/* Active Order Banner if order was placed */}
          {activePlacedOrder && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                borderRadius: "14px",
                background: "#0b3b2e",
                color: "#fff",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: "0.95rem" }}>
                  Active Order #{activePlacedOrder.id}
                </p>
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.8rem", color: "#f2c230" }}>
                  Pickup Code: <b>{activePlacedOrder.code}</b>
                </p>
              </div>
              <button
                onClick={() => setModal("confirmed")}
                className="zp-btn zp-btn-wa"
                style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem", minHeight: "36px" }}
              >
                Show Code
              </button>
            </div>
          )}

          <p className="zp-intro">
            Build your meal plate, enter your floor or desk, and tap send. Every order receives a secure 4-digit pickup code
            for the kitchen handover.
          </p>

          {/* Sticky Filters & Search */}
          <div className="zp-filters">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jollof, soup, swallow, plantain…"
              className="zp-field"
              style={{ margin: 0 }}
              aria-label="Search the menu"
            />
            <div className="zp-pills">
              {categories.map((c) => (
                <button key={c} onClick={() => setCat(c)} className={B("zp-pill", cat === c && "on")}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          {Object.keys(grouped).length === 0 && (
            <p className="zp-empty">No menu items match your search. Try another category or keyword.</p>
          )}

          {Object.entries(grouped).map(([c, items]) => (
            <section key={c} className="zp-section">
              <h2 className="zp-section-title">{c}</h2>
              <ul className="zp-grid">
                {items.map((i) => {
                  const q = cart[i.id] || 0;
                  return (
                    <li key={i.id} className={B("zp-item", q > 0 && "on", !i.available && "off")}>
                      <div className="zp-item-main">
                        <p className="zp-item-name">{i.name}</p>
                        {i.desc && <p className="zp-item-desc">{i.desc}</p>}
                        <p className="zp-price">{naira(i.price)}</p>
                      </div>
                      <div className="zp-item-act">
                        {!i.available ? (
                          <span className="zp-soldout">Sold out</span>
                        ) : q === 0 ? (
                          <button
                            onClick={() => adjust(i.id, 1)}
                            className="zp-btn zp-btn-line"
                            style={{ minWidth: "4.5rem", minHeight: "40px" }}
                          >
                            Add
                          </button>
                        ) : (
                          <div className="zp-stepper">
                            <button onClick={() => adjust(i.id, -1)} aria-label={`Remove one ${i.name}`}>
                              −
                            </button>
                            <span>{q}</span>
                            <button onClick={() => adjust(i.id, 1)} aria-label={`Add one ${i.name}`}>
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          {/* Details & Delivery Card */}
          <section ref={checkoutRef} className="zp-card">
            <div className="zp-card-head">
              <h2 className="zp-card-title">Your Details</h2>
              <button
                onClick={() => {
                  setCart({});
                  say("Plate cleared.");
                }}
                className="zp-link-danger"
              >
                Clear plate
              </button>
            </div>
            <div className="zp-two">
              <label className="zp-label">
                Your name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tunde (Accounts)"
                  className="zp-field"
                />
              </label>
              <label className="zp-label">
                Floor, desk or pickup time
                <input
                  value={loc}
                  onChange={(e) => setLoc(e.target.value)}
                  placeholder="e.g. 3rd Floor IT, 1:15 PM"
                  className="zp-field"
                />
              </label>
            </div>
            <label className="zp-label">
              Prep note (optional)
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Extra pepper, fish fried crisp"
                className="zp-field"
              />
            </label>
            <fieldset className="zp-fieldset">
              <legend className="zp-legend">Packaging</legend>
              <div className="zp-choices">
                {(
                  [
                    ["takeaway", "Takeaway pack", `+${naira(PACK_FEE)}`],
                    ["eatin", "Own plate or eat-in", "₦0"],
                  ] as const
                ).map(([k, l, p]) => (
                  <button
                    key={k}
                    onClick={() => setPack(k)}
                    aria-pressed={pack === k}
                    className={B("zp-choice", pack === k && "on")}
                  >
                    {l}
                    <small>{p}</small>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="zp-fieldset">
              <legend className="zp-legend">Payment</legend>
              <div className="zp-choices three">
                {PAYMENTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPay(p)}
                    aria-pressed={pay === p}
                    className={B("zp-choice", pay === p && "on")}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </fieldset>
          </section>

          {/* Ticket Breakdown Card */}
          <section className="zp-ticket">
            <div className="zp-ticket-head">
              <h2 className="zp-ticket-title">Order Ticket #{orderId}</h2>
              <button
                onClick={() => {
                  setOrderId(newOrderId());
                  setCode(newCode());
                }}
                className="zp-chip"
              >
                New code
              </button>
            </div>
            <div className="zp-codebox">
              <span>Pickup code</span>
              <span className="zp-code">{code}</span>
            </div>
            <dl className="zp-lines">
              <div>
                <dt>Food subtotal</dt>
                <dd>{naira(subtotal)}</dd>
              </div>
              <div>
                <dt>{pack === "takeaway" ? "Takeaway pack" : "Own plate"}</dt>
                <dd>{naira(packFee)}</dd>
              </div>
              <div>
                <dt>Service charge</dt>
                <dd>{naira(service)}</dd>
              </div>
              <div className="zp-total">
                <dt>Total</dt>
                <dd>{naira(total)}</dd>
              </div>
            </dl>
            <pre className="zp-pre">{ticketText()}</pre>
            <div className="zp-ticket-actions">
              <button onClick={send} className="zp-btn zp-btn-wa zp-btn-lg zp-btn-block">
                Send Order on WhatsApp
              </button>
              <button onClick={copyTicket} className="zp-btn zp-btn-ghost zp-btn-block">
                Copy Ticket Text
              </button>
            </div>
          </section>
        </main>
      ) : (
        /* Kitchen Board View */
        <main className="zp-main">
          <div className="zp-board-head">
            <h2>Kitchen Order Board</h2>
            <p>
              {openCount} active orders. Prepare food, mark ready, and verify the 4-digit code before handing over.
            </p>
            <span className={B("zp-sync-badge", isSupabaseConfigured && "online")}>
              {isSupabaseConfigured ? "🟢 Supabase Database Synced" : "🟡 Local Mode (Supabase not configured)"}
            </span>
          </div>

          <section className="zp-card">
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              rows={3}
              placeholder="Paste incoming WhatsApp message here to pin it to board..."
              className="zp-field zp-field-mono"
              aria-label="Paste WhatsApp order"
            />
            <button onClick={pinTicket} className="zp-btn zp-btn-dark">
              Pin to Board
            </button>
          </section>

          {tickets.length === 0 && (
            <p className="zp-empty">No active tickets. Orders placed from customer devices appear here automatically.</p>
          )}

          {tickets.map((t) => (
            <article key={t.id} className={B("zp-tk", t.status === "delivered" && "done")}>
              <div className="zp-tk-head">
                <p className="zp-tk-id">
                  #{t.id}
                  <small>{t.time}</small>
                </p>
                <span className={`zp-badge zp-badge-${t.status}`}>
                  {t.status === "pending" ? "To pack" : t.status === "packed" ? "Ready" : "Handed over"}
                </span>
              </div>
              <div>
                <p className="zp-tk-who">{t.customer}</p>
                <p className="zp-tk-sum">{t.summary}</p>
                {t.notes && <p className="zp-note">Note: {t.notes}</p>}
              </div>
              <p className="zp-tk-pay">
                {naira(t.total)} <span>({t.payment})</span>
              </p>

              {t.status !== "delivered" && (
                <div className="zp-tk-actions">
                  {t.status === "pending" && (
                    <button onClick={() => setStatus(t.id, "packed")} className="zp-btn zp-btn-line">
                      Mark Packed
                    </button>
                  )}
                  {t.code ? (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", width: "100%" }}>
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={codeIn[t.id] || ""}
                        onChange={(e) => setCodeIn({ ...codeIn, [t.id]: e.target.value })}
                        placeholder="Pickup Code"
                        aria-label={`Pickup code for ${t.id}`}
                        className="zp-field zp-field-code"
                      />
                      <button onClick={() => handOver(t)} className="zp-btn zp-btn-dark" style={{ flex: 1 }}>
                        Verify &amp; Hand Over
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handOver(t)} className="zp-btn zp-btn-dark">
                      Mark Handed Over
                    </button>
                  )}

                  {/* Staff Code Peek Helper */}
                  {t.code && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%" }}>
                      <button
                        onClick={() =>
                          setRevealedCodes((prev) => ({ ...prev, [t.id]: !prev[t.id] }))
                        }
                        className="zp-link-danger"
                        style={{ color: "#10231c", fontSize: "0.78rem" }}
                      >
                        {revealedCodes[t.id] ? `Expected Code: ${t.code}` : "Staff peek: view expected code"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => removeTicket(t.id)}
                className="zp-link-danger"
                style={{ justifySelf: "start" }}
              >
                Remove Ticket
              </button>
            </article>
          ))}
        </main>
      )}

      {/* Floating Bottom Bar for Customer */}
      {view === "customer" && (
        <div className="zp-bar">
          <div className="zp-bar-in">
            <div>
              <p className="zp-bar-meta">
                {count} {count === 1 ? "item" : "items"} · #{orderId}
              </p>
              <p className="zp-bar-total">{naira(total)}</p>
            </div>
            <div className="zp-bar-btns">
              <button
                onClick={() => checkoutRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="zp-btn zp-btn-line"
              >
                Review
              </button>
              <button onClick={send} className="zp-btn zp-btn-wa">
                Send Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmed Modal */}
      {modal === "confirmed" && activePlacedOrder && (
        <Sheet
          title="Order Submitted!"
          sub="Show this code to kitchen staff when picking up."
          onClose={() => setModal(null)}
        >
          <div className="zp-confirm-box">
            <div className="zp-confirm-icon">🎉</div>
            <h3 className="zp-confirm-title">Order #{activePlacedOrder.id} Placed</h3>
            <p className="zp-confirm-msg">
              Your order ticket has been prepared and sent. When collecting your food, provide this pickup code:
            </p>

            <div className="zp-confirm-codecard">
              <span className="zp-confirm-label">Your Pickup Code</span>
              <span className="zp-confirm-num">{activePlacedOrder.code}</span>
              <span className="zp-confirm-sub">Show or read this to the kitchen staff</span>
            </div>

            <div style={{ display: "grid", gap: "0.5rem" }}>
              <button
                onClick={() => copyActiveCode(activePlacedOrder.code)}
                className="zp-btn zp-btn-line zp-btn-block"
              >
                📋 Copy Pickup Code
              </button>
              <button
                onClick={() => {
                  const text = ticketText(activePlacedOrder.id, activePlacedOrder.code);
                  const waUrl = `https://wa.me/${settings.vendorPhone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
                  window.open(waUrl, "_blank", "noopener,noreferrer");
                }}
                className="zp-btn zp-btn-wa zp-btn-block"
              >
                💬 Open WhatsApp Again
              </button>
              <button onClick={startNewOrder} className="zp-btn zp-btn-dark zp-btn-block">
                🍽️ Start Another Order
              </button>
            </div>
          </div>
        </Sheet>
      )}

      {/* Staff PIN Modal */}
      {modal === "pin" && (
        <Sheet
          title="Staff Unlock"
          sub="Enter staff PIN to access the kitchen board and settings."
          onClose={() => setModal(null)}
        >
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
            className="zp-field zp-field-pin"
            aria-label="Staff PIN"
          />
          <button onClick={unlock} className="zp-btn zp-btn-dark zp-btn-block">
            Unlock Kitchen
          </button>
        </Sheet>
      )}

      {/* Order History Modal */}
      {modal === "history" && (
        <Sheet title="My Orders" sub="Reorder any past meal plate with one tap." onClose={() => setModal(null)}>
          {history.length === 0 && <p className="zp-empty">No past orders yet. Orders you place will show here.</p>}
          {history.map((e) => (
            <div key={e.id + e.date} className="zp-hist">
              <div className="zp-hist-top">
                <b>#{e.id}</b>
                <span className="zp-hist-code">Code: {e.code || "----"}</span>
                <span>{e.date}</span>
              </div>
              <p>{e.summaryText}</p>
              <div className="zp-hist-foot">
                <span>{naira(e.total)}</span>
                <button onClick={() => reorder(e)} className="zp-btn zp-btn-dark">
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </Sheet>
      )}

      {/* Restaurant Settings Modal */}
      {modal === "settings" && (
        <Sheet title="Restaurant Settings" sub="Configure vendor details and menu." onClose={() => setModal(null)}>
          <div className="zp-two">
            {(
              [
                ["vendorName", "Restaurant Name", "text"],
                ["vendorPhone", "WhatsApp Phone (start with 234)", "tel"],
                ["bankInfo", "Bank Account Info for Transfers", "text"],
                ["staffPin", "Staff PIN (default 1234)", "text"],
              ] as const
            ).map(([k, l, t]) => (
              <label key={k} className="zp-label">
                {l}
                <input
                  type={t}
                  value={draft[k]}
                  onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                  className="zp-field"
                />
              </label>
            ))}
          </div>
          <button
            onClick={() => {
              setSettings({
                ...draft,
                vendorName: draft.vendorName.trim() || DEFAULT_SETTINGS.vendorName,
                staffPin: draft.staffPin.trim() || "1234",
              });
              say("Settings saved.");
            }}
            className="zp-btn zp-btn-dark zp-btn-block"
          >
            Save Settings
          </button>

          {/* Add Item */}
          <div className="zp-divider">
            <h3>Add Menu Item</h3>
            <div className="zp-two" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
              <input
                value={nu.name}
                onChange={(e) => setNu({ ...nu, name: e.target.value })}
                placeholder="Item name (e.g. Asun)"
                className="zp-field"
                style={{ margin: 0 }}
                aria-label="Item name"
              />
              <input
                type="number"
                value={nu.price}
                onChange={(e) => setNu({ ...nu, price: e.target.value })}
                placeholder="Price (₦)"
                className="zp-field"
                style={{ margin: 0 }}
                aria-label="Price"
              />
              <select
                value={nu.category}
                onChange={(e) => setNu({ ...nu, category: e.target.value })}
                className="zp-field"
                style={{ margin: 0 }}
                aria-label="Category"
              >
                {Array.from(new Set(menu.map((i) => i.category))).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <button onClick={addItem} className="zp-btn zp-btn-line zp-btn-block">
              Add Item
            </button>
          </div>

          {/* Stock Availability */}
          <div className="zp-divider">
            <div className="zp-divider-head">
              <h3>Stock Availability</h3>
              <button
                onClick={() => {
                  setMenu(DEFAULT_MENU);
                  say("Menu reset to defaults.");
                }}
                className="zp-link-danger"
              >
                Reset Menu
              </button>
            </div>
            {menu.map((i) => (
              <div key={i.id} className="zp-stock">
                <div>
                  <p>{i.name}</p>
                  <small>
                    {i.category} · {naira(i.price)}
                  </small>
                </div>
                <div className="zp-stock-btns">
                  <button
                    onClick={() =>
                      setMenu((x) => x.map((y) => (y.id === i.id ? { ...y, available: !y.available } : y)))
                    }
                    className={B("zp-stock-state", !i.available && "out")}
                  >
                    {i.available ? "In Stock" : "Sold Out"}
                  </button>
                  <button
                    onClick={() => {
                      setMenu((x) => x.filter((y) => y.id !== i.id));
                      adjust(i.id, -999);
                    }}
                    aria-label={`Delete ${i.name}`}
                    className="zp-del"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}
