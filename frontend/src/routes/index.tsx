import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { getIngredientIcon } from "@/lib/menu-data";
import { listarAcompanhamentosAtivos } from "@/lib/api/cardapio";
import logo from "@/assets/yuenmin-logo.png";
import { Clock, Leaf, Truck, Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YuWebMin · Restaurante Vegetariano Yuen Min" },
      {
        name: "description",
        content:
          "Peça online no Yuen Min — restaurante vegetariano com marmitas frescas, entrega rápida e programa de fidelidade.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const pratosQuery = useQuery({
    queryKey: ["acompanhamentos-ativos"],
    queryFn: () => listarAcompanhamentosAtivos(),
  });
  const destaques = (pratosQuery.data ?? []).slice(0, 3);
  return (
    <SiteLayout>
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/70 text-primary text-xs font-semibold tracking-wide uppercase border border-primary/20">
              <Leaf className="h-3.5 w-3.5" /> 100% Vegetariano
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Sabor oriental, <span className="text-primary">feito com afeto.</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Marmitas frescas, pratos asiáticos e ingredientes selecionados. Peça pelo YuWebMin e
              receba quentinho na sua porta.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-6 shadow-[var(--shadow-warm)]">
                <Link to="/pedido">Fazer pedido</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <Link to="/cardapio">Ver cardápio</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Ter–Sáb · 11h
              </span>
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Delivery rápido
              </span>
            </div>
          </div>
          <div className="relative">
            <div
              className="absolute inset-0 -z-10 blur-3xl opacity-50"
              style={{ background: "var(--gradient-warm)" }}
            />
            <img
              src={logo}
              alt="Yuen Min"
              className="rounded-3xl w-full max-w-md mx-auto shadow-[var(--shadow-warm)]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Leaf,
              title: "Ingredientes frescos",
              text: "Selecionamos vegetais e temperos diariamente.",
            },
            {
              icon: Heart,
              title: "Programa fidelidade",
              text: "Acumule pontos a cada pedido e ganhe brindes.",
            },
            {
              icon: Truck,
              title: "Entrega no bairro",
              text: "Delivery próprio em Florestal e região.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-card border border-border p-6 shadow-[var(--shadow-soft)]"
            >
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Cardápio de hoje</h2>
            <p className="text-muted-foreground">Os destaques mais pedidos da casa.</p>
          </div>
          <Link to="/cardapio" className="text-primary font-medium text-sm hover:underline">
            Ver tudo →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {destaques.map((d) => (
            <Link
              key={d.id}
              to="/cardapio"
              className="group rounded-2xl bg-card border border-border p-5 hover:shadow-[var(--shadow-warm)] transition-shadow"
            >
              <div className="text-5xl mb-3">{getIngredientIcon(d)}</div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">{d.nome}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{d.descricao}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div
          className="rounded-3xl p-8 md:p-12 text-center"
          style={{ background: "var(--gradient-warm)" }}
        >
          <h2 className="text-2xl md:text-3xl font-bold">Pronto para pedir?</h2>
          <p className="mt-2 text-foreground/70">Monte sua marmita do jeitinho que você gosta.</p>
          <Button asChild size="lg" className="mt-5 rounded-full px-8">
            <Link to="/pedido">Criar pedido agora</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
