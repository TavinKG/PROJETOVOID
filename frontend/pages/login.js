import { useRouter } from 'next/router';
import { useState } from 'react';
import Cookies from 'js-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        setError(data.error || 'Erro ao fazer login');
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
          <h2>Login</h2>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Endereço de e-mail</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-dark w-100"
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Entrar'}
          </button>
          {error && <p className="text-danger mt-3">{error}</p>}
        </form>
      </div>
    </div>
  );
}
