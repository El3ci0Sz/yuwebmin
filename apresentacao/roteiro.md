# Roteiro da Apresentação — YuWebMin

> Este arquivo é o conteúdo pronto de cada slide, em texto puro, para o caso de vocês
> preferirem montar a apresentação manualmente (PowerPoint, Google Slides, Canva etc.)
> em vez de usar `index.html`. Também serve como notas de apoio para quem for falar.

---

## Slide 1 — Capa
**YuWebMin**
Plataforma web para o Restaurante Vegetariano Yuen Min 圓明
Cardápio digital · Montagem de marmita · Fidelidade · Gestão administrativa
[Nome dos integrantes] · [Disciplina] · [Data]

---

## Slide 2 — Sumário
- O problema
- A ideia e o objetivo
- Como o sistema funciona
- Funcionalidades (cliente e admin)
- Arquitetura geral
- Tecnologias utilizadas
- APIs e serviços
- Segurança
- Desafios e soluções
- Diferenciais
- Melhorias futuras
- Conclusão

---

## Slide 3 — O problema
**Como o Yuen Min operava antes do sistema**
- Pedidos manuais (balcão/telefone) — sujeitos a erro de anotação e fila de espera
- Cardápio físico/estático — não reflete o que está disponível naquele dia
- Montagem de marmita "no olho" — sem controle de limite de porções por tamanho
- Fidelidade em papel (cartão de carimbo físico) — fácil de perder, difícil de auditar
- Gestão do dia a dia (cardápio, status dos pedidos, financeiro) dependente de planilhas

💡 *Imagem sugerida: foto de comanda/cartão de fidelidade em papel, para contraste.*

---

## Slide 4 — A ideia e o objetivo
- Digitalizar ponta a ponta a experiência do restaurante: do pedido do cliente à gestão da cozinha
- Cliente monta a própria marmita (bento) escolhendo tamanho, acompanhamentos, bebidas e sobremesas
- Pedido chega já estruturado e validado por regras de negócio
- Equipe gerencia tudo em um painel único: cardápio do dia, status dos pedidos, indicadores financeiros
- Programa de fidelidade automático, sem cartão de papel

---

## Slide 5 — Fluxo do cliente
1. Login / Cadastro
2. Escolher tamanho
3. Montar o bento (arrastar e soltar)
4. Bebidas / sobremesas
5. Entrega ou retirada
6. Forma de pagamento
7. Confirmar pedido
8. Acompanhar status

💡 *Imagem sugerida: screenshot real da tela "Monte seu bento" e da tela "Comanda".*

---

## Slide 6 — Fluxo administrativo
**Gestão de Cardápio**
- Criar/editar/remover tamanhos, pratos e produtos
- Ativar/desativar itens do dia com um clique

**Gestão de Pedidos**
- Ver todos os pedidos recebidos
- Atualizar status: Aceito → Preparando → Em entrega → Concluído/Negado

**Financeiro**
- Vendas do dia / 7 dias / 30 dias
- Ticket médio, top itens, cancelamentos

💡 *Imagem sugerida: screenshot do painel Financeiro (KPIs + gráfico).*

---

## Slide 7 — Área do cliente (funcionalidades)
- Login e cadastro com autenticação segura
- Cardápio dinâmico (vem do banco, não é fixo)
- Montagem interativa da marmita (drag-and-drop)
- Limite de porções por tamanho, validado em tempo real
- Escolha entre entrega ou retirada
- Múltiplos endereços salvos no perfil
- Diversas formas de pagamento (Pix, cartão, dinheiro)
- Cartão fidelidade automático + histórico "Meus Pedidos"

---

## Slide 8 — Área administrativa (funcionalidades)
- CRUD completo de tamanhos, pratos e produtos adicionais
- Controle diário do que está disponível, sem mexer em código
- Gestão de pedidos com atualização de status em tempo real
- Dashboard financeiro com indicadores de vendas
- Controle de acesso por papel (só admin vê essas telas)

---

## Slide 9 — Arquitetura geral
```
[Frontend: React/TanStack SPA]  ⇄  [Backend: Spring Boot API]  ⇄  [MySQL]
```
- Comunicação via HTTP/JSON
- Autenticação via JWT
- Tudo orquestrado com Docker Compose

