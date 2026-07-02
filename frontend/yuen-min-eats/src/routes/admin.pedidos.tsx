import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { store, useStore } from "@/lib/store";
import { formatBRL } from "@/lib/menu-data";
import {
  STATUS_OPTIONS,
  atualizarStatusPedido,
  flattenPedidoItens,
  listarPedidosAdmin,
} from "@/lib/api/pedidos";
import type { StatusPedido } from "@/lib/api/types";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pedidos")({
  head: () => ({
    meta: [
      { title: "Gestão de Pedidos · YuWebMin Admin" },
      { name: "description", content: "Acompanhe e atualize o status dos pedidos recebidos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !store.isAdmin()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminPedidos,
});

const FILTROS = ["Todos", ...STATUS_OPTIONS] as const;

const STATUS_STYLE: Record<StatusPedido, string> = {
  Aceito: "bg-secondary text-secondary-foreground",
  Preparando: "bg-secondary text-secondary-foreground",
  "Em entrega": "bg-accent/30 text-accent-foreground",
  Concluído: "bg-primary/15 text-primary",
  Negado: "bg-destructive/15 text-destructive",
};

function AdminPedidos() {
  const isAdmin = useStore(() => store.isAdmin());
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>("Todos");

  const query = useQuery({
    queryKey: ["pedidos-admin"],
    queryFn: listarPedidosAdmin,
    enabled: isAdmin,
  });
  const orders = useMemo(() => query.data ?? [], [query.data]);
  const filtrados = useMemo(
    () => (filtro === "Todos" ? orders : orders.filter((o) => o.status === filtro)),
    [orders, filtro],
  );

  const atualizarStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: StatusPedido }) =>
      atualizarStatusPedido(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-admin"] });
      queryClient.invalidateQueries({ queryKey: ["meus-pedidos"] });
      toast.success("Status do pedido atualizado.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar o status.");
    },
  });

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
      <section className="mx-auto max-w-5xl px-4 pt-8 pb-24">
        <p className="text-xs uppercase tracking-wider text-primary font-semibold">Admin</p>
        <h1 className="text-3xl md:text-4xl font-bold mt-1">Gestão de Pedidos</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Acompanhe os pedidos recebidos e atualize o status conforme eles avançam na cozinha.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                filtro === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground/80 border-border hover:bg-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {query.isLoading && (
          <p className="mt-10 text-center text-muted-foreground">Carregando pedidos...</p>
        )}
        {query.isError && (
          <p className="mt-10 text-center text-destructive">
            Não foi possível carregar os pedidos agora.
          </p>
        )}

        {!query.isLoading && !query.isError && (
          <ul className="mt-6 space-y-4">
            {filtrados.map((o) => {
              const linhas = flattenPedidoItens(o);
              const pending = atualizarStatus.isPending && atualizarStatus.variables?.id === o.id;
              return (
                <li
                  key={o.id}
                  className="rounded-2xl bg-card border border-border p-5 shadow-[var(--shadow-soft)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Pedido</div>
                      <div className="font-semibold">
                        #{o.id} · {o.nomeCliente}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(o.dataPedido).toLocaleString("pt-BR")} · {o.metodoPagamento}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[o.status]}`}
                      >
                        {o.status}
                      </span>
                      <Select
                        value={o.status}
                        disabled={pending}
                        onValueChange={(value) =>
                          atualizarStatus.mutate({ id: o.id, status: value as StatusPedido })
                        }
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
            {filtrados.length === 0 && (
              <p className="text-center text-muted-foreground py-10">
                Nenhum pedido nessa situação.
              </p>
            )}
          </ul>
        )}
      </section>
    </SiteLayout>
  );
}
