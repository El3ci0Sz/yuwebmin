// Client-side store: sessão de autenticação (via API real) + carrinho local (localStorage).
import { useEffect, useState } from "react";
import { apiFetch, setToken } from "./api/client";
import type { Usuario } from "./api/types";

export type Role = "admin" | "cliente";
export type User = { id: number; name: string; email: string; points: number; role: Role };
type CartItem = { id: string; name: string; price: number; qty: number; emoji: string };

const KEY_USER = "yuwm:user";
const KEY_CART = "yuwm:cart";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const read = <T>(k: string, fallback: T): T => {
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

function toUser(dto: Usuario): User {
  return {
    id: dto.id,
    name: dto.nome,
    email: dto.email,
    points: dto.pontos ?? dto.xpAcumulado,
    role: dto.papel,
  };
}

export const store = {
  getUser: (): User | null => read<User | null>(KEY_USER, null),

  login: async (email: string, senha: string): Promise<User> => {
    const resp = await apiFetch<{ token: string; usuario: Usuario }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
    setToken(resp.token);
    const user = toUser(resp.usuario);
    write(KEY_USER, user);
    return user;
  },

  registrar: async (nome: string, email: string, senha: string): Promise<User> => {
    await apiFetch("/usuarios", {
      method: "POST",
      body: JSON.stringify({ nome, email, senha }),
    });
    return store.login(email, senha);
  },

  logout: () => {
    setToken(null);
    write(KEY_USER, null);
  },

  isAdmin: (): boolean => read<User | null>(KEY_USER, null)?.role === "admin",

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

  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useStore<T>(selector: () => T): T {
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = store.subscribe(() => force((x) => x + 1));
    return () => {
      unsub();
    };
  }, []);
  return selector();
}
