# [Tech Challenge: Blog Aulas Backend](tech-challenge-blog-aulas-backend.azurewebsites.net/health)

Este repositório contém o serviço de backend para a plataforma **Blog Aulas**, desenvolvido como parte de um Tech Challenge do curso Full Stack Development da FIAP.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura e Padrões](#arquitetura-e-padrões)
- [Pré-requisitos](#pré-requisitos)
- [Começando](#começando)
- [Acesso e Documentação da API](#acesso-e-documentação-da-api)
- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
- [Quality Gates e Validação](#quality-gates-e-validação)
- [Pipelines de CI/CD](#pipelines-de-cicd)
- [Observabilidade](#observabilidade)
- [Infraestrutura e Deploy](#infraestrutura-e-deploy)

---

## Sobre o Projeto

O **Blog Aulas** fornece uma API robusta para gerenciamento de conteúdo. Ele lida com autenticação simplificada, gerenciamento de postagens (através de uma abordagem de "Vertical Slicing") e sistemas de comentários, com suporte de um banco de dados PostgreSQL persistente e Redis para cache.

## Stack Tecnológica

*   **Runtime**: [Node.js](https://nodejs.org/) (v24)
*   **Framework**: [NestJS](https://nestjs.com/) (Arquitetura Modular)
*   **Linguagem**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
*   **Banco de Dados**: PostgreSQL
*   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
*   **Cache**: Redis (via `ioredis`)
*   **Containerização**: Docker & Docker Compose
*   **Testes**: Jest (Unitários & E2E), Testcontainers
*   **CI/CD**: GitHub Actions
*   **Qualidade de Código**: SonarCloud, ESLint, Prettier, Snyk
*   **Observabilidade**: New Relic

---

## Arquitetura e Padrões

Este projeto impõe uma estrita **Arquitetura Hexagonal (Portas e Adaptadores)** combinada com **Vertical Slicing**.

### 1. Vertical Slicing
Em vez de organizar o código por camadas técnicas (ex: "controllers", "services"), a base de código é organizada por **Features** (Módulos).
*   `src/modules/posts`
*   `src/modules/auth`

### 2. Camadas Hexagonais
Cada módulo flui para dentro, protegendo o Domínio:
*   **Api (Driving Adapters)**: Controllers, DTOs. Lidam com requisições HTTP e delegam para o Core.
*   **Core (Domain)**: Use Classes, Entidades de Domínio, Portas (Interfaces). **TypeScript Puro**, sem dependências de framework.
*   **Infra (Driven Adapters)**: Repositórios (implementação Drizzle), Serviços Externos. Implementam Portas definidas no Core.

### 3. Padrões Chave
*   **Repository Pattern**: Desacoplamento da persistência via `PORTS`.
*   **Injeção de Dependência**: Gerenciada pelo NestJS para baixo acoplamento.

---

## Pré-requisitos

*   Node.js v24+
*   pnpm (v10+)
*   Docker & Docker Compose

## Começando

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/gfpaiva-github/tech-challenge-blog-aulas-backend.git
    cd tech-challenge-blog-aulas-backend
    ```

2.  **Instale as dependências**:
    ```bash
    pnpm install
    ```

3.  **Configuração de Ambiente**:
    Copie `.env.example` para `.env` e ajuste as variáveis se necessário.
    ```bash
    cp .env.example .env
    ```

4.  **Inicie os Serviços de Infraestrutura** (Postgres & Redis):
    ```bash
    docker-compose up -d
    ```

5.  **Execute as Migrations**:
    ```bash
    pnpm run db:migrate
    ```

6. **Execute população de dados**:
    ```bash
    pnpm run seed
    ```

7.  **Inicie a Aplicação**:
    ```bash
    pnpm start:dev
    ```

---

## 🔗 Acesso e Documentação da API

A aplicação em produção está acessível através da seguinte URL:
*   [http://tech-challenge-blog-aulas-backend.azurewebsites.net/](http://tech-challenge-blog-aulas-backend.azurewebsites.net/)

### API Collection
Para facilitar o uso e testes dos endpoints, incluímos uma coleção do api-client **[Bruno](https://www.usebruno.com/)** no diretório `api-collection`.
*   Esta coleção já está configurada com ambientes para **Development** (local) e **Production**.
*   Basta importar a pasta `api-collection` no aplicativo Bruno e selecionar o ambiente desejado.

---

## Fluxo de Desenvolvimento

Seguimos os princípios do **Gitflow** e **Conventional Commits**.

*   **Commits**: Devem seguir a convenção `feat:`, `fix:`, `chore:`, `refactor:`, etc., verificados por **Commitlint** e **Husky**.
*   **Linting**: Execute `pnpm lint` para garantir consistência de estilo de código.
*   **Testes**:
    *   Unitários: `pnpm run test` (foco na lógica de Domínio)
    *   E2E: `pnpm run test:e2e` (usa Testcontainers para integração real com BD)

---

## Quality Gates e Validação

1.  **Análise Estática**: ESLint e Prettier para estilo de código.
2.  **Testes**: Testes Unitários e End-to-End devem passar.
3.  **[SonarCloud](https://sonarcloud.io/)**: Análise automática de code smells, bugs e hotspots de segurança.
    *   **Cobertura**: Exigimos alta cobertura de código, unificando relatórios Unitários e E2E.
4.  **Integração [Snyk](https://snyk.io/)**: Varredura de vulnerabilidades de segurança em dependências (SCA) e código (SAST).

---

## Pipelines de CI/CD

Pipelines são definidas no GitHub Actions.

### Integração Contínua (CI)
Arquivo: `.github/workflows/ci.yml`
Gatilhos: Pull Requests e Pushes na `main`.
1.  **Setup**: Instala Node.js v24 e dependências.
2.  **Linting**: Verifica padrões de código.
3.  **Execução de Testes**: Roda testes Unitários e E2E.
4.  **SonarCloud Scan**: Envia relatório para o SonarCloud para classificação de qualidade.
5.  **Build**: Verifica se a aplicação compila com sucesso.

### Deploy Contínuo (CD)
Arquivo: `.github/workflows/cd.yml`
Gatilhos: Pushes na `main` (após sucesso do CI).
1.  **[Release Please](https://github.com/googleapis/release-please)**: Automatiza versionamento e geração de changelog baseado em conventional commits.
2.  **Docker Build**:
    *   Constrói uma imagem Docker multi-stage (baseada em Alpine).
    *   Injeta segredos em tempo de build de forma segura.
3.  **Registry Push**: Envia a imagem para o **Azure Container Registry (ACR)**.
4.  **Deploy**: Atualiza o **Azure App Service** com a nova imagem.
5.  **New Relic Marker**: Marca o evento de deploy no New Relic para correlação de observabilidade.

**Importante:** Passos 2, 3, 4 e 5 são executados apenas após criação de tag e release automáticas do Release Please, ou, manualmente.

---

## Observabilidade

A aplicação é instrumentada com **[New Relic](https://newrelic.com/)** APM para monitoramento em tempo real:
*   **Monitoramento de Performance**: Tempos de transação, throughput e taxas de erro.
*   **Tracing Distribuído**: Visualização de fluxos de requisição entre serviços.

---

## Infraestrutura e Deploy

O ambiente de produção é hospedado no **[Microsoft Azure](https://azure.microsoft.com/)**.

*   **Computação**: Azure App Service (rodando Containers Docker).
*   **Banco de Dados**: Azure Database for PostgreSQL (Flexible Server).
*   **Cache**: Azure Cache for Redis.
*   **Registry**: Azure Container Registry (ACR).

O deploy é totalmente automatizado via pipeline de CD usando a action `azure/webapps-deploy`.
