# PD Sports

## Visão Geral do Projeto

O PD Sports é uma aplicação web de e-commerce esportivo desenvolvida com Angular 21. O sistema oferece catálogo de produtos, busca, carrinho de compras, autenticação de usuários, área de perfil e painel administrativo para gerenciamento de produtos.

### Principais funcionalidades

- Catálogo de produtos esportivos
- Busca de produtos por nome
- Navegação por modalidades esportivas
- Carrinho de compras persistido em Local Storage
- Cadastro, login e recuperação de senha
- Perfil de usuário
- Painel administrativo
- Cálculo de frete via integração com Melhor Envio
- Controle de acesso por autenticação e perfil administrativo

---

## Tecnologias Utilizadas

| Tecnologia         | Versão |
| ------------------ | ------ |
| Angular            | 21     |
| TypeScript         | 5.9    |
| RxJS               | 7.8    |
| Angular Router     | 21     |
| Angular HttpClient | 21     |
| Vitest             | 4      |
| JSDOM              | 28     |
| Node.js            | 22+    |
| npm                | 11+    |

---

## Arquitetura Modular

```text
src/app
│
├── core
│   ├── config
│   ├── guards
│   ├── interceptors
│   ├── services
│   └── core.module.ts
│
├── shared
│   ├── components
│   ├── directives
│   ├── pipes
│   └── shared.module.ts
│
├── layouts
│   ├── main-layout
│   └── layouts.module.ts
│
├── features
│   ├── admin
│   ├── auth
│   ├── cart
│   ├── home
│   ├── products
│   └── user
│
├── app.routes.ts
├── app.module.ts
└── app.component.ts
```

---

## Core Module

Contém recursos globais da aplicação.

### Responsabilidades

- Guards de autenticação
- Guards administrativos
- Interceptors HTTP
- Serviços singleton
- Configurações da aplicação

O CoreModule possui proteção contra múltiplas importações.

---

## Shared Module

Centraliza recursos reutilizáveis.

### Componentes Compartilhados

| Componente           | Descrição                             |
| -------------------- | ------------------------------------- |
| NavbarComponent      | Navegação principal                   |
| FooterComponent      | Rodapé global                         |
| ProductCardComponent | Card padrão para exibição de produtos |

### Pipes

| Pipe            | Descrição                          |
| --------------- | ---------------------------------- |
| CurrencyBrlPipe | Formatação monetária em Real (BRL) |

### Diretivas

| Diretiva            | Descrição                                   |
| ------------------- | ------------------------------------------- |
| FieldErrorDirective | Controle e exibição de erros em formulários |

### Módulos Reexportados

- FormsModule
- ReactiveFormsModule
- RouterLink

---

## Layout Module

### MainLayoutComponent

Estrutura principal da aplicação:

- Header
- Footer
- Área de conteúdo
- Router Outlet

---

## Feature Modules

### HomeModule

Responsável pela página inicial e navegação por modalidades.

Componentes:

- IndexComponent
- ModalitiesComponent

### ProductsModule

Responsável pela navegação e consulta de produtos.

Componentes:

- ProductDetailsComponent
- SearchResultComponent

### CartModule

Responsável pelo carrinho de compras.

Componentes:

- CartPageComponent

### UserModule

Área do usuário autenticado.

Componentes:

- UserDetailsComponent

Proteção:

- authGuard

### AuthModule

Autenticação e gerenciamento de acesso.

Componentes:

- LoginComponent
- RegisterComponent
- PasswordResetComponent

### AdminModule

Área administrativa.

Componentes:

- DashboardComponent
- ProductListComponent
- ProductCreateComponent
- ProductEditComponent

Proteção:

- authGuard
- adminGuard

---

## Serviços Principais

### CartService

Gerencia o carrinho de compras utilizando BehaviorSubject e Local Storage.

Funcionalidades:

- Adicionar itens
- Remover itens
- Incrementar quantidade
- Decrementar quantidade
- Limpar carrinho
- Calcular total da compra
- Persistência local

### ProductService

Gerencia o catálogo de produtos.

Funcionalidades:

- Listagem completa
- Busca por ID
- Busca por modalidade
- Busca por nome
- Cadastro
- Atualização
- Exclusão

Observação:

O MockAPI possui limite de 100 registros por coleção. Por isso os produtos são divididos entre:

```text
/products
/products2
```

### UserService

Gerencia o usuário autenticado.

Funcionalidades:

- Obter usuário atual
- Atualizar perfil
- Sincronizar sessão
- Estado reativo via BehaviorSubject

### FreightService

Integração de cálculo de frete.

Funcionalidades:

- Validação de CEP
- Comunicação com Serverless Function
- Integração com Melhor Envio
- Tratamento de erros

Endpoint:

```text
POST /api/freight
```

---

## Sistema de Segurança

### Auth Guard

Protege rotas que exigem autenticação.

Utilizado em:

- /user
- /admin

### Admin Guard

Protege funcionalidades administrativas.

Utilizado em:

- /admin

### HTTP Interceptor

Interceptor global:

```typescript
authInterceptor;
```

Responsável por anexar credenciais e centralizar regras de autenticação.

---

## Lazy Loading

Todos os módulos de funcionalidades são carregados sob demanda utilizando Lazy Loading.

Benefícios:

- Melhor performance inicial
- Menor bundle inicial
- Maior escalabilidade

---

## Tabela de Rotas

### Rotas Públicas

| Rota                        | Descrição               |
| --------------------------- | ----------------------- |
| /home                       | Página inicial          |
| /home/modalidades/:modality | Produtos por modalidade |
| /products/search            | Busca de produtos       |
| /products/:id               | Detalhes do produto     |
| /cart                       | Carrinho de compras     |
| /auth/login                 | Login                   |
| /auth/cadastro              | Cadastro                |
| /auth/recuperar-senha       | Recuperação de senha    |

### Rotas Autenticadas

| Rota  | Descrição         |
| ----- | ----------------- |
| /user | Perfil do usuário |

### Rotas Administrativas

| Rota                       | Descrição           |
| -------------------------- | ------------------- |
| /admin                     | Dashboard           |
| /admin/produtos            | Lista de produtos   |
| /admin/produtos/novo       | Cadastro de produto |
| /admin/produtos/editar/:id | Edição de produto   |

---

## Pré-requisitos

- Node.js 22 ou superior
- npm 11 ou superior
- Angular CLI 21

Verificação:

```bash
node -v
npm -v
ng version
```

---

## Instalação

### Clonar repositório

```bash
git clone https://git.pdcase.com/pdcase-projetos-internos/jovens-talentos/angular/pdsports.git
cd pd-sports
```

### Instalar dependências

```bash
npm install
```

### Executar localmente

```bash
npm start
```

ou

```bash
ng serve
```

Acesse:

```text
http://localhost:4200
```

---

## Build

```bash
npm run build
```

---

## Testes

```bash
npm test
```

---

## Scripts

| Comando       | Descrição                |
| ------------- | ------------------------ |
| npm start     | Executa ambiente local   |
| npm run build | Build de produção        |
| npm run watch | Build contínuo           |
| npm test      | Executa testes unitários |

---

## Autoria

Projeto desenvolvido por **Roger Marllus Oliveira Leal** como atividade de estágio na **PD Case**.