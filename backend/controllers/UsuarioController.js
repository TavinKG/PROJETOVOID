const Morador = require('../models/Morador'); // Importa a classe Morador
const Administrador = require('../models/Administrador'); // Importa a classe Administrador
const MoradorDAO = require('../dao/MoradorDAO');
const AdministradorDAO = require('../dao/AdministradorDAO');
const UsuarioDAO = require('../dao/UsuarioDAO');
const Usuario = require('../models/Usuario');

class UsuarioController {
  static async register(req, res) {
    try {
      const { tipoUsuario, nome, email, senha, cpf, dataNascimento, telefone} = req.body;

      let data;
      const usuario = new Usuario(null, nome, email, senha, cpf, dataNascimento, telefone, tipoUsuario );
      data = await UsuarioDAO.createUsuario(usuario);

      res.status(201).json(data);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const data = await UsuarioDAO.loginUsuario(email, password);

      res.cookie('tipoUsuario', data.tipo_usuario, { httpOnly: true, secure: false});
      res.cookie('userId', data.id, { httpOnly: true, secure: false});

      res.status(200).json(data);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = UsuarioController;
