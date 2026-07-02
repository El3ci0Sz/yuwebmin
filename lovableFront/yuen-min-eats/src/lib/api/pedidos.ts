import { apiFetch } from "./client";
import type { MetodoPagamento, Page, Pedido } from "./types";

export type CriarPedidoInput = {
  modeloMarmitaId: number;
  acompanhamentos: { acompanhamentoId: number; quantidade: number }[];
  produtos: { produtoId: number; quantidade: number }[];
  metodoPagamento: MetodoPagamento;
};

export function criarPedido(input: CriarPedidoInput): Promise<Pedido> {
  const itens = [
    {
      modeloMarmitaId: input.modeloMarmitaId,
      quantidade: 1,
      subItens: input.acompanhamentos.map((a) => ({
        acompanhamentoId: a.acompanhamentoId,
        quantidade: a.quantidade,
      })),
    },
    ...input.produtos.map((p) => ({ produtoId: p.produtoId, quantidade: p.quantidade })),
  ];

  return apiFetch<Pedido>("/pedidos", {
    method: "POST",
    body: JSON.stringify({ itens, metodoPagamento: input.metodoPagamento }),
  });
}

export async function listarMeusPedidos(): Promise<Pedido[]> {
  const page = await apiFetch<Page<Pedido>>("/pedidos/meus-pedidos?size=50&sort=dataPedido,desc");
  return page.content;
}

export function listarPedidosAdmin(): Promise<Pedido[]> {
  return apiFetch<Pedido[]>("/pedidos/admin");
}

export type LinhaPedido = {
  key: string;
  nome: string;
  emoji: string;
  precoUnitario: number;
  quantidade: number;
  subLabel?: string;
};

/** Achata os itens (marmita + produtos avulsos) de um pedido em linhas simples para exibição. */
export function flattenPedidoItens(pedido: Pedido): LinhaPedido[] {
  return pedido.itens.map((item) => {
    if (item.modeloMarmita) {
      const subLabel = item.subItens.length
        ? item.subItens.map((s) => `${s.quantidade}× ${s.acompanhamento.nome}`).join(", ")
        : undefined;
      return {
        key: `modelo-${item.modeloMarmita.id}`,
        nome: item.modeloMarmita.nome,
        emoji: "🍱",
        precoUnitario: item.precoUnitario,
        quantidade: item.quantidade,
        subLabel,
      };
    }

    const produto = item.produto!;
    return {
      key: `produto-${produto.id}`,
      nome: produto.nome,
      emoji: produto.emoji ?? (produto.categoria === "Bebidas" ? "🥤" : "🍨"),
      precoUnitario: item.precoUnitario,
      quantidade: item.quantidade,
    };
  });
}
