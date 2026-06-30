// Lightweight client-side store using localStorage + listeners.
import { useEffect, useState } from "react";
import { MENU, BEVERAGES, EXTRAS } from "./menu-data";

export type Role = "admin" | "cliente";
type User = { name: string; email: string; points: number; role: Role } | null;
type CartItem = { id: string; name: string; price: number; qty: number; emoji: string };
export type SizeKey = "P" | "M" | "G" | "Personalizado";
export type PaymentMethod = "Pix" | "Crédito" | "Débito" | "Dinheiro";
export type OrderStatus = "Aceito" | "Em entrega" | "Concluído" | "Negado";
export type Order = {
  id: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  size: SizeKey;
  paymentMethod?: PaymentMethod;
};

export type CardapioConfig = {
  activeSizes: SizeKey[];
  activeMenuIds: string[];
  activeBeverageIds: string[];
  activeExtraIds: string[];
};

const KEY_USER = "yuwm:user";
const KEY_CART = "yuwm:cart";
const KEY_ORDERS = "yuwm:orders";
const KEY_CARDAPIO = "yuwm:cardapio";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const read = <T,>(k: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k: string, v: unknown) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
  emit();
};

const defaultCardapio = (): CardapioConfig => ({
  activeSizes: ["P", "M", "G", "Personalizado"],
  activeMenuIds: MENU.filter((m) => m.isFixed).map((m) => m.id),
  activeBeverageIds: BEVERAGES.map((b) => b.id),
  activeExtraIds: EXTRAS.map((e) => e.id),
});

export const store = {
  getUser: (): User => read<User>(KEY_USER, null),
  login: (name: string, email: string) => {
    const existing = read<User>(KEY_USER, null);
    const role: Role = email.toLowerCase().includes("admin") ? "admin" : "cliente";
    write(KEY_USER, { name, email, points: existing?.points ?? 120, role });
  },
  logout: () => write(KEY_USER, null),
  isAdmin: (): boolean => read<User>(KEY_USER, null)?.role === "admin",

  getCart: (): CartItem[] => read<CartItem[]>(KEY_CART, []),
  addToCart: (item: Omit<CartItem, "qty">) => {
    const cart = read<CartItem[]>(KEY_CART, []);
    const found = cart.find((c) => c.id === item.id);
    if (found) found.qty += 1;
    else cart.push({ ...item, qty: 1 });
    write(KEY_CART, cart);
  },
  setQty: (id: string, qty: number) => {
    let cart = read<CartItem[]>(KEY_CART, []);
    cart = cart.map((c) => (c.id === id ? { ...c, qty } : c)).filter((c) => c.qty > 0);
    write(KEY_CART, cart);
  },
  clearCart: () => write(KEY_CART, []),

  getOrders: (): Order[] => read<Order[]>(KEY_ORDERS, []),
  setOrderStatus: (id: string, status: OrderStatus) => {
    const orders = read<Order[]>(KEY_ORDERS, []).map((o) => (o.id === id ? { ...o, status } : o));
    write(KEY_ORDERS, orders);
  },
  placeOrder: (size: SizeKey): Order => {
    const cart = read<CartItem[]>(KEY_CART, []);
    const order: Order = {
      id: "PED-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
      createdAt: new Date().toISOString(),
      items: cart,
      total: cart.reduce((s, i) => s + i.price * i.qty, 0),
      status: "Aceito",
      size,
    };
    const orders = [order, ...read<Order[]>(KEY_ORDERS, [])];
    write(KEY_ORDERS, orders);
    write(KEY_CART, []);
    const u = read<User>(KEY_USER, null);
    if (u) write(KEY_USER, { ...u, points: u.points + Math.round(order.total) });
    return order;
  },

  placeCustomOrder: (
    items: CartItem[],
    size: SizeKey,
    portionMultiplier: number,
    paymentMethod?: PaymentMethod
  ): Order => {
    const scaled = items.map((i) => ({
      ...i,
      price: +(i.price * portionMultiplier).toFixed(2),
    }));
    const order: Order = {
      id: "PED-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
      createdAt: new Date().toISOString(),
      items: scaled,
      total: scaled.reduce((s, i) => s + i.price * i.qty, 0),
      status: "Aceito",
      size,
      paymentMethod,
    };
    const orders = [order, ...read<Order[]>(KEY_ORDERS, [])];
    write(KEY_ORDERS, orders);
    const u = read<User>(KEY_USER, null);
    if (u) write(KEY_USER, { ...u, points: u.points + Math.round(order.total) });
    return order;
  },

  getCardapioConfig: (): CardapioConfig => {
    const stored = read<CardapioConfig | null>(KEY_CARDAPIO, null);
    return stored ?? defaultCardapio();
  },
  setCardapioConfig: (cfg: CardapioConfig) => write(KEY_CARDAPIO, cfg),
  resetCardapioConfig: () => write(KEY_CARDAPIO, defaultCardapio()),

  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useStore<T>(selector: () => T): T {
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = store.subscribe(() => force((x) => x + 1));
    return () => { unsub; };
  }, []);
  return selector();
}
