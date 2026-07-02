import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { store, useStore } from "@/lib/store";
import { formatBRL, getIngredientIcon } from "@/lib/menu-data";
import {
  alternarStatusAcompanhamento,
  alternarStatusModelo,
  alternarStatusProduto,
  atualizarAcompanhamento,
  atualizarModelo,
  atualizarProduto,
  criarAcompanhamento,
  criarModelo,
  criarProduto,
  deletarAcompanhamento,
  deletarModelo,
  deletarProduto,
  listarAcompanhamentosTodos,
  listarModelosTodos,
  listarProdutosTodos,
  type AcompanhamentoInput,
  type ModeloMarmitaInput,
  type ProdutoInput,
} from "@/lib/api/cardapio";
import type { Acompanhamento, CategoriaProduto, ModeloMarmita, Produto } from "@/lib/api/types";
import { toast } from "sonner";
import { Pencil, Pin, Plus, ShieldAlert, Trash2 } from "lucide-react";

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

function useEntityMutations<TItem, TInput>(
  queryKey: string[],
  ativosKey: string[],
  api: {
    criar: (input: TInput) => Promise<TItem>;
    atualizar: (id: number, input: TInput) => Promise<TItem>;
    deletar: (id: number) => Promise<void>;
    alternarStatus: (id: number) => Promise<unknown>;
  },
) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ativosKey });
  };
  const onError = (err: unknown) => {
    toast.error(err instanceof Error ? err.message : "Não foi possível concluir a ação.");
  };

  const criar = useMutation({
    mutationFn: api.criar,
    onSuccess: () => {
      invalidate();
      toast.success("Item criado com sucesso.");
    },
    onError,
  });
  const atualizar = useMutation({
    mutationFn: ({ id, input }: { id: number; input: TInput }) => api.atualizar(id, input),
    onSuccess: () => {
      invalidate();
      toast.success("Item atualizado com sucesso.");
    },
    onError,
  });
  const deletar = useMutation({
    mutationFn: api.deletar,
    onSuccess: () => {
      invalidate();
      toast.success("Item removido.");
    },
    onError,
  });
  const alternarStatus = useMutation({
    mutationFn: api.alternarStatus,
    onSuccess: invalidate,
    onError,
  });

  return { criar, atualizar, deletar, alternarStatus };
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

  const modelosApi = useEntityMutations(["admin-modelos"], ["modelos-ativos"], {
    criar: criarModelo,
    atualizar: atualizarModelo,
    deletar: deletarModelo,
    alternarStatus: alternarStatusModelo,
  });
  const acompanhamentosApi = useEntityMutations(
    ["admin-acompanhamentos"],
    ["acompanhamentos-ativos"],
    {
      criar: criarAcompanhamento,
      atualizar: atualizarAcompanhamento,
      deletar: deletarAcompanhamento,
      alternarStatus: alternarStatusAcompanhamento,
    },
  );
  const produtosApi = useEntityMutations(["admin-produtos"], ["produtos-ativos"], {
    criar: criarProduto,
    atualizar: atualizarProduto,
    deletar: deletarProduto,
    alternarStatus: alternarStatusProduto,
  });

  const pratos = useMemo(() => acompanhamentosQuery.data ?? [], [acompanhamentosQuery.data]);
  const fixos = useMemo(() => pratos.filter((p) => p.itemFixo), [pratos]);
  const variaveis = useMemo(() => pratos.filter((p) => !p.itemFixo), [pratos]);

  const produtos = useMemo(() => produtosQuery.data ?? [], [produtosQuery.data]);
  const bebidas = useMemo(() => produtos.filter((p) => p.categoria === "Bebidas"), [produtos]);
  const sobremesas = useMemo(
    () => produtos.filter((p) => p.categoria === "Sobremesas"),
    [produtos],
  );

  // Diálogos de criação/edição
  const [modeloDialog, setModeloDialog] = useState<{ open: boolean; item: ModeloMarmita | null }>({
    open: false,
    item: null,
  });
  const [acompanhamentoDialog, setAcompanhamentoDialog] = useState<{
    open: boolean;
    item: Acompanhamento | null;
  }>({ open: false, item: null });
  const [produtoDialog, setProdutoDialog] = useState<{
    open: boolean;
    item: Produto | null;
    categoriaPadrao: CategoriaProduto;
  }>({ open: false, item: null, categoriaPadrao: "Bebidas" });

  // Confirmação de exclusão
  const [deleteTarget, setDeleteTarget] = useState<{
    tipo: "modelo" | "acompanhamento" | "produto";
    id: number;
    nome: string;
  } | null>(null);

  function confirmarExclusao() {
    if (!deleteTarget) return;
    const { tipo, id } = deleteTarget;
    const mutation =
      tipo === "modelo"
        ? modelosApi.deletar
        : tipo === "acompanhamento"
          ? acompanhamentosApi.deletar
          : produtosApi.deletar;
    mutation.mutate(id, { onSuccess: () => setDeleteTarget(null) });
  }

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
              Adicione, edite ou remova o que estará disponível para os clientes. O interruptor
              ativa/desativa na hora.
            </p>
          </div>
        </div>

        {/* CAMPO 1 — Tamanhos */}
        <Section
          number="1"
          title="Tamanhos de marmita disponíveis"
          subtitle="Preço fixo por tamanho, independente dos acompanhamentos escolhidos."
          action={
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => setModeloDialog({ open: true, item: null })}
            >
              <Plus className="h-4 w-4 mr-1" /> Novo tamanho
            </Button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {modelosQuery.data?.map((m) => (
              <Row
                key={m.id}
                leading={<span className="text-2xl">🍱</span>}
                title={m.nome}
                description={`Até ${m.limiteAcompanhamentos} porções de acompanhamento`}
                meta={formatBRL(m.preco)}
                active={m.ativo}
                onToggle={() => modelosApi.alternarStatus.mutate(m.id)}
                onEdit={() => setModeloDialog({ open: true, item: m })}
                onDelete={() => setDeleteTarget({ tipo: "modelo", id: m.id, nome: m.nome })}
              />
            ))}
            {modelosQuery.isLoading && (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            )}
            {modelosQuery.data?.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full">
                Nenhum tamanho cadastrado ainda.
              </p>
            )}
          </div>
        </Section>

        {/* CAMPO 2 — Produtos adicionais */}
        <Section
          number="2"
          title="Produtos adicionais"
          subtitle="Bebidas e sobremesas oferecidas como complemento ao pedido."
          action={
            <Button
              size="sm"
              className="rounded-full"
              onClick={() =>
                setProdutoDialog({ open: true, item: null, categoriaPadrao: "Bebidas" })
              }
            >
              <Plus className="h-4 w-4 mr-1" /> Novo produto
            </Button>
          }
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
                  onToggle={() => produtosApi.alternarStatus.mutate(b.id)}
                  onEdit={() =>
                    setProdutoDialog({ open: true, item: b, categoriaPadrao: "Bebidas" })
                  }
                  onDelete={() => setDeleteTarget({ tipo: "produto", id: b.id, nome: b.nome })}
                />
              ))}
              {bebidas.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma bebida cadastrada.</p>
              )}
            </div>
          </SubGroup>

          <SubGroup title="Sobremesas">
            <div className="grid gap-2 sm:grid-cols-2">
              {sobremesas.map((e) => (
                <Row
                  key={e.id}
                  leading={
                    e.urlImagem ? (
                      <img src={e.urlImagem} alt="" className="h-10 w-10 object-contain" />
                    ) : (
                      <span className="text-3xl">{getIngredientIcon(e)}</span>
                    )
                  }
                  title={e.nome}
                  description={e.descricao}
                  meta={formatBRL(e.preco)}
                  active={e.ativo}
                  onToggle={() => produtosApi.alternarStatus.mutate(e.id)}
                  onEdit={() =>
                    setProdutoDialog({ open: true, item: e, categoriaPadrao: "Sobremesas" })
                  }
                  onDelete={() => setDeleteTarget({ tipo: "produto", id: e.id, nome: e.nome })}
                />
              ))}
              {sobremesas.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma sobremesa cadastrada.</p>
              )}
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
          action={
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => setAcompanhamentoDialog({ open: true, item: null })}
            >
              <Plus className="h-4 w-4 mr-1" /> Novo prato
            </Button>
          }
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
                  onToggle={() => acompanhamentosApi.alternarStatus.mutate(m.id)}
                  onEdit={() => setAcompanhamentoDialog({ open: true, item: m })}
                  onDelete={() =>
                    setDeleteTarget({ tipo: "acompanhamento", id: m.id, nome: m.nome })
                  }
                  fixed
                />
              ))}
              {fixos.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum item fixo cadastrado.</p>
              )}
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
                  onToggle={() => acompanhamentosApi.alternarStatus.mutate(m.id)}
                  onEdit={() => setAcompanhamentoDialog({ open: true, item: m })}
                  onDelete={() =>
                    setDeleteTarget({ tipo: "acompanhamento", id: m.id, nome: m.nome })
                  }
                />
              ))}
              {variaveis.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum item variável cadastrado.</p>
              )}
            </div>
          </SubGroup>
          {acompanhamentosQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          )}
        </Section>
      </section>

      <ModeloDialog
        open={modeloDialog.open}
        initial={modeloDialog.item}
        saving={modelosApi.criar.isPending || modelosApi.atualizar.isPending}
        onOpenChange={(open) => setModeloDialog((d) => ({ ...d, open }))}
        onSave={(input) => {
          const onSuccess = () => setModeloDialog({ open: false, item: null });
          if (modeloDialog.item)
            modelosApi.atualizar.mutate({ id: modeloDialog.item.id, input }, { onSuccess });
          else modelosApi.criar.mutate(input, { onSuccess });
        }}
      />

      <AcompanhamentoDialog
        open={acompanhamentoDialog.open}
        initial={acompanhamentoDialog.item}
        saving={acompanhamentosApi.criar.isPending || acompanhamentosApi.atualizar.isPending}
        onOpenChange={(open) => setAcompanhamentoDialog((d) => ({ ...d, open }))}
        onSave={(input) => {
          const onSuccess = () => setAcompanhamentoDialog({ open: false, item: null });
          if (acompanhamentoDialog.item)
            acompanhamentosApi.atualizar.mutate(
              { id: acompanhamentoDialog.item.id, input },
              { onSuccess },
            );
          else acompanhamentosApi.criar.mutate(input, { onSuccess });
        }}
      />

      <ProdutoDialog
        open={produtoDialog.open}
        initial={produtoDialog.item}
        categoriaPadrao={produtoDialog.categoriaPadrao}
        saving={produtosApi.criar.isPending || produtosApi.atualizar.isPending}
        onOpenChange={(open) => setProdutoDialog((d) => ({ ...d, open }))}
        onSave={(input) => {
          const onSuccess = () =>
            setProdutoDialog({ open: false, item: null, categoriaPadrao: "Bebidas" });
          if (produtoDialog.item)
            produtosApi.atualizar.mutate({ id: produtoDialog.item.id, input }, { onSuccess });
          else produtosApi.criar.mutate(input, { onSuccess });
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover "{deleteTarget?.nome}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O item deixará de existir no cardápio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SiteLayout>
  );
}

