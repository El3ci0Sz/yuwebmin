import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { store, useStore, type CardapioConfig, type SizeKey } from "@/lib/store";
import { MENU, BEVERAGES, EXTRAS, formatBRL, getIngredientIcon } from "@/lib/menu-data";
import { toast } from "sonner";
import { Save, RotateCcw, Pin, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/cardapio")({
  head: () => ({
    meta: [
      { title: "Gestão de Cardápio · YuWebMin Admin" },
      { name: "description", content: "Configure tamanhos, pratos, bebidas e adicionais disponíveis." },
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

const SIZE_INFO: Record<SizeKey, { label: string; desc: string }> = {
  P: { label: "Marmita P", desc: "Até 4 tipos · 1 porção cada" },
  M: { label: "Marmita M", desc: "Até 6 tipos · 1,5 porções cada" },
  G: { label: "Marmita G", desc: "Até 8 tipos · 2 porções cada" },
  Personalizado: { label: "Personalizado", desc: "Quantos pratos quiser · R$ 59,90/kg" },
};

function AdminCardapio() {
  const isAdmin = useStore(() => store.isAdmin());
  const saved = useStore(() => store.getCardapioConfig());
  const [draft, setDraft] = useState<CardapioConfig>(saved);

  useEffect(() => { setDraft(saved); }, [saved.activeMenuIds.length, saved.activeBeverageIds.length, saved.activeExtraIds.length, saved.activeSizes.length]);

  if (!isAdmin) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-3xl px-4 py-20 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold mt-3">Acesso restrito</h1>
          <p className="text-muted-foreground mt-2">Esta área é exclusiva para administradores.</p>
          <Link to="/login" className="inline-block mt-6"><Button>Entrar</Button></Link>
        </section>
      </SiteLayout>
    );
  }

  const pratos = useMemo(() => MENU.filter((m) => m.category !== "Bebidas"), []);
  const fixos = pratos.filter((p) => p.isFixed);
  const variaveis = pratos.filter((p) => !p.isFixed);

  const dirty =
    JSON.stringify([...draft.activeSizes].sort()) !== JSON.stringify([...saved.activeSizes].sort()) ||
    JSON.stringify([...draft.activeMenuIds].sort()) !== JSON.stringify([...saved.activeMenuIds].sort()) ||
    JSON.stringify([...draft.activeBeverageIds].sort()) !== JSON.stringify([...saved.activeBeverageIds].sort()) ||
    JSON.stringify([...draft.activeExtraIds].sort()) !== JSON.stringify([...saved.activeExtraIds].sort());

  function toggleSize(k: SizeKey) {
    setDraft((d) => ({
      ...d,
      activeSizes: d.activeSizes.includes(k) ? d.activeSizes.filter((x) => x !== k) : [...d.activeSizes, k],
    }));
  }
  function toggleMenu(id: string) {
    setDraft((d) => ({
      ...d,
      activeMenuIds: d.activeMenuIds.includes(id) ? d.activeMenuIds.filter((x) => x !== id) : [...d.activeMenuIds, id],
    }));
  }
  function toggleBev(id: string) {
    setDraft((d) => ({
      ...d,
      activeBeverageIds: d.activeBeverageIds.includes(id) ? d.activeBeverageIds.filter((x) => x !== id) : [...d.activeBeverageIds, id],
    }));
  }
  function toggleExtra(id: string) {
    setDraft((d) => ({
      ...d,
      activeExtraIds: d.activeExtraIds.includes(id) ? d.activeExtraIds.filter((x) => x !== id) : [...d.activeExtraIds, id],
    }));
  }

  function save() {
    store.setCardapioConfig(draft);
    toast.success("Cardápio atualizado");
  }
  function reset() {
    store.resetCardapioConfig();
    toast.info("Cardápio restaurado para o padrão");
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 pt-8 pb-24">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">Admin</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">Gestão de Cardápio</h1>
            <p className="text-muted-foreground mt-1 text-sm">Defina o que estará disponível hoje para os clientes montarem suas marmitas.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={reset} className="rounded-full">
              <RotateCcw className="h-4 w-4 mr-1" /> Restaurar padrão
            </Button>
            <Button onClick={save} disabled={!dirty} className="rounded-full">
              <Save className="h-4 w-4 mr-1" /> Salvar alterações
            </Button>
          </div>
        </div>

        {/* CAMPO 1 — Tamanhos */}
        <Section
          number="1"
          title="Tamanhos de marmita disponíveis"
          subtitle="Esta configuração raramente muda. Use somente em promoções ou ajustes emergenciais."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(SIZE_INFO) as SizeKey[]).map((k) => {
              const active = draft.activeSizes.includes(k);
              const info = SIZE_INFO[k];
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggleSize(k)}
                  className={`text-left rounded-2xl border p-4 transition-all ${
                    active ? "border-primary bg-secondary shadow-[var(--shadow-soft)]" : "border-border bg-card opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">{k === "Personalizado" ? "★" : k}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div className="mt-2 font-semibold text-sm">{info.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{info.desc}</div>
                </button>
              );
            })}
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
              {BEVERAGES.map((b) => {
                const active = draft.activeBeverageIds.includes(b.id);
                return (
                  <Row
                    key={b.id}
                    leading={<img src={b.image} alt="" className="h-10 w-10 object-contain" />}
                    title={b.name}
                    meta={formatBRL(b.price)}
                    active={active}
                    onToggle={() => toggleBev(b.id)}
                  />
                );
              })}
            </div>
          </SubGroup>

          <SubGroup title="Sobremesas">
            <div className="grid gap-2 sm:grid-cols-2">
              {EXTRAS.map((e) => {
                const active = draft.activeExtraIds.includes(e.id);
                return (
                  <Row
                    key={e.id}
                    leading={<span className="text-3xl">{e.emoji}</span>}
                    title={e.name}
                    description={e.description}
                    meta={formatBRL(e.price)}
                    active={active}
                    onToggle={() => toggleExtra(e.id)}
                  />
                );
              })}
            </div>
          </SubGroup>
        </Section>

        {/* CAMPO 3 — Pratos */}
        <Section
          number="3"
          title="Pratos do restaurante"
          subtitle="Selecione os pratos que estarão disponíveis hoje para montar a marmita. Itens fixos já vêm ativos."
        >
          <SubGroup title="Itens fixos (servidos todos os dias)" icon={<Pin className="h-3.5 w-3.5" />}>
            <div className="grid gap-2 sm:grid-cols-2">
              {fixos.map((m) => {
                const active = draft.activeMenuIds.includes(m.id);
                return (
                  <Row
                    key={m.id}
                    leading={<span className="text-2xl">{getIngredientIcon(m)}</span>}
                    title={m.name}
                    description={m.description}
                    meta={formatBRL(m.price)}
                    active={active}
                    onToggle={() => toggleMenu(m.id)}
                    fixed
                  />
                );
              })}
            </div>
          </SubGroup>

          <SubGroup title="Itens variáveis (somente se houver hoje)">
            <div className="grid gap-2 sm:grid-cols-2">
              {variaveis.map((m) => {
                const active = draft.activeMenuIds.includes(m.id);
                return (
                  <Row
                    key={m.id}
                    leading={<span className="text-2xl">{getIngredientIcon(m)}</span>}
                    title={m.name}
                    description={m.description}
                    meta={formatBRL(m.price)}
                    active={active}
                    onToggle={() => toggleMenu(m.id)}
                  />
                );
              })}
            </div>
          </SubGroup>
        </Section>

        {dirty && (
          <div className="sticky bottom-4 mt-8 mx-auto max-w-xl rounded-full bg-card border border-primary/40 shadow-[var(--shadow-warm)] px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-sm">Você tem alterações não salvas.</span>
            <Button size="sm" onClick={save} className="rounded-full">
              <Save className="h-4 w-4 mr-1" /> Salvar
            </Button>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function Section({ number, title, subtitle, children }: { number: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <div className="flex items-start gap-3 mb-4">
        <span className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">{number}</span>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="rounded-2xl bg-card border border-border p-5">{children}</div>
    </div>
  );
}

function SubGroup({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
        {icon}{title}
      </div>
      {children}
    </div>
  );
}

function Row({
  leading, title, description, meta, active, onToggle, fixed,
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
    <div className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${active ? "border-primary/40 bg-secondary/40" : "border-border bg-background"}`}>
      <div className="shrink-0 h-10 w-10 flex items-center justify-center">{leading}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{title}</span>
          {fixed && <span className="text-[10px] uppercase tracking-wider bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">Fixo</span>}
        </div>
        {description && <div className="text-xs text-muted-foreground line-clamp-1">{description}</div>}
        {meta && <div className="text-xs text-primary font-semibold mt-0.5">{meta}</div>}
      </div>
      <Switch checked={active} onCheckedChange={onToggle} />
    </div>
  );
}
