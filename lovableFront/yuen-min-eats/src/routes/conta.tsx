import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { store, useStore } from "@/lib/store";
import { formatBRL } from "@/lib/menu-data";
import { listarMeusPedidos } from "@/lib/api/pedidos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Minha Conta · YuWebMin" },
      {
        name: "description",
        content: "Gerencie seu perfil, endereço e cartão fidelidade no YuWebMin.",
      },
    ],
  }),
  component: ContaPage,
});

function ContaPage() {
  const navigate = useNavigate();
  const user = useStore(() => store.getUser());
  const pedidosQuery = useQuery({
    queryKey: ["meus-pedidos"],
    queryFn: listarMeusPedidos,
    enabled: !!user,
  });
  const orders = pedidosQuery.data ?? [];
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAddress(localStorage.getItem("yuwm:address") ?? "");
    }
  }, []);

  if (!user) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Você não está logado</h1>
          <p className="text-muted-foreground mt-2">Entre para acessar sua área.</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/login">Entrar</Link>
          </Button>
        </section>
      </SiteLayout>
    );
  }

  function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("yuwm:address", address);
    toast.success("Endereço salvo");
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-16">
        <div
          className="rounded-3xl p-8 text-primary-foreground"
          style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.82 0.14 70))" }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-card text-primary flex items-center justify-center text-2xl font-bold shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">Olá, {user.name}!</h1>
              <p className="opacity-90 text-sm truncate">{user.email}</p>
            </div>
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => {
                store.logout();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Cartão Fidelidade</h2>
            </div>
            <div
              className="rounded-xl p-5 text-card"
              style={{ background: "var(--gradient-warm)" }}
            >
              <div className="text-xs uppercase tracking-wider text-foreground/60">
                Pontos acumulados
              </div>
              <div className="text-4xl font-bold text-foreground mt-1">{user.points}</div>
              <div className="text-xs text-foreground/70 mt-2">
                Faltam {Math.max(0, 200 - user.points)} pontos para o próximo brinde 🎁
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(100, (user.points / 200) * 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Endereço de entrega</h2>
            </div>
            <form onSubmit={saveAddress} className="space-y-3">
              <div>
                <Label htmlFor="address">Rua, número, bairro</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Rua das Flores, 123 - Centro"
                />
              </div>
              <Button type="submit" className="rounded-full">
                Salvar endereço
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Pedidos recentes</h2>
            <Link to="/pedidos" className="text-sm text-primary hover:underline">
              Ver todos →
            </Link>
          </div>
          {pedidosQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Você ainda não fez pedidos.</p>
          ) : (
            <ul className="divide-y divide-border">
              {orders.slice(0, 3).map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">#{o.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(o.dataPedido).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {formatBRL(o.valorTotal)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
