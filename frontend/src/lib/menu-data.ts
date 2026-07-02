export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Emoji do item vindo do backend, com um fallback genérico para itens sem emoji cadastrado. */
export function getIngredientIcon(item: { emoji?: string }): string {
  return item.emoji ?? "🍽️";
}
