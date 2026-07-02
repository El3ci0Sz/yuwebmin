import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { store, useStore } from "@/lib/store";
import { formatBRL, getIngredientIcon } from "@/lib/menu-data";
import {
  alternarStatusAcompanhamento,
  alternarStatusModelo,
  alternarStatusProduto,
  listarAcompanhamentosTodos,
  listarModelosTodos,
  listarProdutosTodos,
} from "@/lib/api/cardapio";
import { toast } from "sonner";
import { Pin, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/cardapio")({
  head: () => ({
    meta: [
      { title: "Gestão de Cardápio · YuWebMin Admin" },
      {
        name: "description",
        content: "Configure tamanhos, pratos, bebidas e adicionais disponíveis.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !store.isAdmin()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminCardapio,
});

function useToggle<T>(
  queryKey: string[],
  toggle: (id: number) => Promise<T>,
  extraKeysToInvalidate: string[][] = [],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      extraKeysToInvalidate.forEach((k) => queryClient.invalidateQueries({ queryKey: k }));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar o item.");
    },
  });
}

function AdminCardapio() {
  const isAdmin = useStore(() => store.isAdmin());

  const modelosQuery = useQuery({
    queryKey: ["admin-modelos"],
    queryFn: listarModelosTodos,
    enabled: isAdmin,
  });
  const acompanhamentosQuery = useQuery({
    queryKey: ["admin-acompanhamentos"],
    queryFn: listarAcompanhamentosTodos,
    enabled: isAdmin,
  });
  const produtosQuery = useQuery({
    queryKey: ["admin-produtos"],
    queryFn: listarProdutosTodos,
    enabled: isAdmin,
  });

  const toggleModelo = useToggle(["admin-modelos"], alternarStatusModelo, [["modelos-ativos"]]);
  const toggleAcompanhamento = useToggle(["admin-acompanhamentos"], alternarStatusAcompanhamento, [
    ["acompanhamentos-ativos"],
  ]);
  const toggleProduto = useToggle(["admin-produtos"], alternarStatusProduto, [["produtos-ativos"]]);

  const pratos = useMemo(() => acompanhamentosQuery.data ?? [], [acompanhamentosQuery.data]);
  const fixos = useMemo(() => pratos.filter((p) => p.itemFixo), [pratos]);
  const variaveis = useMemo(() => pratos.filter((p) => !p.itemFixo), [pratos]);

  const produtos = useMemo(() => produtosQuery.data ?? [], [produtosQuery.data]);
  const bebidas = useMemo(() => produtos.filter((p) => p.categoria === "Bebidas"), [produtos]);
  const sobremesas = useMemo(
    () => produtos.filter((p) => p.categoria === "Sobremesas"),
    [produtos],
  );

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
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">Admin</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">Gestão de Cardápio</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Ative ou desative o que estará disponível hoje para os clientes montarem suas
              marmitas. Cada alteração é aplicada na hora.
            </p>
          </div>
        </div>

        {/* CAMPO 1 — Tamanhos */}
        <Section
          number="1"
          title="Tamanhos de marmita disponíveis"
          subtitle="Preço fixo por tamanho, independente dos acompanhamentos escolhidos."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {modelosQuery.data?.map((m) => (
              <Row
                key={m.id}
                leading={
                  <span className="text-lg font-bold text-primary">{formatBRL(m.preco)}</span>
                }
                title={m.nome}
                description={`Até ${m.limiteAcompanhamentos} porções de acompanhamento`}
                active={m.ativo}
                onToggle={() => toggleModelo.mutate(m.id)}
              />
            ))}
            {modelosQuery.isLoading && (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            )}
          </div>
        </Section>

        {/* CAMPO 2 — Produtos adicionais */}
        <Section
          number="2"
          title="Produtos adicionais"
          subtitle="Bebidas e sobremesas oferecidas como complemento ao pedido."
        >
          <SubGroup title="Bebidas">
            <div className="grid gap-2 sm:grid-cols-2">
              {bebidas.map((b) => (
                <Row
                  key={b.id}
                  leading={
                    b.urlImagem ? (
                      <img src={b.urlImagem} alt="" className="h-10 w-10 object-contain" />
                    ) : (
                      <span className="text-3xl">{getIngredientIcon(b)}</span>
                    )
                  }
                  title={b.nome}
                  meta={formatBRL(b.preco)}
                  active={b.ativo}
                  onToggle={() => toggleProduto.mutate(b.id)}
                />
              ))}
            </div>
          </SubGroup>

          <SubGroup title="Sobremesas">
            <div className="grid gap-2 sm:grid-cols-2">
              {sobremesas.map((e) => (
                <Row
                  key={e.id}
                  leading={<span className="text-3xl">{getIngredientIcon(e)}</span>}
                  title={e.nome}
                  description={e.descricao}
                  meta={formatBRL(e.preco)}
                  active={e.ativo}
                  onToggle={() => toggleProduto.mutate(e.id)}
                />
              ))}
            </div>
          </SubGroup>
          {produtosQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          )}
        </Section>

        {/* CAMPO 3 — Pratos */}
        <Section
          number="3"
          title="Pratos do restaurante"
          subtitle="Selecione os pratos que estarão disponíveis hoje para montar a marmita. Itens fixos já vêm ativos."
        >
          <SubGroup
            title="Itens fixos (servidos todos os dias)"
            icon={<Pin className="h-3.5 w-3.5" />}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {fixos.map((m) => (
                <Row
                  key={m.id}
                  leading={<span className="text-2xl">{getIngredientIcon(m)}</span>}
                  title={m.nome}
                  description={m.descricao}
                  active={m.ativo}
                  onToggle={() => toggleAcompanhamento.mutate(m.id)}
                  fixed
                />
              ))}
            </div>
          </SubGroup>

          <SubGroup title="Itens variáveis (somente se houver hoje)">
            <div className="grid gap-2 sm:grid-cols-2">
              {variaveis.map((m) => (
                <Row
                  key={m.id}
                  leading={<span className="text-2xl">{getIngredientIcon(m)}</span>}
                  title={m.nome}
                  description={m.descricao}
                  active={m.ativo}
                  onToggle={() => toggleAcompanhamento.mutate(m.id)}
                />
              ))}
            </div>
          </SubGroup>
          {acompanhamentosQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          )}
        </Section>
      </section>
    </SiteLayout>
  );
}

function Section({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10">
      <div className="flex items-start gap-3 mb-4">
        <span className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
          {number}
        </span>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="rounded-2xl bg-card border border-border p-5">{children}</div>
    </div>
  );
}

function SubGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({
  leading,
  title,
  description,
  meta,
  active,
  onToggle,
  fixed,
}: {
  leading: React.ReactNode;
  title: string;
  description?: string;
  meta?: string;
  active: boolean;
  onToggle: () => void;
  fixed?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${active ? "border-primary/40 bg-secondary/40" : "border-border bg-background"}`}
    >
      <div className="shrink-0 h-10 w-10 flex items-center justify-center">{leading}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{title}</span>
          {fixed && (
            <span className="text-[10px] uppercase tracking-wider bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">
              Fixo
            </span>
          )}
        </div>
        {description && (
          <div className="text-xs text-muted-foreground line-clamp-1">{description}</div>
        )}
        {meta && <div className="text-xs text-primary font-semibold mt-0.5">{meta}</div>}
      </div>
      <Switch checked={active} onCheckedChange={onToggle} />
    </div>
  );
}
