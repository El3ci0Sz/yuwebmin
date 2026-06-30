## Objetivo
Refazer a página `/pedido` (Criador de Pedido) com uma experiência interativa de **montar o prato arrastando ingredientes**, em vez do layout atual de lista + resumo.

## Como vai funcionar

1. **Seleção do tamanho da marmita** (P/M/G) no topo, com o limite de tipos exibido:
   - P → até 4 tipos, 1 porção cada
   - M → até 6 tipos, 1,5 porções cada
   - G → até 8 tipos, 2 porções cada
   O multiplicador de porção afeta preço e quantidade no carrinho final.

2. **Layout central "prato no meio, ingredientes em volta"**:
   - Um círculo grande representando o prato no centro.
   - Bloquinhos dos itens do cardápio dispostos em volta (grid responsivo nos lados em desktop, em baixo no mobile), **ordenados alfabeticamente**.
   - Cada bloquinho mostra: ícone genérico por tipo (macarrão 🍜, salada 🥗, guioza 🥟, sushi 🍣, tempura 🍤, bebida 🥤, etc. mapeados a partir do nome/categoria) + nome + preço.

3. **Drag-and-drop interativo**:
   - Arrastar bloquinho para o prato adiciona o ingrediente.
   - Suporte a mouse e **toque (mobile)** usando `@dnd-kit/core` (já compatível com pointer + touch sensors).
   - Ao atingir o limite de tipos do tamanho escolhido, novos drops são bloqueados com toast de aviso.

4. **Prato muda visualmente**:
   - **Imagem de fundo do prato** troca conforme enche: vazio → parcial → cheio (3 estados, geradas com imagegen).
   - **Ícones dos itens adicionados** aparecem empilhados/espalhados dentro do círculo, com pequena animação `scale-in`.
   - Cada item tem badge com contador; clicar no ícone dentro do prato remove uma unidade.

5. **Resumo lateral (ou inferior no mobile)**:
   - Tamanho selecionado, número de tipos (X/limite), porções, total em BRL.
   - Botão **Concluir pedido** chama `store.placeOrder(size)` igual hoje.

## Mudanças técnicas

- **Dependência nova**: `@dnd-kit/core` (drag-and-drop com suporte touch nativo).
- **Assets**: 3 imagens geradas (`prato-vazio.png`, `prato-parcial.png`, `prato-cheio.png`) em `src/assets/`, fundo transparente.
- **`src/lib/menu-data.ts`**: adicionar helper `getIngredientIcon(item)` que mapeia nome/categoria → emoji genérico.
- **`src/lib/store.ts`**: ajustar `placeOrder` (ou criar `placeOrderWithPortions`) para aplicar o multiplicador de porção (P=1, M=1.5, G=2) ao preço/quantidade — mantendo compatibilidade com `/pedidos`.
- **`src/routes/pedido.tsx`**: reescrever totalmente com:
  - `DndContext` envolvendo a página
  - Componente `PrateleiraItem` (draggable) para cada item do cardápio
  - Componente `Prato` (droppable) no centro
  - Estado local de `pratoItems: { id, qty }[]` sincronizado com `store` no checkout
  - Validação do limite de tipos por tamanho

## Layout (desktop ≥1024px)

```
┌─────────────────────────────────────────────────────┐
│  Tamanho: [ P ] [ M ] [ G ]      Tipos: 3/6        │
├──────────────┬──────────────────┬───────────────────┤
│ ingredientes │                  │   Resumo          │
│ (alfabético) │     ◯ PRATO ◯    │   Tipos: 3/6      │
│  [🥦 Brócolis]│   (drop zone)    │   Porções: 1.5x   │
│  [🥟 Guioza]  │                  │   Total: R$ 67,50 │
│  [🍱 Marmita]│                  │   [Concluir]      │
│   ...        │                  │                   │
└──────────────┴──────────────────┴───────────────────┘
```

No mobile (≤768px) os ingredientes ficam em grid horizontal scrollable abaixo do prato; resumo vira barra fixa no rodapé.

## Fora do escopo
- Não mexer em `/cardapio`, `/pedidos`, `/conta`, `/login`, `/` — apenas `/pedido`.
- Não trocar paleta nem layout global.