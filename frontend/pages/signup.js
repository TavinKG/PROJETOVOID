import { useRouter } from 'next/router';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Signup() {
  const [tipoUsuario, setTipoUsuario] = useState('Morador');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    dataNascimento: '',
    telefone: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tipoUsuario,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log('Usuário cadastrado com sucesso:', data);
        router.push('/login');
      } else {
        setError(data.error || 'Erro ao registrar usuário');
      }
    } catch (err) {
      setError('Erro na comunicação com o servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center mt-5">
      <div className="card shadow p-4 w-100" style={{ maxWidth: '600px' }}>
        <div className="text-center mb-4">
          <img src="/logos/logo-header1.png" alt="VOID Logo" className="m-5" style={{ height: '60px' }} />
          <h2>Cadastro</h2>
        </div>
        {/* Adicionado grupo de Radio Buttons */}
        <div className="mb-5">
          <label className="form-label">Tipo de Usuário</label>
          <div className="d-flex gap-3">
            <div className="form-check">
              <input
                type="radio"
                id="morador"
                name="tipoUsuario"
                value="Morador"
                className="form-check-input"
                checked={tipoUsuario === 'Morador'}
                onChange={(e) => setTipoUsuario(e.target.value)}
              />
              <label className="form-check-label" htmlFor="morador">Morador</label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                id="administrador"
                name="tipoUsuario"
                value="Administrador"
                className="form-check-input"
                checked={tipoUsuario === 'Administrador'}
                onChange={(e) => setTipoUsuario(e.target.value)}
              />
              <label className="form-check-label" htmlFor="administrador">Administrador</label>
            </div>
          </div>
        </div>
        {/* Formulário */}
        <form onSubmit={handleSignup}>
          <div className="mb-3">
            <label className="form-label">Nome completo</label>
            <input
              type="text"
              name="nome"
              className="form-control"
              value={formData.nome}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Endereço de e-mail</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Telefone</label>
              <input
                type="text"
                name="telefone"
                className="form-control"
                value={formData.telefone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">CPF</label>
              <input
                type="text"
                name="cpf"
                className="form-control"
                value={formData.cpf}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Data de Nascimento</label>
              <input
                type="date"
                name="dataNascimento"
                className="form-control"
                value={formData.dataNascimento}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Senha</label>
              <input
                type="password"
                name="senha"
                className="form-control"
                value={formData.senha}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-dark w-100"
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'CADASTRAR'}
          </button>
          {error && <p className="text-danger mt-3">{error}</p>}
        </form>
      </div>
    </div>
  );
}
