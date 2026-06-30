import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { store, useStore, type Order } from "@/lib/store";
import { formatBRL } from "@/lib/menu-data";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Truck, PackageCheck, XCircle } from "lucide-react";

export const Route = createFileRoute("/pedidos")({
  head: () => ({
    meta: [
      { title: "Meus Pedidos · YuWebMin" },
      { name: "description", content: "Acompanhe o status dos seus pedidos no Yuen Min." },
    ],
  }),
  component: PedidosPage,
});

const STATUS_STYLE: Record<Order["status"], { icon: React.ElementType; cls: string }> = {
  Aceito: { icon: CheckCircle2, cls: "bg-secondary text-primary" },
  "Em entrega": { icon: Truck, cls: "bg-accent/40 text-accent-foreground" },
  Concluído: { icon: PackageCheck, cls: "bg-primary text-primary-foreground" },
  Negado: { icon: XCircle, cls: "bg-destructive/10 text-destructive" },
};

function PedidosPage() {
  const orders = useStore(() => store.getOrders());

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 pt-10 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold">Meus Pedidos</h1>
        <p className="text-muted-foreground mt-2">Acompanhe seus pedidos e o status de entrega.</p>

        {orders.length === 0 ? (
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
              return (
                <li key={o.id} className="rounded-2xl bg-card border border-border p-5 shadow-[var(--shadow-soft)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Pedido</div>
                      <div className="font-semibold">{o.id} · {o.size === "Personalizado" ? "Personalizado" : `Marmita ${o.size}`}</div>
                      {o.paymentMethod && (
                        <div className="text-xs text-muted-foreground mt-0.5">Pagamento: {o.paymentMethod}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(o.createdAt).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${S.cls}`}>
                      <S.icon className="h-3.5 w-3.5" /> {o.status}
                    </span>
                  </div>
                  <ul className="mt-4 grid sm:grid-cols-2 gap-2">
                    {o.items.map((i) => (
                      <li key={i.id} className="text-sm flex items-center gap-2 text-muted-foreground">
                        <span className="text-lg">{i.emoji}</span>
                        <span className="flex-1 truncate">{i.qty}× {i.name}</span>
                        <span>{formatBRL(i.price * i.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-border flex justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-bold text-primary">{formatBRL(o.total)}</span>
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