function Section({
  number,
  title,
  subtitle,
  action,
  children,
}: {
  number: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-start gap-3">
          <span className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
            {number}
          </span>
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
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
  onEdit,
  onDelete,
  fixed,
}: {
  leading: React.ReactNode;
  title: string;
  description?: string;
  meta?: string;
  active: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
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
      <button
        onClick={onEdit}
        className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        aria-label={`Editar ${title}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        aria-label={`Remover ${title}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <Switch checked={active} onCheckedChange={onToggle} />
    </div>
  );
}

// --- Diálogos de criação/edição ---

function ModeloDialog({
  open,
  initial,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  initial: ModeloMarmita | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: ModeloMarmitaInput) => void;
}) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [limite, setLimite] = useState("");

  useEffect(() => {
    if (!open) return;
    setNome(initial?.nome ?? "");
    setDescricao(initial?.descricao ?? "");
    setPreco(initial ? String(initial.preco) : "");
    setLimite(initial ? String(initial.limiteAcompanhamentos) : "");
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar tamanho" : "Novo tamanho de marmita"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="modelo-nome">Nome</Label>
            <Input
              id="modelo-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Marmita P"
            />
          </div>
          <div>
            <Label htmlFor="modelo-descricao">Descrição (opcional)</Label>
            <Textarea
              id="modelo-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="modelo-preco">Preço (R$)</Label>
              <Input
                id="modelo-preco"
                type="number"
                min="0"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="modelo-limite">Limite de porções</Label>
              <Input
                id="modelo-limite"
                type="number"
                min="1"
                step="1"
                value={limite}
                onChange={(e) => setLimite(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={saving || !nome.trim() || !preco || !limite}
            onClick={() =>
              onSave({
                nome: nome.trim(),
                descricao: descricao.trim() || undefined,
                preco: Number(preco),
                limiteAcompanhamentos: Number(limite),
                ativo: initial?.ativo ?? true,
              })
            }
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AcompanhamentoDialog({
  open,
  initial,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  initial: Acompanhamento | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: AcompanhamentoInput) => void;
}) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [emoji, setEmoji] = useState("");
  const [itemFixo, setItemFixo] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNome(initial?.nome ?? "");
    setDescricao(initial?.descricao ?? "");
    setEmoji(initial?.emoji ?? "");
    setItemFixo(initial?.itemFixo ?? false);
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar prato" : "Novo prato"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="prato-nome">Nome</Label>
            <Input
              id="prato-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Arroz Integral"
            />
          </div>
          <div>
            <Label htmlFor="prato-descricao">Descrição (opcional)</Label>
            <Textarea
              id="prato-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="prato-emoji">Emoji (opcional)</Label>
            <Input
              id="prato-emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="🍚"
              maxLength={4}
              className="w-20"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={itemFixo}
              onChange={(e) => setItemFixo(e.target.checked)}
              className="h-4 w-4"
            />
            Item fixo (servido todos os dias)
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={saving || !nome.trim()}
            onClick={() =>
              onSave({
                nome: nome.trim(),
                descricao: descricao.trim() || undefined,
                emoji: emoji.trim() || undefined,
                itemFixo,
                ativo: initial?.ativo ?? true,
              })
            }
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProdutoDialog({
  open,
  initial,
  categoriaPadrao,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  initial: Produto | null;
  categoriaPadrao: CategoriaProduto;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: ProdutoInput) => void;
}) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [emoji, setEmoji] = useState("");
  const [urlImagem, setUrlImagem] = useState("");
  const [categoria, setCategoria] = useState<CategoriaProduto>("Bebidas");

  useEffect(() => {
    if (!open) return;
    setNome(initial?.nome ?? "");
    setDescricao(initial?.descricao ?? "");
    setPreco(initial ? String(initial.preco) : "");
    setEmoji(initial?.emoji ?? "");
    setUrlImagem(initial?.urlImagem ?? "");
    setCategoria(initial?.categoria ?? categoriaPadrao);
  }, [open, initial, categoriaPadrao]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar produto" : "Novo produto"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["Bebidas", "Sobremesas"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoria(c)}
                className={`flex-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  categoria === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div>
            <Label htmlFor="produto-nome">Nome</Label>
            <Input
              id="produto-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Suco de Laranja"
            />
          </div>
          <div>
            <Label htmlFor="produto-descricao">Descrição (opcional)</Label>
            <Textarea
              id="produto-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="produto-preco">Preço (R$)</Label>
              <Input
                id="produto-preco"
                type="number"
                min="0"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="produto-emoji">Emoji (opcional)</Label>
              <Input
                id="produto-emoji"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="🥤"
                maxLength={4}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="produto-imagem">URL da imagem (opcional)</Label>
            <Input
              id="produto-imagem"
              value={urlImagem}
              onChange={(e) => setUrlImagem(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={saving || !nome.trim() || !preco}
            onClick={() =>
              onSave({
                nome: nome.trim(),
                descricao: descricao.trim() || undefined,
                categoria,
                preco: Number(preco),
                emoji: emoji.trim() || undefined,
                urlImagem: urlImagem.trim() || undefined,
                itemFixo: initial?.itemFixo ?? false,
                ativo: initial?.ativo ?? true,
              })
            }
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
