# Quick Table

Quick Table é uma solução digital desenvolvida para facilitar e otimizar o gerenciamento de reservas de mesas em restaurantes. O sistema oferece uma experiência intuitiva tanto para proprietários/administradores quanto para clientes, promovendo agilidade, organização e melhor experiência de atendimento.

## Visão Geral

O objetivo do Quick Table é eliminar filas, evitar overbooking e proporcionar maior controle sobre a ocupação do restaurante, além de permitir que clientes reservem mesas de forma prática, rápida e segura.

## Funcionalidades Principais

- Gerenciamento completo de reservas: criação, edição, confirmação e cancelamento
- Visualização em tempo real da disponibilidade de mesas
- Cadastro e gerenciamento de restaurantes, mesas e usuários
- Histórico de reservas para clientes e restaurantes
- Sistema de avaliações e feedbacks dos clientes
- Notificações sobre status das reservas
- Interface responsiva e amigável para dispositivos móveis

## Tecnologias Utilizadas

### Frontend
- TypeScript
- React Native com Expo
- React Navigation (navegação)
- Axios (comunicação com API)
- AsyncStorage (armazenamento local)

### Backend
- JavaScript
- Node.js com Express
- MySQL (banco de dados relacional, gerenciado com Sequelize)
- JWT (autenticação)
- Sequelize CLI (migrações e seeds)

## Como Executar o Projeto

1. Clone este repositório.
2. Instale as dependências do backend e frontend com `npm install` ou `yarn` nas respectivas pastas.
3. Configure o banco de dados MySQL e ajuste as variáveis de ambiente conforme necessário.
4. Execute as migrações do banco de dados usando o Sequelize CLI.
5. Inicie o backend (`npm start` ou `node server.js` na pasta backend).
6. Inicie o frontend com `npx expo start` na pasta frontend.

## Estrutura do Projeto

- `backend/`: API RESTful, modelos, controladores, rotas e configurações do servidor
- `frontend/`: Aplicativo mobile desenvolvido em React Native

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests para sugerir melhorias ou reportar problemas.

## Licença

Este projeto é de uso acadêmico e livre para fins de estudo.

