import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { MAX_CARIMBOS, store, useStore } from "@/lib/store";
import { formatBRL } from "@/lib/menu-data";
import { listarMeusPedidos } from "@/lib/api/pedidos";
import { adicionarEndereco, listarMeusEnderecos } from "@/lib/api/enderecos";
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

  // O carimbo/cupom fidelidade muda no servidor (ex.: quando um pedido é
  // concluído) sem o front saber, então rebusca o perfil ao abrir a página.
  useEffect(() => {
    store.refrescarPerfil();
  }, []);

  const pedidosQuery = useQuery({
    queryKey: ["meus-pedidos"],
    queryFn: listarMeusPedidos,
    enabled: !!user,
  });
  const orders = pedidosQuery.data ?? [];

  const queryClient = useQueryClient();
  const enderecosQuery = useQuery({
    queryKey: ["meus-enderecos"],
    queryFn: listarMeusEnderecos,
    enabled: !!user,
  });
  const enderecos = enderecosQuery.data ?? [];

  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cep, setCep] = useState("");
  const [complemento, setComplemento] = useState("");

  const adicionarEnderecoMutation = useMutation({
    mutationFn: adicionarEndereco,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meus-enderecos"] });
      setRua("");
      setNumero("");
      setBairro("");
      setCep("");
      setComplemento("");
      toast.success("Endereço adicionado");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar o endereço.");
    },
  });

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

  function submitEndereco(e: React.FormEvent) {
    e.preventDefault();
    adicionarEnderecoMutation.mutate({
      rua: rua.trim(),
      numero: numero.trim(),
      bairro: bairro.trim(),
      cep: cep.trim() || undefined,
      complemento: complemento.trim() || undefined,
    });
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
            {user.recompensaDisponivel ? (
              <div
                className="rounded-xl p-5 text-card"
                style={{ background: "var(--gradient-warm)" }}
              >
                <div className="text-xs uppercase tracking-wider text-foreground/60">
                  Cupom disponível
                </div>
                <div className="text-2xl font-bold text-foreground mt-1">
                  Sua próxima marmita sai grátis! 🎁
                </div>
                <div className="text-xs text-foreground/70 mt-2">
                  O desconto é aplicado automaticamente no próximo pedido.
                </div>
              </div>
            ) : (
              <>
                <div
                  className="rounded-xl p-5 text-card"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  <div className="text-xs uppercase tracking-wider text-foreground/60">
                    Carimbos
                  </div>
                  <div className="text-4xl font-bold text-foreground mt-1">
                    {user.carimbos}/{MAX_CARIMBOS}
                  </div>
                  <div className="text-xs text-foreground/70 mt-2">
                    Faltam {Math.max(0, MAX_CARIMBOS - user.carimbos)} pedido(s) concluído(s) para
                    ganhar uma marmita grátis 🎁
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, (user.carimbos / MAX_CARIMBOS) * 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Endereços de entrega</h2>
            </div>

            {enderecosQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando endereços...</p>
            ) : enderecos.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {enderecos.map((e) => (
                  <li key={e.id} className="rounded-xl border border-border p-3 text-sm">
                    <div className="font-medium">
                      {e.rua}, {e.numero}
                    </div>
                    <div className="text-muted-foreground">
                      {e.bairro}
                      {e.complemento && ` · ${e.complemento}`}
                      {e.cep && ` · CEP ${e.cep}`}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                Nenhum endereço cadastrado ainda.
              </p>
            )}

            <form onSubmit={submitEndereco} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="rua">Rua</Label>
                  <Input
                    id="rua"
                    value={rua}
                    onChange={(e) => setRua(e.target.value)}
                    placeholder="Rua das Flores"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="123"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Centro"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cep">CEP (opcional)</Label>
                  <Input
                    id="cep"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
                <div>
                  <Label htmlFor="complemento">Complemento (opcional)</Label>
                  <Input
                    id="complemento"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    placeholder="Apto 101"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="rounded-full"
                disabled={adicionarEnderecoMutation.isPending}
              >
                {adicionarEnderecoMutation.isPending ? "Salvando..." : "Adicionar endereço"}
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
