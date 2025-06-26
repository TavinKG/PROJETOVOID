import { useRouter } from 'next/router';
import { useState } from 'react';
import Cookies from 'js-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';
import Head from 'next/head';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Cookies.set('tipoUsuario', data.tipo_usuario);
        Cookies.set('userId', data.id);

        console.log('Usuário logado com sucesso:', data);
        router.push('/home');
      } else {
        setError(data.message || data.error || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    } catch (err) {
      setError('Erro na comunicação com o servidor. Tente novamente mais tarde.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - PROJETO VOID</title>
      </Head>
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div className="card shadow p-4 w-100 rounded-4" style={{ maxWidth: '450px', backgroundColor: 'rgb(31 41 55)', color: '#fff'}}> {}
          <div className="text-center mb-4">
            <img src="/logos/icone-escuro.png" alt="VOID Logo" className="mb-3" style={{ height: '100px' }} />
            <h2 className="mb-0">Login</h2>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label" style={{fontWeight: 'bold'}}>Endereço de e-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control rounded-pill"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label" style={{fontWeight: 'bold'}}>Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control rounded-pill"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-info w-100 py-2 mt-3 rounded-pill"
              disabled={loading}
              style={{color: 'rgb(31 41 55)', fontWeight: 'bold'}}
            >
              {loading ? 'Entrando...' : 'Entrar'} {}
            </button>
            {error && <p className="text-danger text-center mt-3">{error}</p>}

            {}
            <p className="text-center mt-3 mb-0">
              Não tem uma conta?{' '}
              <Link href="/signup" className="text-decoration-none" style={{color: '#4fc1e9'}}>
                Cadastre-se aqui
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}