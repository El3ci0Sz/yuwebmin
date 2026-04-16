# 🍃 YunWebmin - Restaurante Vegetariano

Projeto desenvolvido para a disciplina de Projetos de Sistemas Web. O objetivo é criar uma plataforma digital para o restaurante vegetariano **Yuenmin**, otimizando a experiência do cliente ao oferecer um cardápio interativo, montagem de pratos personalizados e um sistema prático para pedidos e agendamento de retiradas.

## 🎯 Objetivos do Projeto
- **Facilitar o acesso:** Digitalizar o cardápio com descrições claras e atrativas dos pratos vegetarianos.
- **Personalização:** Permitir que o cliente monte seu próprio prato com os ingredientes disponíveis.
- **Comodidade:** Implementar um fluxo de pedidos online com opção de agendamento para retirada no local (Takeaway).

---

## 🛠️ Tecnologias Utilizadas (Sugestão)
*Atualize esta seção com a stack definida pela sua equipe.*
- **Frontend:** React / Vue.js / HTML+CSS puro
- **Backend:** Spring Boot (Java) / Node.js / Python
- **Banco de Dados:** PostgreSQL / MySQL
- **Design:** Figma

---

## ✅ To-Do: Funcionalidades

### 👤 Área do Cliente
- [ ] **Catálogo e Cardápio:** Listagem de pratos prontos, bebidas e sobremesas com fotos, preços e ingredientes.
- [ ] **Montagem de Prato:** Interface interativa para o cliente selecionar base, proteínas vegetais, acompanhamentos e molhos.
- [ ] **Carrinho de Compras:** Adicionar, editar ou remover itens antes de fechar o pedido.
- [ ] **Checkout e Pedido:** Formulário para finalizar a compra e escolher o horário de retirada.
- [ ] **Acompanhamento:** Tela de status do pedido (Em preparo, Pronto para retirada).

### ⚙️ Área Administrativa (Restaurante)
- [ ] **Gestão do Cardápio:** CRUD (Criar, Ler, Atualizar, Deletar) de itens, ingredientes e preços.
- [ ] **Painel de Pedidos:** Visualização em tempo real dos pedidos recebidos e atualização de status.

---

## 🗺️ Roadmap Inicial

Para manter o projeto organizado e garantir entregas constantes durante a disciplina, sugerimos a seguinte trilha de desenvolvimento:

### 📍 Fase 1: Planejamento e Design (Semanas 1-2)
- [ ] Definir a stack tecnológica exata da equipe.
- [ ] Criar o protótipo de baixa/alta fidelidade das telas principais (Cardápio e Montagem de Pratos) no Figma.
- [ ] Modelar o Banco de Dados (Tabelas de Usuários, Produtos, Ingredientes, Pedidos e Itens do Pedido).
- [ ] Configurar os repositórios e o ambiente de desenvolvimento.

### 📍 Fase 2: MVP - Catálogo e Estrutura Base (Semanas 3-4)
- [ ] **Backend:** Criar a API REST para listar os produtos e ingredientes.
- [ ] **Frontend:** Desenvolver a página inicial e a visualização do cardápio consumindo a API.
- [ ] **Frontend:** Criar o fluxo visual da tela de "Montar Prato".

### 📍 Fase 3: Lógica de Negócio e Pedidos (Semanas 5-6)
- [ ] **Frontend:** Implementar o Carrinho de Compras (estado da aplicação).
- [ ] **Backend:** Criar os endpoints para registro de pedidos e cálculo de valor total.
- [ ] **Integração:** Conectar o checkout do frontend com a API de pedidos, incluindo a seleção de horário para retirada.

### 📍 Fase 4: Painel Admin e Refinamentos (Semanas 7-8)
- [ ] **Backend/Frontend:** Desenvolver uma tela simples para o restaurante visualizar os pedidos que estão chegando.
- [ ] Realizar testes de usabilidade simulando o fluxo completo de um cliente.
- [ ] Correção de bugs, refinamento do design (CSS/UI) e documentação final para a disciplina.
- [ ] Deploy da aplicação (ex: Vercel para front, Render/Railway para back).

---

## 🚀 Como rodar o projeto localmente

*(Instruções para o professor ou outros desenvolvedores rodarem a aplicação)*

1. Clone o repositório:
   ```bash
   git clone [https://github.com/seu-usuario/yuenmin-web.git](https://github.com/seu-usuario/yuenmin-web.git)
