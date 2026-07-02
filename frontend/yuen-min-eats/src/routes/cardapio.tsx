import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { formatBRL, getIngredientIcon } from "@/lib/menu-data";
import { listarAcompanhamentosAtivos, listarProdutosAtivos } from "@/lib/api/cardapio";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/store";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cardapio")({
  head: () => ({
    meta: [
      { title: "Cardápio · YuWebMin" },
      {
        name: "description",
        content:
          "Explore o cardápio vegetariano do Yuen Min: marmitas, pratos asiáticos, entradas e bebidas.",
      },
    ],
  }),
  component: Cardapio,
});

const CATS = ["Todos", "Pratos", "Bebidas", "Sobremesas"] as const;

type Item = {
  key: string;
  nome: string;
  descricao: string;
  emoji: string;
  urlImagem?: string;
  preco?: number;
  cat: (typeof CATS)[number];
  onAdd?: () => void;
};

function Cardapio() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("Todos");

  const pratosQuery = useQuery({
    queryKey: ["acompanhamentos-ativos"],
    queryFn: () => listarAcompanhamentosAtivos(),
  });
  const produtosQuery = useQuery({
    queryKey: ["produtos-ativos"],
    queryFn: () => listarProdutosAtivos(),
  });

  const isLoading = pratosQuery.isLoading || produtosQuery.isLoading;
  const isError = pratosQuery.isError || produtosQuery.isError;

  const items: Item[] = useMemo(() => {
    const pratos: Item[] = (pratosQuery.data ?? []).map((p) => ({
      key: `prato-${p.id}`,
      nome: p.nome,
      descricao: p.descricao ?? "",
      emoji: getIngredientIcon(p),
      cat: "Pratos",
    }));

    const produtos: Item[] = (produtosQuery.data ?? []).map((p) => ({
      key: `produto-${p.id}`,
      nome: p.nome,
      descricao: p.descricao ?? "",
      emoji: getIngredientIcon(p),
      urlImagem: p.urlImagem,
      preco: p.preco,
      cat: p.categoria === "Bebidas" ? "Bebidas" : "Sobremesas",
      onAdd: () => {
        store.addToCart({
          id: `produto-${p.id}`,
          name: p.nome,
          price: p.preco,
          emoji: getIngredientIcon(p),
        });
        toast.success(`${p.nome} adicionado ao carrinho`);
      },
    }));

    const all = [...pratos, ...produtos];
    return cat === "Todos" ? all : all.filter((i) => i.cat === cat);
  }, [pratosQuery.data, produtosQuery.data, cat]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold">Cardápio</h1>
        <p className="text-muted-foreground mt-2">Escolha seus favoritos e monte seu pedido.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                cat === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground/80 border-border hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        {isLoading && (
          <p className="text-center text-muted-foreground py-10">Carregando cardápio...</p>
        )}
        {isError && (
          <p className="text-center text-destructive py-10">
            Não foi possível carregar o cardápio agora. Tente novamente em instantes.
          </p>
        )}

        {!isLoading && !isError && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <article
                key={item.key}
                className="rounded-2xl bg-card border border-border p-5 flex flex-col shadow-[var(--shadow-soft)]"
              >
                {item.urlImagem ? (
                  <img
                    src={item.urlImagem}
                    alt={item.nome}
                    className="h-20 w-20 object-contain mb-3"
                  />
                ) : (
                  <div className="text-5xl mb-3">{item.emoji}</div>
                )}
                <h3 className="font-semibold">{item.nome}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex-1">{item.descricao}</p>
                <div className="mt-4 flex items-center justify-between">
                  {item.preco !== undefined ? (
                    <>
                      <span className="font-semibold text-primary">{formatBRL(item.preco)}</span>
                      <Button size="sm" onClick={item.onAdd} className="rounded-full">
                        <Plus className="h-4 w-4 mr-1" /> Adicionar
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Disponível para montar seu bento
                    </span>
                  )}
                </div>
              </article>
            ))}
            {items.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-10">
                Nenhum item disponível nessa categoria hoje.
              </p>
            )}
          </div>
        )}

        <div className="mt-10 text-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/pedido">Ir para o pedido</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
