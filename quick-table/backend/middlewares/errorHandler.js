// filepath: backend/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
    console.error('Erro no servidor:', err.stack); // Log detalhado do erro
    res.status(500).json({ erro: err.message || 'Algo deu errado!' }); // Retorna a mensagem real do erro
};