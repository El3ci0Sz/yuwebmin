import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_CARIMBOS, store, useStore } from "@/lib/store";
import { formatBRL, getIngredientIcon } from "@/lib/menu-data";
import {
  listarAcompanhamentosAtivos,
  listarModelosAtivos,
  listarProdutosAtivos,
} from "@/lib/api/cardapio";
import { criarPedido } from "@/lib/api/pedidos";
import { listarMeusEnderecos } from "@/lib/api/enderecos";
import type {
  Acompanhamento,
  Endereco,
  ModeloMarmita,
  Produto,
  MetodoPagamento,
  TipoEntrega,
} from "@/lib/api/types";
import { toast } from "sonner";
import {
  Search,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Wallet,
  CreditCard,
  Banknote,
  QrCode,
  Truck,
  Store,
  Gift,
} from "lucide-react";
import bento0 from "@/assets/bento-0.png";
import bento1 from "@/assets/bento-1.png";
import bento2 from "@/assets/bento-2.png";
import bento3 from "@/assets/bento-3.png";
import bento4 from "@/assets/bento-4.png";
import bento5 from "@/assets/bento-5.png";
import bento6 from "@/assets/bento-6.png";
import bento7 from "@/assets/bento-7.png";
import bento8 from "@/assets/bento-8.png";

export const Route = createFileRoute("/pedido")({
  head: () => ({
    meta: [
      { title: "Criador de Pedido · YuWebMin" },
      { name: "description", content: "Monte seu bento arrastando os ingredientes." },
    ],
  }),
  component: PedidoPage,
});

const BENTO_IMAGES = [bento0, bento1, bento2, bento3, bento4, bento5, bento6, bento7, bento8];

type PlateItem = { id: number; qty: number };
type Step = "tamanho" | "prato" | "bebidas" | "comanda";

const PAYMENT_METHODS: { id: MetodoPagamento; label: string; icon: React.ElementType }[] = [
  { id: "Pix", label: "Pix", icon: QrCode },
  { id: "Crédito", label: "Cartão de Crédito", icon: CreditCard },
  { id: "Débito", label: "Cartão de Débito", icon: Wallet },
  { id: "Dinheiro", label: "Dinheiro", icon: Banknote },
];

function DraggableItem({ item, disabled }: { item: Acompanhamento; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `menu-${item.id}`,
    data: { item },
    disabled,
  });
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      className={`group flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-all touch-none ${
        disabled
          ? "opacity-50 cursor-not-allowed border-border"
          : "border-border hover:border-primary hover:shadow-[var(--shadow-soft)] cursor-grab active:cursor-grabbing"
      } ${isDragging ? "opacity-30" : ""}`}
    >
      <span className="text-2xl shrink-0" aria-hidden>
        {getIngredientIcon(item)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium truncate">{item.nome}</span>
      </span>
    </button>
  );
}

