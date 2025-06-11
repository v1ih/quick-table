const path = require('path');
const Usuario = require('../models/Usuario');

exports.atualizarPerfil = async (req, res) => {
  const { id } = req.usuario;
  const { nome, email, telefone, fotoPerfil } = req.body; // inclua fotoPerfil

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    usuario.nome = nome || usuario.nome;
    usuario.email = email || usuario.email;
    usuario.telefone = telefone || usuario.telefone;
    if (fotoPerfil) usuario.fotoPerfil = fotoPerfil; // atualiza foto se enviada

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

exports.atualizarFotoPerfil = async (req, res) => {
  const { id } = req.usuario; // ID do usuário autenticado (via JWT)
  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
    }

    usuario.fotoPerfil = req.file.path.replace(/\\/g, '/'); // Caminho relativo
    await usuario.save();

    res.json({ mensagem: 'Foto de perfil atualizada!', fotoPerfil: usuario.fotoPerfil });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar foto de perfil: ' + error.message });
  }
};