💡 *Imagem sugerida: mesmo diagrama com ícone do Docker envolvendo Backend + MySQL.*

---

## Slide 10 — Camadas do backend
```
Controller  →  Service  →  Repository  →  Model/Entity
```
- **Controller**: expõe os endpoints REST
- **Service**: regras de negócio (ex.: limite de porções, fidelidade)
- **Repository**: acesso ao banco (Spring Data JPA)
- **Model/Entity**: representa as tabelas do banco

Atravessando tudo: Security Filter (JWT) valida quem está autenticado, e o Mapper
(MapStruct) converte entre Entity e DTO.

---

## Slide 11 — Tecnologias: Back-end
- Java 25
- Spring Boot 4
- Spring Security + JWT
- Spring Data JPA / Hibernate
- MySQL 8
- MapStruct
- Bean Validation
- Swagger / OpenAPI
- Lombok

---

## Slide 12 — Tecnologias: Front-end
- React 19
- TypeScript
- TanStack Router / Start (SSR + rotas por arquivo)
- TanStack Query (cache e sincronização com a API)
- Tailwind CSS
- Radix UI (shadcn/ui)
- dnd-kit (drag-and-drop)
- Vite

---

## Slide 13 — Tecnologias: Infraestrutura
- Docker + Docker Compose
- Perfis de configuração (dev / prod)
- Backend e banco sobem juntos com um único comando
- Pronto para deploy em nuvem

---

## Slide 14 — APIs e serviços utilizados
**API REST própria**
- `/auth` — login e emissão de token JWT
- `/usuarios` — cadastro, perfil, endereços
- `/modelos-marmitas`, `/acompanhamentos`, `/produtos` — cardápio
- `/pedidos` — criação, status, listagem admin
- `/estatisticas` — dashboard financeiro

**Serviços de apoio**
- Auth0 java-jwt — geração/validação do token JWT
- Swagger/OpenAPI — documentação e testes interativos da API
- BCrypt (Spring Security) — hash seguro de senha

💡 *Imagem sugerida: screenshot da tela do Swagger UI.*

---

## Slide 15 — Segurança
- Autenticação stateless via JWT (sem sessão no servidor)
- Senhas nunca em texto puro — hash com BCrypt
- Controle de acesso por papel (CLIENTE / ADMIN)
- CORS configurado por ambiente

---

## Slide 16 — Principais desafios e soluções
- **Integrar o front-end a um backend com modelo de negócio próprio**: o preço da
  marmita é fixo por tamanho (não soma de cada item) — foi preciso mapear e adaptar
  as telas para essa regra real.
- **Ambiente Docker + MySQL**: erros de handshake SSL e credenciais desatualizadas em
  containers recriados — resolvido ajustando a string de conexão e recriando o volume.
- **Compatibilidade Windows/Linux**: script do Maven quebrava dentro do container por
  causa de quebra de linha (CRLF) — corrigido com `.gitattributes` forçando LF.
- **Sincronizar a interface com regras que mudam no servidor** (ex.: pontos de
  fidelidade após um pedido ser concluído) — implementado refetch automático do perfil.

---

## Slide 17 — Diferenciais do projeto
- **Montagem interativa**: drag-and-drop com validação de limite por tamanho em tempo real
- **Fidelidade automática**: 7 carimbos = marmita grátis, aplicada como forma de
  pagamento no próprio checkout
- **Painel admin completo**: cardápio, pedidos e financeiro em um só lugar

---

## Slide 18 — Melhorias futuras
- Edição e remoção de endereços salvos
- Integração com gateway de pagamento real (Pix/cartão online)
- Notificações de status do pedido (push, e-mail ou WhatsApp)
- Marmita "por peso" (opção personalizada)
- Testes automatizados (unitários e de integração)
- Deploy em produção com CI/CD e aplicativo mobile

---

## Slide 19 — Conclusão
- Sistema funcional de ponta a ponta: do pedido do cliente à gestão da cozinha
- Arquitetura moderna e desacoplada (API REST + SPA), fácil de evoluir
- Resolve os problemas reais do restaurante: fila, erro manual, fidelidade em papel
- Base sólida para crescer: pagamentos reais, notificações, app mobile

---

## Slide 20 — Obrigado
Obrigado! Perguntas?
[Repositório / contato do grupo]
