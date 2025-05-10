# Backend - Quick Table

Este repositório contém o código-fonte do backend do projeto **Quick Table**, responsável por gerenciar a lógica de negócios, APIs e integração com o banco de dados.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript.
- **Express**: Framework para criação de APIs.
- **MongoDB**: Banco de dados NoSQL.
- **Mongoose**: ODM para MongoDB.
- **JWT**: Autenticação baseada em tokens.
- **Dotenv**: Gerenciamento de variáveis de ambiente.

## Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/   # Lógica dos endpoints
│   ├── models/        # Modelos do banco de dados
│   ├── routes/        # Definição de rotas
│   ├── middlewares/   # Middlewares personalizados
│   ├── utils/         # Funções utilitárias
│   └── app.js         # Configuração principal do app
├── .env.example       # Exemplo de variáveis de ambiente
├── package.json       # Dependências e scripts
└── README.md          # Documentação do backend
```

## Configuração

1. Clone o repositório:
    ```bash
    cd quick-table/backend
    ```

2. Instale as dependências:
    ```bash
    npm install
    ```

3. Configure as variáveis de ambiente:
    - Renomeie o arquivo `.env.example` para `.env`.
    - Preencha as variáveis necessárias, como a URL do banco de dados e a chave secreta do JWT.

4. Inicie o servidor:
    ```bash
    npm start dev
    ```

## Endpoints Principais

- **`POST /api/auth/login`**: Autenticação de usuários.
- **`GET /api/tables`**: Listagem de mesas.
- **`POST /api/orders`**: Criação de pedidos.
