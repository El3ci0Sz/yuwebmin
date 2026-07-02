import { apiFetch } from "./client";
import type { Endereco } from "./types";

export type EnderecoInput = {
  rua: string;
  numero: string;
  bairro: string;
  cep?: string;
  complemento?: string;
};

export function listarMeusEnderecos(): Promise<Endereco[]> {
  return apiFetch<Endereco[]>("/usuarios/meus-enderecos");
}

export function adicionarEndereco(input: EnderecoInput): Promise<Endereco> {
  return apiFetch<Endereco>("/usuarios/meus-enderecos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
