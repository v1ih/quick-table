const Usuario = require('../models/Usuario');

exports.atualizarPerfil = async (req, res) => {
  const { id } = req.usuario; // ID do usuário autenticado (via JWT)
  const { nome, email, telefone } = req.body; // Inclui o telefone

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    usuario.nome = nome || usuario.nome;
    usuario.email = email || usuario.email;
    usuario.telefone = telefone || usuario.telefone; // Atualiza o telefone
    
    await usuario.save();

    res.json({ mensagem: 'Perfil atualizado com sucesso!', usuario });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar o perfil: ' + error.message });
  }
};

exports.deletarUsuario = async (req, res) => {
  const { id } = req.usuario; // ID do usuário autenticado (via JWT)

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    await usuario.destroy(); // Exclui o usuário do banco de dados
    res.json({ mensagem: 'Usuário deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar o usuário: ' + error.message });
  }
};