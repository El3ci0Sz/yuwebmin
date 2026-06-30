import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import { store, useStore, type SizeKey, type PaymentMethod } from "@/lib/store";
import {
  MENU,
  BEVERAGES,
  EXTRAS,
  formatBRL,
  getIngredientIcon,
  type MenuItem,
  type Beverage,
  type Extra,
} from "@/lib/menu-data";
import { toast } from "sonner";
import { Search, ArrowLeft, ArrowRight, Check, X, Wallet, CreditCard, Banknote, QrCode } from "lucide-react";
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

const SIZES: Record<SizeKey, { label: string; maxTypes: number; portion: number; desc: string }> = {
  P: { label: "Marmita P", maxTypes: 4, portion: 1, desc: "Até 4 tipos · 1 porção cada" },
  M: { label: "Marmita M", maxTypes: 6, portion: 1.5, desc: "Até 6 tipos · 1,5 porções cada" },
  G: { label: "Marmita G", maxTypes: 8, portion: 2, desc: "Até 8 tipos · 2 porções cada" },
  Personalizado: { label: "Personalizado", maxTypes: 99, portion: 1, desc: "Quantos pratos quiser · R$ 59,90/kg" },
};

type PlateItem = { id: string; qty: number };
type Step = "tamanho" | "prato" | "bebidas" | "comanda";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { id: "Pix", label: "Pix", icon: QrCode },
  { id: "Crédito", label: "Cartão de Crédito", icon: CreditCard },
  { id: "Débito", label: "Cartão de Débito", icon: Wallet },
  { id: "Dinheiro", label: "Dinheiro", icon: Banknote },
];

function DraggableItem({ item, disabled }: { item: MenuItem; disabled: boolean }) {
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
      <span className="text-2xl shrink-0" aria-hidden>{getIngredientIcon(item)}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium truncate">{item.name}</span>
        <span className="block text-xs text-muted-foreground">{formatBRL(item.price)}</span>
      </span>
    </button>
  );
}

