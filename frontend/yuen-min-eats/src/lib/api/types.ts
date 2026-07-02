// Tipos espelhando as DTOs de resposta do backend (com os rótulos que os enums
// já serializam em JSON, ex.: PapelUsuario -> "admin" | "cliente").

export type Papel = "admin" | "cliente";

export type StatusPedido = "Aceito" | "Preparando" | "Em entrega" | "Concluído" | "Negado";

export type MetodoPagamento = "Pix" | "Crédito" | "Débito" | "Dinheiro" | "Cartão Fidelidade";

export type CategoriaProduto = "Bebidas" | "Sobremesas" | "Porção Kilo" | "Diversos";

export type TipoEntrega = "Entrega" | "Retirada";

export type Endereco = {
  id: number;
  rua: string;
  numero: string;
  bairro: string;
  cep?: string;
  complemento?: string;
};

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  dataCriacao: string;
  carimbosFidelidade: number;
  recompensaDisponivel: boolean;
  xpAcumulado: number;
  nivel: string;
  enderecos: Endereco[];
};

export type ModeloMarmita = {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  limiteAcompanhamentos: number;
  ativo: boolean;
};

export type Acompanhamento = {
  id: number;
  nome: string;
  descricao?: string;
  itemFixo: boolean;
  ativo: boolean;
  emoji?: string;
};

export type Produto = {
  id: number;
  nome: string;
  descricao?: string;
  categoria: CategoriaProduto;
  preco: number;
  itemFixo: boolean;
  ativo: boolean;
  urlImagem?: string;
  emoji?: string;
};

export type SubItem = {
  quantidade: number;
  acompanhamento: Acompanhamento;
};

export type ItemPedido = {
  quantidade: number;
  precoUnitario: number;
  subItens: SubItem[];
  produto?: Produto;
  modeloMarmita?: ModeloMarmita;
};

export type Pedido = {
  id: number;
  dataPedido: string;
  status: StatusPedido;
  valorTotal: number;
  tipoEntrega: TipoEntrega;
  metodoPagamento: MetodoPagamento;
  nomeCliente: string;
  enderecoEntrega?: Endereco;
  itens: ItemPedido[];
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};
