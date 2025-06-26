import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Remove os cookies
    Cookies.remove('tipoUsuario');
    Cookies.remove('userId');

    // Redireciona para a página de login
    router.push('/login');
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger rounded-pill">
      Sair
    </button>
  );
}