function Bento({
  items,
  onRemove,
}: {
  items: PlateItem[];
  onRemove: (id: string) => void;
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
            const item = MENU.find((m) => m.id === p.id);
            if (!item) return null;
            return (
              <li key={p.id}>
                <button
                  onClick={() => onRemove(p.id)}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-secondary text-foreground px-3 py-1.5 text-xs font-medium hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label={`Remover ${item.name}`}
                >
                  <span className="text-base">{getIngredientIcon(item)}</span>
                  <span className="truncate max-w-[120px]">{item.name}</span>
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
  const cardapio = useStore(() => store.getCardapioConfig());

  const [step, setStep] = useState<Step>("tamanho");
  const [size, setSize] = useState<SizeKey | null>(null);
  const [plate, setPlate] = useState<PlateItem[]>([]);
  const [beverages, setBeverages] = useState<Record<string, number>>({});
  const [extras, setExtras] = useState<Record<string, number>>({});
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [search, setSearch] = useState("");
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);

  const cfg = size ? SIZES[size] : null;
  const typesCount = plate.length;
  const isFull = cfg ? typesCount >= cfg.maxTypes : false;

  const availableSizes = useMemo<SizeKey[]>(
    () => (["P", "M", "G", "Personalizado"] as SizeKey[]).filter((k) => cardapio.activeSizes.includes(k)),
    [cardapio.activeSizes]
  );

  const foodItems = useMemo(
    () => MENU.filter((m) => m.category !== "Bebidas" && cardapio.activeMenuIds.includes(m.id)),
    [cardapio.activeMenuIds]
  );

  const availableBeverages = useMemo(
    () => BEVERAGES.filter((b) => cardapio.activeBeverageIds.includes(b.id)),
    [cardapio.activeBeverageIds]
  );
  const availableExtras = useMemo(
    () => EXTRAS.filter((e) => cardapio.activeExtraIds.includes(e.id)),
    [cardapio.activeExtraIds]
  );


  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = [...foodItems].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (!q) return base;
    return base.filter((m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
  }, [foodItems, search]);

  const foodTotal = useMemo(() => {
    if (!cfg) return 0;
    return plate.reduce((s, p) => {
      const item = MENU.find((m) => m.id === p.id);
      if (!item) return s;
      return s + item.price * p.qty * cfg.portion;
    }, 0);
  }, [plate, cfg]);

  const beverageTotal = useMemo(() => {
    return Object.entries(beverages).reduce((s, [id, qty]) => {
      const b = BEVERAGES.find((x) => x.id === id);
      return b ? s + b.price * qty : s;
    }, 0);
  }, [beverages]);

  const extraTotal = useMemo(() => {
    return Object.entries(extras).reduce((s, [id, qty]) => {
      const e = EXTRAS.find((x) => x.id === id);
      return e ? s + e.price * qty : s;
    }, 0);
  }, [extras]);

  const total = foodTotal + beverageTotal + extraTotal;


  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
  );

  function handleDragStart(e: DragStartEvent) {
    const it = e.active.data.current?.item as MenuItem | undefined;
    setActiveItem(it ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveItem(null);
    if (!cfg) return;
    if (e.over?.id !== "plate") return;
    const item = e.active.data.current?.item as MenuItem | undefined;
    if (!item) return;
    setPlate((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      if (prev.length >= cfg.maxTypes) {
        toast.error(`${cfg.label} permite até ${cfg.maxTypes} tipos.`);
        return prev;
      }
      toast.success(`${item.name} adicionado ao bento`);
      return [...prev, { id: item.id, qty: 1 }];
    });
  }

  function removeOne(id: string) {
    setPlate((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p)).filter((p) => p.qty > 0)
    );
  }

  function adjBev(id: string, delta: number) {
    setBeverages((prev) => {
      const next = { ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  }

  function adjExtra(id: string, delta: number) {
    setExtras((prev) => {
      const next = { ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  }

  function confirmOrder() {
    if (!user) {
      toast.info("Faça login para concluir o pedido");
      navigate({ to: "/login" });
      return;
    }
    if (!size || !cfg) return;
    if (!payment) {
      toast.error("Selecione uma forma de pagamento");
      return;
    }

    const foodCart = plate.map((p) => {
      const m = MENU.find((mm) => mm.id === p.id)!;
      return { id: m.id, name: m.name, price: m.price, emoji: getIngredientIcon(m), qty: p.qty };
    });
    const bevCart = Object.entries(beverages).map(([id, qty]) => {
      const b = BEVERAGES.find((x) => x.id === id)!;
      return { id: b.id, name: b.name, price: b.price, emoji: "🥤", qty };
    });
    const extraCart = Object.entries(extras).map(([id, qty]) => {
      const e = EXTRAS.find((x) => x.id === id)!;
      return { id: e.id, name: e.name, price: e.price, emoji: e.emoji, qty };
    });

    // Apply portion multiplier only to food items
    const scaledFood = foodCart.map((i) => ({ ...i, price: +(i.price * cfg.portion).toFixed(2) }));
    const allItems = [...scaledFood, ...bevCart, ...extraCart];

    const o = store.placeCustomOrder(allItems, size, 1, payment);
    toast.success(`Pedido ${o.id} confirmado!`);
    setPlate([]);
    setBeverages({});
    setExtras({});
    setPayment(null);
    setSize(null);
    setStep("tamanho");
    navigate({ to: "/pedidos" });
  }


  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-24">
        <Stepper step={step} />

        {step === "tamanho" && (
          <StepTamanho
            current={size}
            available={availableSizes}
            onSelect={(s) => {
              setSize(s);
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
                  {cfg.label} · {cfg.desc}
                </p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Pratos no bento: </span>
                <span className={`font-bold ${isFull ? "text-primary" : ""}`}>
                  {typesCount}
                  {size !== "Personalizado" && `/${cfg.maxTypes}`}
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
                  {filteredMenu.length === 0 && (
                    <p className="col-span-full text-sm text-muted-foreground text-center py-8">
                      Nenhum prato encontrado.
                    </p>
                  )}
                  {filteredMenu.map((item) => (
                    <DraggableItem
                      key={item.id}
                      item={item}
                      disabled={isFull && !plate.find((p) => p.id === item.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="order-1 lg:order-2 flex flex-col items-center justify-start">
                <Bento items={plate} onRemove={removeOne} />
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
              nextLabel="Escolher bebidas"
            />

            <DragOverlay>
              {activeItem ? (
                <div className="flex items-center gap-3 rounded-xl border border-primary bg-card p-3 shadow-lg">
                  <span className="text-2xl">{getIngredientIcon(activeItem)}</span>
                  <span className="text-sm font-medium">{activeItem.name}</span>
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
            availableBeverages={availableBeverages}
            availableExtras={availableExtras}
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
            size={size!}
            sizeLabel={cfg.label}
            portion={cfg.portion}
            plate={plate}
            beverages={beverages}
            foodTotal={foodTotal}
            beverageTotal={beverageTotal}
            total={total}
            payment={payment}
            onPayment={setPayment}
            onBack={() => setStep("bebidas")}
            onConfirm={confirmOrder}
            loggedIn={!!user}
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

function StepTamanho({ current, available, onSelect }: { current: SizeKey | null; available: SizeKey[]; onSelect: (s: SizeKey) => void }) {
  return (
    <div className="mt-8">
      <h1 className="text-3xl md:text-4xl font-bold">Qual o tamanho?</h1>
      <p className="text-muted-foreground mt-2">Escolha o tamanho do seu bento antes de montar.</p>
      {available.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Nenhum tamanho está disponível no momento.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {available.map((k) => {
            const cfg = SIZES[k];
            const active = current === k;
            return (
              <button
                key={k}
                onClick={() => onSelect(k)}
                className={`text-left rounded-2xl border p-5 transition-all hover:shadow-[var(--shadow-soft)] ${
                  active ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="text-2xl font-bold text-primary">
                  {k === "Personalizado" ? "★" : k}
                </div>
                <div className="mt-2 font-semibold">{cfg.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{cfg.desc}</div>
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
  beverages: Record<string, number>;
  adj: (id: string, delta: number) => void;
  extras: Record<string, number>;
  adjExtra: (id: string, delta: number) => void;
  availableBeverages: Beverage[];
  availableExtras: Extra[];
}) {
  return (
    <div className="mt-6">
      <h1 className="text-2xl md:text-3xl font-bold">Bebidas e sobremesas</h1>
      <p className="text-sm text-muted-foreground mt-1">Adicione complementos ao seu pedido (opcional).</p>

      {availableBeverages.length > 0 && (
        <>
          <h2 className="mt-6 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Bebidas</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableBeverages.map((b: Beverage) => {
              const qty = beverages[b.id] ?? 0;
              const active = qty > 0;
              return (
                <div
                  key={b.id}
                  className={`rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                    active ? "border-primary bg-secondary/40" : "border-border bg-card"
                  }`}
                >
                  <img
                    src={b.image}
                    alt={b.name}
                    width={80}
                    height={80}
                    loading="lazy"
                    className="h-20 w-20 object-contain shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{b.name}</div>
                    <div className="text-sm text-primary font-bold">{formatBRL(b.price)}</div>
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
          <h2 className="mt-8 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Sobremesas</h2>
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
                  <span className="text-4xl shrink-0" aria-hidden>{e.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{e.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{e.description}</div>
                    <div className="text-sm text-primary font-bold mt-1">{formatBRL(e.price)}</div>
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
  size,
  sizeLabel,
  portion,
  plate,
  beverages,
  foodTotal,
  beverageTotal,
  total,
  payment,
  onPayment,
  onBack,
  onConfirm,
  loggedIn,
}: {
  size: SizeKey;
  sizeLabel: string;
  portion: number;
  plate: PlateItem[];
  beverages: Record<string, number>;
  foodTotal: number;
  beverageTotal: number;
  total: number;
  payment: PaymentMethod | null;
  onPayment: (p: PaymentMethod) => void;
  onBack: () => void;
  onConfirm: () => void;
  loggedIn: boolean;
}) {
  return (
    <div className="mt-6">
      <h1 className="text-2xl md:text-3xl font-bold">Comanda</h1>
      <p className="text-sm text-muted-foreground mt-1">Revise seu pedido e escolha como pagar.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-semibold">Resumo do pedido</h2>
          <div className="mt-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Tamanho</span>
              <span className="font-medium">{sizeLabel}</span>
            </div>

            <div className="pt-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Pratos</div>
              <ul className="space-y-1.5">
                {plate.map((p) => {
                  const m = MENU.find((mm) => mm.id === p.id);
                  if (!m) return null;
                  const unit = +(m.price * portion).toFixed(2);
                  return (
                    <li key={p.id} className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{getIngredientIcon(m)}</span>
                        <span>{p.qty}× {m.name}</span>
                      </span>
                      <span className="text-muted-foreground">{formatBRL(unit * p.qty)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {Object.keys(beverages).length > 0 && (
              <div className="pt-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Bebidas</div>
                <ul className="space-y-1.5">
                  {Object.entries(beverages).map(([id, qty]) => {
                    const b = BEVERAGES.find((x) => x.id === id);
                    if (!b) return null;
                    return (
                      <li key={id} className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span>🥤</span>
                          <span>{qty}× {b.name}</span>
                        </span>
                        <span className="text-muted-foreground">{formatBRL(b.price * qty)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-border space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pratos</span>
                <span>{formatBRL(foodTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bebidas</span>
                <span>{formatBRL(beverageTotal)}</span>
              </div>
            </div>

            {size === "Personalizado" && (
              <p className="mt-3 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
                * Pedido personalizado: o preço final dos pratos é pesado no balcão a <strong>R$ 59,90/kg</strong>.
              </p>
            )}
          </div>
        </div>

        <aside className="rounded-2xl bg-card border border-border p-6 h-fit lg:sticky lg:top-20 shadow-[var(--shadow-soft)]">
          <h2 className="font-semibold">Forma de pagamento</h2>
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

          <div className="mt-5 pt-4 border-t border-border flex justify-between text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-primary">{formatBRL(total)}</span>
          </div>

          <Button onClick={onConfirm} className="w-full mt-4 rounded-full" size="lg" disabled={!payment}>
            Confirmar pedido
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
              <Link to="/login" className="text-primary underline">Entrar</Link>
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
