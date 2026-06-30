import bebidaCoca from "@/assets/bebida-coca.png";
import bebidaJesus from "@/assets/bebida-jesus.png";
import bebidaGuarana from "@/assets/bebida-guarana.png";
import bebidaAbacaxi from "@/assets/bebida-abacaxi.png";
import bebidaLaranja from "@/assets/bebida-laranja.png";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Pratos Principais" | "Acompanhamentos" | "Entradas" | "Bebidas";
  emoji: string;
  /** Item fixo do cardápio (servido todos os dias). */
  isFixed?: boolean;
};

export const MENU: MenuItem[] = [
  { id: "1", name: "Yakisoba Vegetariano", description: "Macarrão oriental com legumes salteados e shoyu artesanal.", price: 28.9, category: "Pratos Principais", emoji: "🍜", isFixed: true },
  { id: "2", name: "Guioza de Legumes", description: "Pastéis assados recheados com repolho, cenoura e gengibre.", price: 22.5, category: "Entradas", emoji: "🥟" },
  { id: "3", name: "Sushi Vegano (8 un)", description: "Combinado com pepino, abacate e manga.", price: 32.0, category: "Pratos Principais", emoji: "🍣" },
  { id: "4", name: "Tempura de Abóbora", description: "Fatias crocantes de abóbora cabotiá empanadas.", price: 18.0, category: "Acompanhamentos", emoji: "🎃" },
  { id: "5", name: "Brócolis ao Alho", description: "Brócolis salteado com alho dourado e gergelim.", price: 14.0, category: "Acompanhamentos", emoji: "🥦", isFixed: true },
  { id: "6", name: "Arroz Integral", description: "Arroz integral cozido no ponto.", price: 8.0, category: "Acompanhamentos", emoji: "🍚", isFixed: true },
  { id: "7", name: "Feijão Azuki", description: "Feijão japonês temperado.", price: 9.0, category: "Acompanhamentos", emoji: "🫘", isFixed: true },
  { id: "8", name: "Tofu Grelhado", description: "Tofu firme grelhado com shoyu.", price: 16.0, category: "Pratos Principais", emoji: "🧈", isFixed: true },
  { id: "9", name: "Salada Sunomono", description: "Pepino marinado em vinagre de arroz.", price: 12.0, category: "Acompanhamentos", emoji: "🥗" },
  { id: "10", name: "Edamame", description: "Vagens de soja cozidas com sal grosso.", price: 11.0, category: "Acompanhamentos", emoji: "🫛" },
  { id: "11", name: "Harumaki de Legumes", description: "Rolinho primavera assado.", price: 14.5, category: "Entradas", emoji: "🌯" },
  { id: "12", name: "Cenoura ao Gergelim", description: "Cenoura ralada com gergelim torrado.", price: 10.0, category: "Acompanhamentos", emoji: "🥕", isFixed: true },
];

export type Beverage = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export const BEVERAGES: Beverage[] = [
  { id: "b1", name: "Coca-Cola", price: 8.0, image: bebidaCoca },
  { id: "b2", name: "Guaraná Jesus", price: 8.5, image: bebidaJesus },
  { id: "b3", name: "Guaraná Antarctica", price: 8.0, image: bebidaGuarana },
  { id: "b4", name: "Suco de Abacaxi", price: 10.0, image: bebidaAbacaxi },
  { id: "b5", name: "Suco de Laranja", price: 9.0, image: bebidaLaranja },
];

export type Extra = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
};

/** Produtos adicionais (sobremesas). */
export const EXTRAS: Extra[] = [
  { id: "e1", name: "Bolinho de Abacaxi Folhado", description: "Massa folhada crocante com recheio de abacaxi caramelizado.", price: 9.5, emoji: "🥧" },
  { id: "e2", name: "Bolinho de Lua", description: "Mooncake recheado com pasta doce de feijão.", price: 8.0, emoji: "🥮" },
  { id: "e3", name: "Sorvete", description: "Sorvete artesanal sabor do dia.", price: 7.0, emoji: "🍨" },
];

export function getIngredientIcon(item: MenuItem): string {
  const n = item.name.toLowerCase();
  if (n.includes("yakisoba") || n.includes("macarr")) return "🍜";
  if (n.includes("guioza") || n.includes("pastel")) return "🥟";
  if (n.includes("sushi")) return "🍣";
  if (n.includes("tempura")) return "🍤";
  if (n.includes("brócol")) return "🥦";
  if (n.includes("arroz")) return "🍚";
  if (n.includes("feijão") || n.includes("feijao")) return "🫘";
  if (n.includes("tofu")) return "🧈";
  if (n.includes("salada") || n.includes("sunomono")) return "🥗";
  if (n.includes("edamame")) return "🫛";
  if (n.includes("harumaki") || n.includes("rolinho")) return "🌯";
  if (n.includes("cenoura")) return "🥕";
  return item.emoji;
}

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
