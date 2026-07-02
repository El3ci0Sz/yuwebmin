import { apiFetch } from "./client";
import type { Acompanhamento, CategoriaProduto, ModeloMarmita, Page, Produto } from "./types";

// Spring converte @RequestParam de enum pelo nome da constante Java (não pelo
// rótulo serializado em JSON), então o filtro por categoria precisa mandar o
// nome bruto do enum no backend.
const CATEGORIA_PARAM: Record<CategoriaProduto, string> = {
  Bebidas: "BEBIDA",
  Sobremesas: "SOBREMESA",
  "Porção Kilo": "PORCAO_KILO",
  Diversos: "DIVERSOS",
};

// --- Modelos de marmita (tamanhos) ---

export function listarModelosAtivos(): Promise<ModeloMarmita[]> {
  return apiFetch<ModeloMarmita[]>("/modelos-marmitas/ativos");
}

export function listarModelosTodos(): Promise<ModeloMarmita[]> {
  return apiFetch<ModeloMarmita[]>("/modelos-marmitas");
}

export function alternarStatusModelo(id: number): Promise<void> {
  return apiFetch<void>(`/modelos-marmitas/${id}/ativo`, { method: "PATCH" });
}

export type ModeloMarmitaInput = {
  nome: string;
  descricao?: string;
  preco: number;
  limiteAcompanhamentos: number;
  ativo?: boolean;
};

export function criarModelo(input: ModeloMarmitaInput): Promise<ModeloMarmita> {
  return apiFetch<ModeloMarmita>("/modelos-marmitas", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function atualizarModelo(id: number, input: ModeloMarmitaInput): Promise<ModeloMarmita> {
  return apiFetch<ModeloMarmita>(`/modelos-marmitas/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deletarModelo(id: number): Promise<void> {
  return apiFetch<void>(`/modelos-marmitas/${id}`, { method: "DELETE" });
}

// --- Acompanhamentos (pratos do bento) ---

export function listarAcompanhamentosAtivos(busca?: string): Promise<Acompanhamento[]> {
  const query = busca ? `?busca=${encodeURIComponent(busca)}` : "";
  return apiFetch<Acompanhamento[]>(`/acompanhamentos/ativos${query}`);
}

export function listarAcompanhamentosTodos(): Promise<Acompanhamento[]> {
  return apiFetch<Acompanhamento[]>("/acompanhamentos");
}

export function alternarStatusAcompanhamento(id: number): Promise<void> {
  return apiFetch<void>(`/acompanhamentos/${id}/ativo`, { method: "PATCH" });
}

export type AcompanhamentoInput = {
  nome: string;
  descricao?: string;
  itemFixo?: boolean;
  ativo?: boolean;
  emoji?: string;
};

export function criarAcompanhamento(input: AcompanhamentoInput): Promise<Acompanhamento> {
  return apiFetch<Acompanhamento>("/acompanhamentos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function atualizarAcompanhamento(
  id: number,
  input: AcompanhamentoInput,
): Promise<Acompanhamento> {
  return apiFetch<Acompanhamento>(`/acompanhamentos/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deletarAcompanhamento(id: number): Promise<void> {
  return apiFetch<void>(`/acompanhamentos/${id}`, { method: "DELETE" });
}

// --- Produtos (bebidas e sobremesas) ---

export async function listarProdutosAtivos(
  categoria?: CategoriaProduto,
  busca?: string,
): Promise<Produto[]> {
  const params = new URLSearchParams({ size: "100" });
  if (categoria) params.set("categoria", CATEGORIA_PARAM[categoria]);
  if (busca) params.set("busca", busca);
  const page = await apiFetch<Page<Produto>>(`/produtos/ativos?${params.toString()}`);
  return page.content;
}

export async function listarProdutosTodos(): Promise<Produto[]> {
  const page = await apiFetch<Page<Produto>>("/produtos?size=100");
  return page.content;
}

export function alternarStatusProduto(id: number): Promise<Produto> {
  return apiFetch<Produto>(`/produtos/${id}/ativo`, { method: "PATCH" });
}

export type ProdutoInput = {
  nome: string;
  descricao?: string;
  categoria: CategoriaProduto;
  preco: number;
  itemFixo?: boolean;
  ativo?: boolean;
  urlImagem?: string;
  emoji?: string;
};

export function criarProduto(input: ProdutoInput): Promise<Produto> {
  return apiFetch<Produto>("/produtos", { method: "POST", body: JSON.stringify(input) });
}

export function atualizarProduto(id: number, input: ProdutoInput): Promise<Produto> {
  return apiFetch<Produto>(`/produtos/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deletarProduto(id: number): Promise<void> {
  return apiFetch<void>(`/produtos/${id}`, { method: "DELETE" });
}
