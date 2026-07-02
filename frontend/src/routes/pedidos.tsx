import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { store, useStore } from "@/lib/store";
import { formatBRL } from "@/lib/menu-data";
import { flattenPedidoItens, listarMeusPedidos } from "@/lib/api/pedidos";
import type { StatusPedido } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Truck, PackageCheck, XCircle, ChefHat } from "lucide-react";

export const Route = createFileRoute("/pedidos")({
  head: () => ({
    meta: [
      { title: "Meus Pedidos · YuWebMin" },
      { name: "description", content: "Acompanhe o status dos seus pedidos no Yuen Min." },
    ],
  }),
  component: PedidosPage,
});

const STATUS_STYLE: Record<StatusPedido, { icon: React.ElementType; cls: string }> = {
  Aceito: { icon: CheckCircle2, cls: "bg-secondary text-primary" },
  Preparando: { icon: ChefHat, cls: "bg-secondary text-primary" },
  "Em entrega": { icon: Truck, cls: "bg-accent/40 text-accent-foreground" },
  Concluído: { icon: PackageCheck, cls: "bg-primary text-primary-foreground" },
  Negado: { icon: XCircle, cls: "bg-destructive/10 text-destructive" },
};

function PedidosPage() {
  const user = useStore(() => store.getUser());
  const query = useQuery({
    queryKey: ["meus-pedidos"],
    queryFn: listarMeusPedidos,
    enabled: !!user,
  });

  if (!user) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Você não está logado</h1>
          <p className="text-muted-foreground mt-2">Entre para ver seus pedidos.</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/login">Entrar</Link>
          </Button>
        </section>
      </SiteLayout>
    );
  }

  const orders = query.data ?? [];

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 pt-10 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold">Meus Pedidos</h1>
        <p className="text-muted-foreground mt-2">Acompanhe seus pedidos e o status de entrega.</p>

        {query.isLoading && (
          <p className="mt-10 text-center text-muted-foreground">Carregando pedidos...</p>
        )}
        {query.isError && (
          <p className="mt-10 text-center text-destructive">
            Não foi possível carregar seus pedidos agora.
          </p>
        )}

        {!query.isLoading && !query.isError && orders.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-card border border-border p-10 text-center">
            <p className="text-muted-foreground">Você ainda não tem pedidos.</p>
            <Button asChild className="mt-4 rounded-full">
              <Link to="/cardapio">Fazer primeiro pedido</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {orders.map((o) => {
              const S = STATUS_STYLE[o.status];
              const linhas = flattenPedidoItens(o);
              return (
                <li
                  key={o.id}
                  className="rounded-2xl bg-card border border-border p-5 shadow-[var(--shadow-soft)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Pedido</div>
                      <div className="font-semibold">#{o.id}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Pagamento: {o.metodoPagamento}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(o.dataPedido).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${S.cls}`}
                    >
                      <S.icon className="h-3.5 w-3.5" /> {o.status}
                    </span>
                  </div>
                  <ul className="mt-4 grid sm:grid-cols-2 gap-2">
                    {linhas.map((i) => (
                      <li
                        key={i.key}
                        className="text-sm flex items-center gap-2 text-muted-foreground"
                      >
                        <span className="text-lg">{i.emoji}</span>
                        <span className="flex-1 truncate">
                          {i.quantidade}× {i.nome}
                          {i.subLabel && <span className="block text-xs">com: {i.subLabel}</span>}
                        </span>
                        <span>{formatBRL(i.precoUnitario * i.quantidade)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-border flex justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-bold text-primary">{formatBRL(o.valorTotal)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </SiteLayout>
  );
}