function Bento({
  items,
  pratos,
  onRemove,
}: {
  items: PlateItem[];
  pratos: Acompanhamento[];
  onRemove: (id: number) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: "plate" });
  const totalQty = items.reduce((s, p) => s + p.qty, 0);
  const idx = Math.min(totalQty, BENTO_IMAGES.length - 1);
  const img = BENTO_IMAGES[idx];

  return (
    <div className="w-full">
      <div
        ref={setNodeRef}
        className={`relative mx-auto aspect-square w-full max-w-[440px] rounded-2xl transition-all ${
          isOver ? "scale-105 ring-4 ring-primary/40" : ""
        }`}
      >
        <img
          src={img}
          alt={`Bento com ${totalQty} ${totalQty === 1 ? "item" : "itens"}`}
          width={440}
          height={440}
          className="absolute inset-0 h-full w-full object-contain pointer-events-none select-none transition-opacity duration-500"
        />
        {totalQty === 0 && (
          <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
            <p className="text-sm text-muted-foreground bg-card/90 backdrop-blur rounded-full px-4 py-2 shadow-sm">
              Arraste os pratos para o bento
            </p>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2 justify-center">
          {items.map((p) => {
            const item = pratos.find((m) => m.id === p.id);
            if (!item) return null;
            return (
              <li key={p.id}>
                <button
                  onClick={() => onRemove(p.id)}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-secondary text-foreground px-3 py-1.5 text-xs font-medium hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label={`Remover ${item.nome}`}
                >
                  <span className="text-base">{getIngredientIcon(item)}</span>
                  <span className="truncate max-w-[120px]">{item.nome}</span>
                  {p.qty > 1 && <span className="font-bold">×{p.qty}</span>}
                  <X className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function PedidoPage() {
  const navigate = useNavigate();
  const user = useStore(() => store.getUser());

  const modelosQuery = useQuery({ queryKey: ["modelos-ativos"], queryFn: listarModelosAtivos });
  const pratosQuery = useQuery({
    queryKey: ["acompanhamentos-ativos"],
    queryFn: () => listarAcompanhamentosAtivos(),
  });
  const produtosQuery = useQuery({
    queryKey: ["produtos-ativos"],
    queryFn: () => listarProdutosAtivos(),
  });
  const enderecosQuery = useQuery({
    queryKey: ["meus-enderecos"],
    queryFn: listarMeusEnderecos,
    enabled: !!user,
  });

  const [step, setStep] = useState<Step>("tamanho");
  const [modeloId, setModeloId] = useState<number | null>(null);
  const [plate, setPlate] = useState<PlateItem[]>([]);
  const [beverages, setBeverages] = useState<Record<number, number>>({});
  const [extras, setExtras] = useState<Record<number, number>>({});
  const [payment, setPayment] = useState<MetodoPagamento | null>(null);
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega | null>(null);
  const [enderecoId, setEnderecoId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeItem, setActiveItem] = useState<Acompanhamento | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const enderecos = enderecosQuery.data ?? [];

  const modelos = modelosQuery.data ?? [];
  const pratos = useMemo(() => pratosQuery.data ?? [], [pratosQuery.data]);
  const produtos = useMemo(() => produtosQuery.data ?? [], [produtosQuery.data]);
  const bebidas = useMemo(() => produtos.filter((p) => p.categoria === "Bebidas"), [produtos]);
  const sobremesas = useMemo(
    () => produtos.filter((p) => p.categoria === "Sobremesas"),
    [produtos],
  );

  const cfg = modelos.find((m) => m.id === modeloId) ?? null;
  const totalPortions = plate.reduce((s, p) => s + p.qty, 0);
  const isFull = cfg ? totalPortions >= cfg.limiteAcompanhamentos : false;

  const filteredPratos = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = [...pratos].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    if (!q) return base;
    return base.filter(
      (m) => m.nome.toLowerCase().includes(q) || (m.descricao ?? "").toLowerCase().includes(q),
    );
  }, [pratos, search]);

  const foodTotal = cfg?.preco ?? 0;

  const beverageTotal = useMemo(() => {
    return Object.entries(beverages).reduce((s, [id, qty]) => {
      const b = bebidas.find((x) => x.id === Number(id));
      return b ? s + b.preco * qty : s;
    }, 0);
  }, [beverages, bebidas]);

  const extraTotal = useMemo(() => {
    return Object.entries(extras).reduce((s, [id, qty]) => {
      const e = sobremesas.find((x) => x.id === Number(id));
      return e ? s + e.preco * qty : s;
    }, 0);
  }, [extras, sobremesas]);

  const total = foodTotal + beverageTotal + extraTotal;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
  );

  function handleDragStart(e: DragStartEvent) {
    const it = e.active.data.current?.item as Acompanhamento | undefined;
    setActiveItem(it ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveItem(null);
    if (!cfg) return;
    if (e.over?.id !== "plate") return;
    const item = e.active.data.current?.item as Acompanhamento | undefined;
    if (!item) return;
    if (totalPortions >= cfg.limiteAcompanhamentos) {
      toast.error(
        `${cfg.nome} permite até ${cfg.limiteAcompanhamentos} porções de acompanhamentos.`,
      );
      return;
    }
    setPlate((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      toast.success(`${item.nome} adicionado ao bento`);
      return [...prev, { id: item.id, qty: 1 }];
    });
  }

  function removeOne(id: number) {
    setPlate((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p)).filter((p) => p.qty > 0),
    );
  }

  function adjBev(id: number, delta: number) {
    setBeverages((prev) => {
      const next = { ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  }

  function adjExtra(id: number, delta: number) {
    setExtras((prev) => {
      const next = { ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  }

  async function confirmOrder() {
    if (!user) {
      toast.info("Faça login para concluir o pedido");
      navigate({ to: "/login" });
      return;
    }
    if (!cfg) return;
    if (!payment) {
      toast.error("Selecione uma forma de pagamento");
      return;
    }
    if (payment === "Cartão Fidelidade" && !user.recompensaDisponivel) {
      toast.error("Você ainda não tem o cartão fidelidade completo.");
      return;
    }
    if (!tipoEntrega) {
      toast.error("Escolha entre entrega ou retirada");
      return;
    }
    if (tipoEntrega === "Entrega" && !enderecoId) {
      toast.error("Selecione um endereço de entrega");
      return;
    }

    setSubmitting(true);
    try {
      const pedido = await criarPedido({
        modeloMarmitaId: cfg.id,
        acompanhamentos: plate.map((p) => ({ acompanhamentoId: p.id, quantidade: p.qty })),
        produtos: [
          ...Object.entries(beverages).map(([id, qty]) => ({
            produtoId: Number(id),
            quantidade: qty,
          })),
          ...Object.entries(extras).map(([id, qty]) => ({
            produtoId: Number(id),
            quantidade: qty,
          })),
        ],
        metodoPagamento: payment,
        tipoEntrega,
        enderecoEntregaId: enderecoId ?? undefined,
      });
      toast.success(`Pedido #${pedido.id} confirmado!`);
      if (payment === "Cartão Fidelidade") store.refrescarPerfil();
      setPlate([]);
      setBeverages({});
      setExtras({});
      setPayment(null);
      setTipoEntrega(null);
      setEnderecoId(null);
      setModeloId(null);
      setStep("tamanho");
      navigate({ to: "/pedidos" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível confirmar o pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-24">
        <Stepper step={step} />

        {step === "tamanho" && (
          <StepTamanho
            modelos={modelos}
            isLoading={modelosQuery.isLoading}
            isError={modelosQuery.isError}
            current={modeloId}
            onSelect={(id) => {
              setModeloId(id);
              setStep("prato");
            }}
          />
        )}

        {step === "prato" && cfg && (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="mt-6 flex items-end justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Monte seu bento</h1>
                <p className="text-sm text-muted-foreground">
                  {cfg.nome} · {formatBRL(cfg.preco)} · até {cfg.limiteAcompanhamentos} porções de
                  acompanhamento
                </p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Porções no bento: </span>
                <span className={`font-bold ${isFull ? "text-primary" : ""}`}>
                  {totalPortions}/{cfg.limiteAcompanhamentos}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <div className="rounded-2xl bg-card border border-border p-4 order-2 lg:order-1">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pratos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[55vh] overflow-y-auto pr-1">
                  {filteredPratos.length === 0 && (
                    <p className="col-span-full text-sm text-muted-foreground text-center py-8">
                      Nenhum prato encontrado.
                    </p>
                  )}
                  {filteredPratos.map((item) => (
                    <DraggableItem key={item.id} item={item} disabled={isFull} />
                  ))}
                </div>
              </div>

              <div className="order-1 lg:order-2 flex flex-col items-center justify-start">
                <Bento items={plate} pratos={pratos} onRemove={removeOne} />
              </div>
            </div>

            <NavButtons
              onBack={() => setStep("tamanho")}
              onNext={() => {
                if (plate.length === 0) {
                  toast.error("Adicione pelo menos um prato");
                  return;
                }
                setStep("bebidas");
              }}
              nextLabel="Escolher bebidas e sobremesas"
            />

            <DragOverlay>
              {activeItem ? (
                <div className="flex items-center gap-3 rounded-xl border border-primary bg-card p-3 shadow-lg">
                  <span className="text-2xl">{getIngredientIcon(activeItem)}</span>
                  <span className="text-sm font-medium">{activeItem.nome}</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {step === "bebidas" && (
          <StepBebidas
            beverages={beverages}
            adj={adjBev}
            extras={extras}
            adjExtra={adjExtra}
            availableBeverages={bebidas}
            availableExtras={sobremesas}
          />
        )}
        {step === "bebidas" && (
          <NavButtons
            onBack={() => setStep("prato")}
            onNext={() => setStep("comanda")}
            nextLabel="Ir para comanda"
          />
        )}

        {step === "comanda" && cfg && (
          <StepComanda
            cfg={cfg}
            plate={plate}
            pratos={pratos}
            beverages={beverages}
            bebidas={bebidas}
            extras={extras}
            sobremesas={sobremesas}
            foodTotal={foodTotal}
            beverageTotal={beverageTotal}
            extraTotal={extraTotal}
            total={total}
            payment={payment}
            onPayment={setPayment}
            carimbos={user?.carimbos ?? 0}
            recompensaDisponivel={user?.recompensaDisponivel ?? false}
            tipoEntrega={tipoEntrega}
            onTipoEntrega={(t) => {
              setTipoEntrega(t);
              if (t === "Retirada") setEnderecoId(null);
            }}
            enderecos={enderecos}
            enderecosLoading={enderecosQuery.isLoading}
            enderecoId={enderecoId}
            onEnderecoId={setEnderecoId}
            onBack={() => setStep("bebidas")}
            onConfirm={confirmOrder}
            loggedIn={!!user}
            submitting={submitting}
          />
        )}
      </section>
    </SiteLayout>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "tamanho", label: "Tamanho" },
    { id: "prato", label: "Bento" },
    { id: "bebidas", label: "Bebidas" },
    { id: "comanda", label: "Comanda" },
  ];
  const idx = steps.findIndex((s) => s.id === step);
  return (
    <ol className="flex items-center gap-2 text-xs sm:text-sm">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full font-bold text-xs ${
              i <= idx ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {i < idx ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </span>
          <span className={i === idx ? "font-semibold" : "text-muted-foreground"}>{s.label}</span>
          {i < steps.length - 1 && <span className="text-muted-foreground/40">→</span>}
        </li>
      ))}
    </ol>
  );
}

function StepTamanho({
  modelos,
  isLoading,
  isError,
  current,
  onSelect,
}: {
  modelos: ModeloMarmita[];
  isLoading: boolean;
  isError: boolean;
  current: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="mt-8">
      <h1 className="text-3xl md:text-4xl font-bold">Qual o tamanho?</h1>
      <p className="text-muted-foreground mt-2">Escolha o tamanho do seu bento antes de montar.</p>
      {isLoading && (
        <p className="mt-8 text-center text-muted-foreground">Carregando tamanhos...</p>
      )}
      {isError && (
        <p className="mt-8 text-center text-destructive">
          Não foi possível carregar os tamanhos disponíveis.
        </p>
      )}
      {!isLoading && !isError && modelos.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Nenhum tamanho está disponível no momento.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modelos.map((m) => {
            const active = current === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelect(m.id)}
                className={`text-left rounded-2xl border p-5 transition-all hover:shadow-[var(--shadow-soft)] ${
                  active
                    ? "border-primary bg-secondary"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="text-lg font-bold text-primary">{formatBRL(m.preco)}</div>
                <div className="mt-2 font-semibold">{m.nome}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Até {m.limiteAcompanhamentos} porções de acompanhamento
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepBebidas({
  beverages,
  adj,
  extras,
  adjExtra,
  availableBeverages,
  availableExtras,
}: {
  beverages: Record<number, number>;
  adj: (id: number, delta: number) => void;
  extras: Record<number, number>;
  adjExtra: (id: number, delta: number) => void;
  availableBeverages: Produto[];
  availableExtras: Produto[];
}) {
  return (
    <div className="mt-6">
      <h1 className="text-2xl md:text-3xl font-bold">Bebidas e sobremesas</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Adicione complementos ao seu pedido (opcional).
      </p>

      {availableBeverages.length > 0 && (
        <>
          <h2 className="mt-6 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            Bebidas
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableBeverages.map((b) => {
              const qty = beverages[b.id] ?? 0;
              const active = qty > 0;
              return (
                <div
                  key={b.id}
                  className={`rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                    active ? "border-primary bg-secondary/40" : "border-border bg-card"
                  }`}
                >
                  {b.urlImagem ? (
                    <img
                      src={b.urlImagem}
                      alt={b.nome}
                      width={80}
                      height={80}
                      loading="lazy"
                      className="h-20 w-20 object-contain shrink-0"
                    />
                  ) : (
                    <span className="text-4xl shrink-0" aria-hidden>
                      {getIngredientIcon(b)}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{b.nome}</div>
                    <div className="text-sm text-primary font-bold">{formatBRL(b.preco)}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => adj(b.id, -1)}
                        disabled={qty === 0}
                        className="h-7 w-7 rounded-full bg-secondary text-foreground font-bold disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="min-w-6 text-center font-semibold">{qty}</span>
                      <button
                        onClick={() => adj(b.id, 1)}
                        className="h-7 w-7 rounded-full bg-primary text-primary-foreground font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {availableExtras.length > 0 && (
        <>
          <h2 className="mt-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            Sobremesas
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableExtras.map((e) => {
              const qty = extras[e.id] ?? 0;
              const active = qty > 0;
              return (
                <div
                  key={e.id}
                  className={`rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                    active ? "border-primary bg-secondary/40" : "border-border bg-card"
                  }`}
                >
                  {e.urlImagem ? (
                    <img
                      src={e.urlImagem}
                      alt={e.nome}
                      width={64}
                      height={64}
                      loading="lazy"
                      className="h-16 w-16 object-contain shrink-0"
                    />
                  ) : (
                    <span className="text-4xl shrink-0" aria-hidden>
                      {getIngredientIcon(e)}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{e.nome}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{e.descricao}</div>
                    <div className="text-sm text-primary font-bold mt-1">{formatBRL(e.preco)}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => adjExtra(e.id, -1)}
                        disabled={qty === 0}
                        className="h-7 w-7 rounded-full bg-secondary text-foreground font-bold disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="min-w-6 text-center font-semibold">{qty}</span>
                      <button
                        onClick={() => adjExtra(e.id, 1)}
                        className="h-7 w-7 rounded-full bg-primary text-primary-foreground font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {availableBeverages.length === 0 && availableExtras.length === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Nenhum complemento disponível no momento.
        </p>
      )}
    </div>
  );
}

function StepComanda({
  cfg,
  plate,
  pratos,
  beverages,
  bebidas,
  extras,
  sobremesas,
  foodTotal,
  beverageTotal,
  extraTotal,
  total,
  payment,
  onPayment,
  carimbos,
  recompensaDisponivel,
  tipoEntrega,
  onTipoEntrega,
  enderecos,
  enderecosLoading,
  enderecoId,
  onEnderecoId,
  onBack,
  onConfirm,
  loggedIn,
  submitting,
}: {
  cfg: ModeloMarmita;
  plate: PlateItem[];
  pratos: Acompanhamento[];
  beverages: Record<number, number>;
  bebidas: Produto[];
  extras: Record<number, number>;
  sobremesas: Produto[];
  foodTotal: number;
  beverageTotal: number;
  extraTotal: number;
  total: number;
  payment: MetodoPagamento | null;
  onPayment: (p: MetodoPagamento) => void;
  carimbos: number;
  recompensaDisponivel: boolean;
  tipoEntrega: TipoEntrega | null;
  onTipoEntrega: (t: TipoEntrega) => void;
  enderecos: Endereco[];
  enderecosLoading: boolean;
  enderecoId: number | null;
  onEnderecoId: (id: number) => void;
  onBack: () => void;
  onConfirm: () => void;
  loggedIn: boolean;
  submitting: boolean;
}) {
  const complementos = [
    ...Object.entries(beverages).map(([id, qty]) => ({
      item: bebidas.find((x) => x.id === Number(id)),
      qty,
    })),
    ...Object.entries(extras).map(([id, qty]) => ({
      item: sobremesas.find((x) => x.id === Number(id)),
      qty,
    })),
  ].filter((c): c is { item: Produto; qty: number } => !!c.item);
  const usandoFidelidade = payment === "Cartão Fidelidade";
  const totalExibido = usandoFidelidade ? total - foodTotal : total;
  return (
    <div className="mt-6">
      <h1 className="text-2xl md:text-3xl font-bold">Comanda</h1>
      <p className="text-sm text-muted-foreground mt-1">Revise seu pedido e escolha como pagar.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-semibold">Resumo do pedido</h2>
          <div className="mt-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Marmita</span>
              <span className="font-medium">
                {cfg.nome} ·{" "}
                {usandoFidelidade ? (
                  <>
                    <span className="line-through text-muted-foreground">
                      {formatBRL(cfg.preco)}
                    </span>{" "}
                    <span className="text-primary">Grátis</span>
                  </>
                ) : (
                  formatBRL(cfg.preco)
                )}
              </span>
            </div>

            <div className="pt-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Pratos escolhidos
              </div>
              <ul className="space-y-1.5">
                {plate.map((p) => {
                  const m = pratos.find((mm) => mm.id === p.id);
                  if (!m) return null;
                  return (
                    <li
                      key={p.id}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span>{getIngredientIcon(m)}</span>
                      <span>
                        {p.qty}× {m.nome}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {complementos.length > 0 && (
              <div className="pt-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Bebidas e sobremesas
                </div>
                <ul className="space-y-1.5">
                  {complementos.map(({ item, qty }) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{getIngredientIcon(item)}</span>
                        <span>
                          {qty}× {item.nome}
                        </span>
                      </span>
                      <span className="text-muted-foreground">{formatBRL(item.preco * qty)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-border space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Marmita</span>
                <span>{usandoFidelidade ? "Grátis" : formatBRL(foodTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bebidas e sobremesas</span>
                <span>{formatBRL(beverageTotal + extraTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl bg-card border border-border p-6 h-fit lg:sticky lg:top-20 shadow-[var(--shadow-soft)]">
          <h2 className="font-semibold">Entrega ou retirada?</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => onTipoEntrega("Retirada")}
              className={`rounded-xl border p-3 text-left transition-colors ${
                tipoEntrega === "Retirada"
                  ? "border-primary bg-secondary"
                  : "border-border hover:bg-secondary/50"
              }`}
            >
              <Store className="h-5 w-5 text-primary mb-1" />
              <div className="text-xs font-medium">Retirada</div>
            </button>
            <button
              onClick={() => onTipoEntrega("Entrega")}
              className={`rounded-xl border p-3 text-left transition-colors ${
                tipoEntrega === "Entrega"
                  ? "border-primary bg-secondary"
                  : "border-border hover:bg-secondary/50"
              }`}
            >
              <Truck className="h-5 w-5 text-primary mb-1" />
              <div className="text-xs font-medium">Entrega</div>
            </button>
          </div>

          {tipoEntrega === "Entrega" && (
            <div className="mt-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Endereço
              </div>
              {enderecosLoading ? (
                <p className="text-xs text-muted-foreground">Carregando endereços...</p>
              ) : enderecos.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum endereço cadastrado.{" "}
                  <Link to="/conta" className="text-primary underline">
                    Cadastrar endereço
                  </Link>
                </p>
              ) : (
                <div className="space-y-2">
                  {enderecos.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => onEnderecoId(e.id)}
                      className={`w-full text-left rounded-xl border p-2.5 text-xs transition-colors ${
                        enderecoId === e.id
                          ? "border-primary bg-secondary"
                          : "border-border hover:bg-secondary/50"
                      }`}
                    >
                      <div className="font-medium">
                        {e.rua}, {e.numero}
                      </div>
                      <div className="text-muted-foreground">{e.bairro}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <h2 className="font-semibold mt-5 pt-5 border-t border-border">Forma de pagamento</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((p) => {
              const Icon = p.icon;
              const active = payment === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onPayment(p.id)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    active ? "border-primary bg-secondary" : "border-border hover:bg-secondary/50"
                  }`}
                >
                  <Icon className="h-5 w-5 text-primary mb-1" />
                  <div className="text-xs font-medium">{p.label}</div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => recompensaDisponivel && onPayment("Cartão Fidelidade")}
            disabled={!recompensaDisponivel}
            className={`mt-2 w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
              !recompensaDisponivel
                ? "opacity-50 cursor-not-allowed border-border"
                : payment === "Cartão Fidelidade"
                  ? "border-primary bg-secondary"
                  : "border-border hover:bg-secondary/50"
            }`}
          >
            <Gift className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium">Cartão Fidelidade</div>
              <div className="text-[10px] text-muted-foreground">
                {recompensaDisponivel
                  ? "Marmita grátis disponível · resto do pedido fica pendente"
                  : `${carimbos}/${MAX_CARIMBOS} pontos`}
              </div>
            </div>
          </button>

          <div className="mt-5 pt-4 border-t border-border flex justify-between text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-primary">{formatBRL(totalExibido)}</span>
          </div>

          <Button
            onClick={onConfirm}
            className="w-full mt-4 rounded-full"
            size="lg"
            disabled={
              !payment || !tipoEntrega || (tipoEntrega === "Entrega" && !enderecoId) || submitting
            }
          >
            {submitting ? "Enviando..." : "Confirmar pedido"}
          </Button>
          <button
            onClick={onBack}
            className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" /> Voltar
          </button>

          {!loggedIn && (
            <p className="text-xs text-center text-muted-foreground mt-3">
              É necessário estar logado.{" "}
              <Link to="/login" className="text-primary underline">
                Entrar
              </Link>
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      <Button variant="ghost" onClick={onBack} className="rounded-full">
        <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
      </Button>
      <Button onClick={onNext} className="rounded-full" size="lg">
        {nextLabel} <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
