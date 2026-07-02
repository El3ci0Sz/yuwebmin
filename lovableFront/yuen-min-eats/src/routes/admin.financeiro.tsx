import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { store, useStore } from "@/lib/store";
import { formatBRL } from "@/lib/menu-data";
import { flattenPedidoItens, listarPedidosAdmin } from "@/lib/api/pedidos";
import type { Pedido, StatusPedido } from "@/lib/api/types";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  XCircle,
  CalendarRange,
  ShieldAlert,
  CheckCircle2,
  Truck,
  Clock,
  ChefHat,
} from "lucide-react";

export const Route = createFileRoute("/admin/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro · YuWebMin Admin" },
      { name: "description", content: "Relatórios de vendas e dashboard financeiro." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !store.isAdmin()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminFinanceiro,
});

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function daysAgo(n: number) {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
}

function AdminFinanceiro() {
  const isAdmin = useStore(() => store.isAdmin());
  const query = useQuery({
    queryKey: ["pedidos-admin"],
    queryFn: listarPedidosAdmin,
    enabled: isAdmin,
  });
  const orders = useMemo(() => query.data ?? [], [query.data]);

  const today = startOfDay(new Date());
  const weekStart = daysAgo(6);
  const monthStart = daysAgo(29);

  const inRange = (o: Pedido, from: Date) => new Date(o.dataPedido) >= from;
  const sum = (list: Pedido[]) =>
    list.filter((o) => o.status !== "Negado").reduce((s, o) => s + o.valorTotal, 0);

  const today_orders = orders.filter((o) => inRange(o, today));
  const week_orders = orders.filter((o) => inRange(o, weekStart));
  const month_orders = orders.filter((o) => inRange(o, monthStart));

  const totalVendas = sum(orders);
  const cancelados = orders.filter((o) => o.status === "Negado");
  const ticketMedio =
    orders.length > 0 ? totalVendas / Math.max(1, orders.length - cancelados.length) : 0;

  const statusCounts = useMemo(() => {
    const c: Record<StatusPedido, number> = {
      Aceito: 0,
      Preparando: 0,
      "Em entrega": 0,
      Concluído: 0,
      Negado: 0,
    };
    orders.forEach((o) => {
      c[o.status] = (c[o.status] ?? 0) + 1;
    });
    return c;
  }, [orders]);

  // Vendas dos últimos 7 dias para gráfico de barras
  const dailySeries = useMemo(() => {
    const buckets: { label: string; total: number; date: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = daysAgo(i);
      buckets.push({
        label: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
        date: d,
        total: 0,
      });
    }
    orders.forEach((o) => {
      const dt = startOfDay(new Date(o.dataPedido));
      if (o.status === "Negado") return;
      const b = buckets.find((x) => x.date.getTime() === dt.getTime());
      if (b) b.total += o.valorTotal;
    });
    return buckets;
  }, [orders]);

  const maxDaily = Math.max(1, ...dailySeries.map((d) => d.total));

  // Top itens
  const topItems = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number; emoji: string }>();
    orders
      .filter((o) => o.status !== "Negado")
      .forEach((o) => {
        flattenPedidoItens(o).forEach((it) => {
          const prev = map.get(it.key) ?? { name: it.nome, qty: 0, revenue: 0, emoji: it.emoji };
          prev.qty += it.quantidade;
          prev.revenue += it.precoUnitario * it.quantidade;
          map.set(it.key, prev);
        });
      });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  const recent = orders.slice(0, 8);

  if (!isAdmin) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-3xl px-4 py-20 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold mt-3">Acesso restrito</h1>
          <p className="text-muted-foreground mt-2">Esta área é exclusiva para administradores.</p>
          <Link to="/login" className="inline-block mt-6">
            <Button>Entrar</Button>
          </Link>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-24">
        <p className="text-xs uppercase tracking-wider text-primary font-semibold">Admin</p>
        <h1 className="text-3xl md:text-4xl font-bold mt-1">Financeiro</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Resumo de vendas, cancelamentos e desempenho dos pedidos.
        </p>

        {query.isLoading && (
          <p className="mt-8 text-center text-muted-foreground">Carregando pedidos...</p>
        )}
        {query.isError && (
          <p className="mt-8 text-center text-destructive">
            Não foi possível carregar os pedidos agora.
          </p>
        )}

        {!query.isLoading && !query.isError && (
          <>
            {/* KPIs */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi
                icon={DollarSign}
                label="Total acumulado"
                value={formatBRL(totalVendas)}
                hint={`${orders.length - cancelados.length} pedidos válidos`}
              />
              <Kpi
                icon={CalendarRange}
                label="Hoje"
                value={formatBRL(sum(today_orders))}
                hint={`${today_orders.length} pedidos`}
                accent
              />
              <Kpi
                icon={TrendingUp}
                label="Últimos 7 dias"
                value={formatBRL(sum(week_orders))}
                hint={`${week_orders.length} pedidos`}
              />
              <Kpi
                icon={ShoppingCart}
                label="Últimos 30 dias"
                value={formatBRL(sum(month_orders))}
                hint={`Ticket médio ${formatBRL(ticketMedio)}`}
              />
            </div>

            {/* Status + Cancelamentos */}
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-2xl bg-card border border-border p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Vendas — últimos 7 dias</h2>
                  <span className="text-xs text-muted-foreground">
                    {formatBRL(sum(week_orders))}
                  </span>
                </div>
                <div className="mt-5 flex gap-2 h-40">
                  {dailySeries.map((d, i) => {
                    const h = (d.total / maxDaily) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full flex-1 flex items-end">
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-primary to-accent transition-all"
                            style={{ height: `${Math.max(4, h)}%` }}
                            title={formatBRL(d.total)}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-card border border-border p-5">
                <h2 className="font-semibold">Status dos pedidos</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  <StatusRow
                    icon={<Clock className="h-4 w-4 text-primary" />}
                    label="Aceitos"
                    value={statusCounts.Aceito}
                  />
                  <StatusRow
                    icon={<ChefHat className="h-4 w-4 text-primary" />}
                    label="Preparando"
                    value={statusCounts.Preparando}
                  />
                  <StatusRow
                    icon={<Truck className="h-4 w-4 text-primary" />}
                    label="Em entrega"
                    value={statusCounts["Em entrega"]}
                  />
                  <StatusRow
                    icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
                    label="Concluídos"
                    value={statusCounts.Concluído}
                  />
                  <StatusRow
                    icon={<XCircle className="h-4 w-4 text-destructive" />}
                    label="Cancelados"
                    value={statusCounts.Negado}
                    destructive
                  />
                </ul>
                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  Perdas por cancelamento:{" "}
                  <span className="font-semibold text-destructive">
                    {formatBRL(cancelados.reduce((s, o) => s + o.valorTotal, 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Top itens + Pedidos recentes */}
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-card border border-border p-5">
                <h2 className="font-semibold">Top itens por receita</h2>
                {topItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-4">Sem dados ainda.</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {topItems.map((it, idx) => (
                      <li key={it.name} className="flex items-center gap-3 text-sm">
                        <span className="h-7 w-7 rounded-full bg-secondary text-primary font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-xl">{it.emoji}</span>
                        <span className="flex-1 min-w-0 truncate">{it.name}</span>
                        <span className="text-xs text-muted-foreground">{it.qty}×</span>
                        <span className="font-semibold tabular-nums">{formatBRL(it.revenue)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl bg-card border border-border p-5">
                <h2 className="font-semibold">Pedidos recentes</h2>
                {recent.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-4">Nenhum pedido registrado.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-border text-sm">
                    {recent.map((o) => (
                      <li key={o.id} className="py-2.5 flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">#{o.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(o.dataPedido).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {" · "}
                            {o.metodoPagamento}
                          </div>
                        </div>
                        <StatusPill status={o.status} />
                        <span className="font-semibold tabular-nums w-24 text-right">
                          {formatBRL(o.valorTotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${accent ? "bg-gradient-to-br from-primary to-accent text-primary-foreground border-transparent shadow-[var(--shadow-warm)]" : "bg-card border-border"}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs uppercase tracking-wider font-semibold ${accent ? "opacity-90" : "text-muted-foreground"}`}
        >
          {label}
        </span>
        <Icon className={`h-4 w-4 ${accent ? "" : "text-primary"}`} />
      </div>
      <div className="mt-3 text-2xl font-bold tabular-nums">{value}</div>
      {hint && (
        <div className={`text-xs mt-1 ${accent ? "opacity-80" : "text-muted-foreground"}`}>
          {hint}
        </div>
      )}
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  destructive?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      {icon}
      <span className="flex-1">{label}</span>
      <span className={`font-bold tabular-nums ${destructive ? "text-destructive" : ""}`}>
        {value}
      </span>
    </li>
  );
}

function StatusPill({ status }: { status: StatusPedido }) {
  const map: Record<StatusPedido, string> = {
    Aceito: "bg-secondary text-secondary-foreground",
    Preparando: "bg-secondary text-secondary-foreground",
    "Em entrega": "bg-accent/30 text-accent-foreground",
    Concluído: "bg-primary/15 text-primary",
    Negado: "bg-destructive/15 text-destructive",
  };
  return (
    <span
      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${map[status]}`}
    >
      {status}
    </span>
  );
}
