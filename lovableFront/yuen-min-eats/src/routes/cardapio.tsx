import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { MENU, formatBRL, type MenuItem } from "@/lib/menu-data";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/store";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cardapio")({
  head: () => ({
    meta: [
      { title: "Cardápio · YuWebMin" },
      { name: "description", content: "Explore o cardápio vegetariano do Yuen Min: marmitas, pratos asiáticos, entradas e bebidas." },
    ],
  }),
  component: Cardapio,
});

const CATS = ["Todos", "Pratos Principais", "Acompanhamentos", "Entradas", "Bebidas"] as const;

function Cardapio() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("Todos");
  const items = useMemo(
    () => (cat === "Todos" ? MENU : MENU.filter((m) => m.category === cat)),
    [cat],
  );

  function add(item: MenuItem) {
    store.addToCart({ id: item.id, name: item.name, price: item.price, emoji: item.emoji });
    toast.success(`${item.name} adicionado ao pedido`);
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold">Cardápio</h1>
        <p className="text-muted-foreground mt-2">Escolha seus favoritos e monte seu pedido.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                cat === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground/80 border-border hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl bg-card border border-border p-5 flex flex-col shadow-[var(--shadow-soft)]">
              <div className="text-5xl mb-3">{item.emoji}</div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 flex-1">{item.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold text-primary">{formatBRL(item.price)}</span>
                <Button size="sm" onClick={() => add(item)} className="rounded-full">
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/pedido">Ir para o pedido</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
