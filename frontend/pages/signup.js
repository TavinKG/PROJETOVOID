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
    if (formData.senha.length < 8) { // Aumentado para 8 caracteres para senhas fortes
        setError('A senha deve ter no mínimo 8 caracteres.');
        setLoading(false);
        return;
    }
    if (!/[A-Z]/.test(formData.senha)) {
        setError('A senha deve conter pelo menos uma letra maiúscula.');
        setLoading(false);
        return;
    }
    if (!/[a-z]/.test(formData.senha)) {
        setError('A senha deve conter pelo menos uma letra minúscula.');
        setLoading(false);
        return;
    }
    if (!/[0-9]/.test(formData.senha)) {
        setError('A senha deve conter pelo menos um número.');
        setLoading(false);
        return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.senha)) { // Exemplo de caracteres especiais
        setError('A senha deve conter pelo menos um caractere especial (!@#$%^&*...).');
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
        let errorMessage = 'Erro ao registrar usuário. Tente novamente.'; 
        if (data.error && typeof data.error === 'string') {
          if (data.error.includes('duplicate key value violates unique constraint "usuario_cpf_key"')) {
            errorMessage = 'Este CPF já está cadastrado. Por favor, utilize outro ou faça login.';
          } else if (data.error.includes('duplicate key value violates unique constraint "usuario_email_key"')) { // Adicionei para o caso de e-mail
            errorMessage = 'Este e-mail já está cadastrado. Por favor, utilize outro ou faça login.';
          } else {
            errorMessage = data.error; 
          }
        } else if (data.message) {
            errorMessage = data.message;
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError('Erro na comunicação com o servidor. Verifique sua conexão.');
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
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div className="card shadow p-4 w-100 rounded-4" style={{ maxWidth: '600px', backgroundColor: 'rgb(31 41 55)', color: '#fff', fontWeight: 'bold' }}>
          <div className="text-center mb-4">
            <img src="/logos/icone-escuro.png" alt="VOID Logo" className="mb-2" style={{ height: '100px' }} />
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
                className="form-control rounded-pill"
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
                className="form-control rounded-pill"
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
                  className="form-control rounded-pill"
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
                  className="form-control rounded-pill"
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
                  className="form-control rounded-pill"
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
                  className="form-control rounded-pill"
                  value={formData.senha}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-info w-100 py-2 mt-3 rounded-pill"
              disabled={loading}
              style={{fontWeight: 'bold'}}
            >
              {loading ? 'CADASTRANDO...' : 'CADASTRAR'}
            </button>
            {error && <p className="text-danger text-center mt-3">{error}</p>}

            <p className="text-center mt-3 mb-0">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-decoration-none" style={{color: '#4fc1e9'}}>
                Faça login aqui
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}