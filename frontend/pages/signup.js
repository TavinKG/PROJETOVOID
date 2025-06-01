import { useRouter } from 'next/router';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Head from 'next/head'; // Importar Head para SEO e título da página
import Link from 'next/link'; // Importar Link do Next.js para navegação otimizada

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
      // Basic client-side validation for CPF and phone format
      if (formData.cpf.length !== 11 || !/^\d+$/.test(formData.cpf)) {
        setError('CPF deve conter 11 dígitos numéricos.');
        setLoading(false);
        return;
      }
      if (!/^\d{10,11}$/.test(formData.telefone)) {
        setError('Telefone deve conter 10 ou 11 dígitos numéricos.');
        setLoading(false);
        return;
      }

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
        // Assume data.message for more specific errors from backend
        setError(data.message || data.error || 'Erro ao registrar usuário');
      }
    } catch (err) {
      setError('Erro na comunicação com o servidor. Tente novamente mais tarde.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Cadastro - PROJETO VOID</title>
      </Head>
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light"> {/* Added min-vh-100 and bg-light */}
        <div className="card shadow p-4 w-100" style={{ maxWidth: '600px' }}>
          <div className="text-center mb-4">
            {/* Ajuste do padding e margem da logo para melhor espaçamento */}
            <img src="/logos/logo-header1.png" alt="VOID Logo" className="mb-4" style={{ height: '80px' }} />
            <h2 className="mb-0">Cadastro</h2> {/* Reduzi a margem inferior do h2 */}
          </div>

          <div className="mb-4"> {/* Reduzi a margem inferior para mais compactação */}
            <label className="form-label d-block text-center fw-bold">Tipo de Usuário</label> {/* Centralizei e destaquei */}
            <div className="d-flex justify-content-center gap-4 mt-2"> {/* Centralizei os radio buttons */}
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

          <form onSubmit={handleSignup}>
            <div className="mb-3">
              <label htmlFor="nome" className="form-label">Nome completo</label>
              <input
                type="text"
                id="nome"
                name="nome"
                className="form-control"
                value={formData.nome}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Endereço de e-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="telefone" className="form-label">Telefone</label>
                <input
                  type="text"
                  id="telefone"
                  name="telefone"
                  className="form-control"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  placeholder="(XX) XXXXX-XXXX" // Adicionado placeholder para formato
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="cpf" className="form-label">CPF</label>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  className="form-control"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="XXX.XXX.XXX-XX" // Adicionado placeholder para formato
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="dataNascimento" className="form-label">Data de Nascimento</label>
                <input
                  type="date"
                  id="dataNascimento"
                  name="dataNascimento"
                  className="form-control"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="senha" className="form-label">Senha</label>
                <input
                  type="password"
                  id="senha"
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
              className="btn btn-dark w-100 py-2 mt-3" // Adicionado py-2 e mt-3 para melhor espaçamento e altura
              disabled={loading}
            >
              {loading ? 'CADASTRANDO...' : 'CADASTRAR'} {/* Alterei o texto para 'Cadastrando...' */}
            </button>
            {error && <p className="text-danger text-center mt-3">{error}</p>} {/* Centralizei o erro */}

            {/* Novo elemento: Link para a página de Login */}
            <p className="text-center mt-3 mb-0">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-decoration-none">
                Faça login aqui
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}