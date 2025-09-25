// filepath: backend/server.js

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/autenticacaoRoutes');
const restauranteRoutes = require('./routes/restauranteRoutes');
const mesaRoutes = require('./routes/mesaRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');

// Inicializando o aplicativo Express
const app = express();

// Middleware para analisar JSON
app.use(express.json());

// Middleware para habilitar CORS
app.use(cors());

// Conexão com o banco de dados
sequelize.authenticate()
    .then(() => console.log('Conectado ao banco de dados!'))
    .catch((err) => console.error('Erro ao conectar ao banco de dados:', err));

// Sincronizando os modelos do banco de dados
sequelize.sync({ alter: true }) // Use { alter: true } para atualizar o banco de dados sem perder dados
    .then(() => console.log('Modelos sincronizados com o banco de dados!'))
    .catch((err) => console.error('Erro ao sincronizar modelos:', err));

// Rotas e Middleware
app.use('/api/auth', authRoutes); 
app.use('/api/restaurantes', restauranteRoutes); 
app.use('/api/mesas', mesaRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);
app.use('/uploads', express.static('uploads'));

// Middleware para rotas inexistentes
app.use((req, res, next) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
});

// Middleware de erros
app.use(errorHandler);

// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
