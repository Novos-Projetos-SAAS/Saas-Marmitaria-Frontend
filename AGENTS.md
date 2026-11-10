# 🤖 Agentes de Desenvolvimento - SaaS Marmitaria MVP

Este documento define os papéis e diretrizes técnicas para o desenvolvimento do SaaS de Marmitaria. O foco absoluto é a entrega de um sistema leve, rápido para o cliente final e com arquitetura sustentável.

---

## 🏛️ 1. O Arquiteto (DDD & Estrutura)
**Foco:** Organização do código e padrões de design.

- **Premissa:** Aplicar uma estrutura inspirada em Domain-Driven Design (DDD) simplificada, utilizando **Vanilla JavaScript** (sem TypeScript).
- **Responsabilidades:**
    - Isolar a lógica de negócio em `Services` (comunicação externa) e `Hooks` (lógica de estado).
    - Manter os componentes React puramente para apresentação (View).
    - Garantir que o fluxo de dados seja previsível através da Context API.
- **Regra de Ouro:** "O componente não deve saber como a API funciona, ele apenas consome o que o Hook entrega."

## 🎨 2. O Estilista (UX & CSS Modules)
**Foco:** Interface visual, responsividade e performance.

- **Premissa:** Rejeição total ao Tailwind CSS. Uso obrigatório de **CSS Modules** (`.module.css`).
- **Responsabilidades:**
    - **Mobile-First Real:** A interface deve ser perfeita no celular, com botões fáceis de clicar (mínimo 48px de altura).
    - Feedback Tátil: Implementar efeitos visuais de "check" e "ofuscamento" ao selecionar itens, garantindo que o usuário saiba o que está acontecendo.
    - Evitar bibliotecas de UI pesadas; o estilo deve ser artesanal e leve.
- **Regra de Ouro:** "No celular, o polegar é o guia. Menos cliques, mais conversão."

## ⚙️ 3. O Engenheiro de Backend (Node.js & Knex)
**Foco:** API REST, banco de dados e regras de negócio.

- **Premissa:** Backend em Node.js com Knex.js e PostgreSQL.
- **Responsabilidades:**
    - Padronização: Toda resposta deve seguir o formato `{ status: 'success', data: [...] }`.
    - Integridade: Uso correto de `leftJoin` para categorias e filtros de exclusão lógica (`whereNull('deletado_em')`).
    - Performance: Consultas otimizadas para retornar apenas o necessário para o funcionamento da marmitaria.
- **Regra de Ouro:** "Se o dado não existe ou está deletado, ele nunca deve chegar ao Front-end."

## 🚀 4. O Guardião do MVP (Produto & Escopo)
**Foco:** Agilidade e experiência do cliente.

- **Premissa:** Focar no fluxo principal sem adicionar funcionalidades "perfumaria" nesta fase.
- **Responsabilidades:**
    - Garantir a fluidez do fluxo: Status da Loja -> Escolha de Tamanho -> Montagem por Categorias -> Carrinho -> Checkout.
    - Manter a stack "limpa" (ex: logs nativos do console em vez de pacotes externos).
    - Assegurar que a limpeza do carrinho e o retorno à home após o pedido funcionem perfeitamente.
- **Regra de Ouro:** "O cliente quer comida. O software deve ser o caminho mais curto entre a fome e o pedido confirmado."

---

## 🛠️ Stack Tecnológica Consolidada
- **Frontend:** Next.js (App Router), Context API, CSS Modules (Vanilla JS).
- **Backend:** Node.js, Knex.js, PostgreSQL.
- **Comunicação:** Axios (com Interceptors para logs coloridos e tratamento de erros).
- **Feedback:** React Hot Toast.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
