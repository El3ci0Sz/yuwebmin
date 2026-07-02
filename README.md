# 🍃 YuWebmin - Restaurante Vegetariano Yuen Min 圓明

Projeto desenvolvido para a disciplina de Projetos de Sistemas Web. O objetivo é criar uma plataforma digital de ponta a ponta para o restaurante vegetariano **Yuen Min**, digitalizando desde a experiência do cliente (cardápio interativo e fidelidade) até a gestão operacional da cozinha (KDS) e administração financeira.

## 🎯 Objetivos do Projeto
- **Experiência do Cliente:** Digitalizar o cardápio com um sistema interativo de montagem de pratos (Bento/Marmita) respeitando limites de porções.
- **Fidelização:** Substituir o cartão de carimbos de papel por um motor de gamificação automático integrado ao checkout.
- **Gestão Operacional (KDS):** Eliminar comandas de papel com uma esteira digital de pedidos em tempo real para a cozinha, com envio automático de notificações via WhatsApp.
- **Autonomia Administrativa:** Permitir que o gestor ligue e desligue produtos do cardápio diariamente através de um "Centro de Comando".

---

## 🛠️ Tecnologias Utilizadas

A arquitetura do projeto foi desenhada separando completamente o Frontend do Backend, comunicando-se via API REST protegida por JWT.

### Backend (API REST)
* **Linguagem:** Java 25
* **Framework:** Spring Boot 4
* **Segurança:** Spring Security com JWT (JSON Web Token) e BCrypt
* **Persistência:** Spring Data JPA / Hibernate
* **Banco de Dados:** MySQL 8
* **Mapeamento e Validação:** MapStruct, Lombok e Bean Validation
* **Documentação:** Swagger / OpenAPI

### Frontend (SPA)
* **Core:** React 19 com TypeScript
* **Roteamento e Estado:** TanStack Router e TanStack Query
* **Estilização:** Tailwind CSS e Radix UI (shadcn/ui)
* **Interatividade:** dnd-kit (Drag-and-drop para montagem da marmita)
* **Build Tool:** Vite

### Infraestrutura
* **Contêineres:** Docker e Docker Compose (Orquestração de ambiente)

---

## ✅ Funcionalidades Implementadas

### 👤 Área do Cliente
- [x] **Catálogo Dinâmico:** Listagem de pratos prontos, acompanhamentos, bebidas e sobremesas ativos no dia.
- [x] **Montagem de Marmita Interativa:** Interface visual (drag-and-drop) com validação de limite de ingredientes baseada no tamanho escolhido.
- [x] **Gestão de Endereços:** Cadastro de múltiplos endereços com autocompletar via API do ViaCEP.
- [x] **Checkout e Carrinho:** Escolha de entrega ou retirada, cálculo de troco e fechamento de pedido.
- [x] **Cartão Fidelidade Digital:** Sistema automático que contabiliza pedidos e libera recompensas (marmita grátis).
- [x] **Acompanhamento de Status:** Histórico de pedidos e visualização do status atual.

### ⚙️ Área Administrativa (Restaurante)
- [x] **Painel KDS (Kitchen Display System):** Tela para a cozinha aceitar, preparar e despachar pedidos, mudando o status em tempo real.
- [x] **Notificações via WhatsApp:** Geração de mensagens automáticas de status (ex: "Saiu para entrega") prontas para envio em um clique.
- [x] **Centro de Comando:** Painel de "toggles" para ativar/desativar rapidamente a disponibilidade de ingredientes e pratos para o dia.
- [x] **Gestão de Cardápio (CRUD):** Criação e edição de modelos de marmitas, regras de preços e produtos avulsos.
- [x] **Dashboard Financeiro:** Indicadores de faturamento, ticket médio e volume de vendas.

---

## 🚀 Como rodar o projeto localmente

O projeto utiliza **Docker** para garantir que o ambiente de desenvolvimento seja idêntico para todos os membros da equipe, sem necessidade de instalar o MySQL ou o Java manualmente na máquina.

### Pré-requisitos
* Ter o [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando.
* (Opcional) VS Code com a extensão *Live Server* para testar protótipos de frontend em HTML.
* **(OBRIGATÓRIO)** é obrigatorio ter um arquivo .env com credencias para conseguir rodar o projeto, so os desenvolvedores tem acesso a esse arquivo.

## 🚀 Como rodar o projeto localmente

**1. Clone o repositório:**
   
https://github.com/El3ci0Sz/yuwebmin.git
   
**2. Para executar:**
   
**Na primeira vez:**

docker compose --build

**Para executar denovo, caso não tenha feito alterações:**

docker compose up
