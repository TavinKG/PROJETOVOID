import { useRouter } from 'next/router';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Head from 'next/head';
import Link from 'next/link';
import { IMaskInput } from 'react-imask';

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

    // Validações aprimoradas no frontend, usando os valores LIMPOS
    if (formData.cpf.length !== 11) {
      setError('CPF inválido. Deve conter 11 dígitos.');
      setLoading(false);
      return;
    }
    if (formData.telefone.length < 10 || formData.telefone.length > 11) {
      setError('Telefone inválido. Deve conter 10 ou 11 dígitos (DDD + número).');
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Formato de e-mail inválido.');
        setLoading(false);
        return;
    }
    if (formData.senha.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        setLoading(false);
        return;
    }

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
        // --- INÍCIO DA CORREÇÃO ---
        let errorMessage = 'Erro ao registrar usuário. Tente novamente.'; // Mensagem genérica padrão
        if (data.error && typeof data.error === 'string') {
          // Verifica se o erro do backend é uma string e tenta mapear
          if (data.error.includes('duplicate key value violates unique constraint "usuario_cpf_key"')) {
            errorMessage = 'Este CPF já está cadastrado. Por favor, utilize outro ou faça login.';
          } else if (data.error.includes('duplicate key value violates unique constraint "usuario_email_key"')) { // Adicionei para o caso de e-mail
            errorMessage = 'Este e-mail já está cadastrado. Por favor, utilize outro ou faça login.';
          } else {
            // Se for outro erro do backend que não mapeamos, exibe a mensagem original ou uma mais geral
            errorMessage = data.error; 
          }
        } else if (data.message) {
            // Se o backend enviar uma mensagem mais amigável via 'message'
            errorMessage = data.message;
        }
        setError(errorMessage);
        // --- FIM DA CORREÇÃO ---
      }
    } catch (err) {
      setError('Erro na comunicação com o servidor. Verifique sua conexão.'); // Mensagem mais específica para erro de rede
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
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
        <div className="card shadow p-4 w-100" style={{ maxWidth: '600px' }}>
          <div className="text-center mb-4">
            <img src="/logos/logo-header1.png" alt="VOID Logo" className="mb-4" style={{ height: '80px' }} />
            <h2 className="mb-0">Cadastro</h2>
          </div>

          <div className="mb-4">
            <label className="form-label d-block text-center fw-bold">Tipo de Usuário</label>
            <div className="d-flex justify-content-center gap-4 mt-2">
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
                <IMaskInput
                  mask="(00) 00000-0000"
                  definitions={{
                    '0': /[0-9]/,
                  }}
                  id="telefone"
                  name="telefone"
                  className="form-control"
                  value={formData.telefone} 
                  onAccept={(value, mask) => {
                    setFormData(prevData => ({ ...prevData, telefone: mask.unmaskedValue }));
                  }} 
                  placeholder="(XX) XXXXX-XXXX"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="cpf" className="form-label">CPF</label>
                <IMaskInput
                  mask="000.000.000-00"
                  definitions={{
                    '0': /[0-9]/,
                  }}
                  id="cpf"
                  name="cpf"
                  className="form-control"
                  value={formData.cpf} 
                  onAccept={(value, mask) => {
                    setFormData(prevData => ({ ...prevData, cpf: mask.unmaskedValue }));
                  }} 
                  placeholder="XXX.XXX.XXX-XX"
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
              className="btn btn-dark w-100 py-2 mt-3"
              disabled={loading}
            >
              {loading ? 'CADASTRANDO...' : 'CADASTRAR'}
            </button>
            {error && <p className="text-danger text-center mt-3">{error}</p>}

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