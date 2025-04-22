import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';

export default function Condo() {
    const router = useRouter();
    const userId = Cookies.get('userId');
    const [condominioID, setCondominioId] = useState(null);
    const [condominiosUsuario, setCondominiosUsuario] = useState([]);
    const [notificacoesToggle, setNotificacoesToggle] = useState(false);
    const [tipoUsuario, setTipoUsuario] = useState(null);

    useEffect(() => {
        if (!userId) {
            router.push('/login');
        } else {
            setCondominioId(router.query.id);
            setTipoUsuario(Cookies.get('tipoUsuario'));
        }
    }, [tipoUsuario, userId, router]);

    useEffect(() => {
        if (condominioID) {
            fetchCondominiosUsuario();
        }
    }, [condominioID]);

    const fetchCondominiosUsuario = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/usuariocondominio/${condominioID}/pendentes`);
            if (response.ok) {
                const data = await response.json();
                console.log(data.data);
                setCondominiosUsuario(data.data);
            } else {
                console.error('Erro ao buscar usuários pendentes');
            }
        } catch (error) {
            console.error('Erro ao buscar dados dos usuários:', error);
        }
    };

    const alterarStatusVinculo = async (usuarioId, status) => {
        try {
            const response = await fetch(`http://localhost:5000/api/usuariocondominio/vinculo/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ condominioId: condominioID, usuarioId, status }),
            });

            if (response.ok) {
                alert(status === 1 ? 'Solicitação aceita com sucesso!' : 'Solicitação recusada com sucesso!');
                fetchCondominiosUsuario(); // Atualiza a lista após alterar o status
            } else {
                const error = await response.json();
                console.error('Erro ao alterar status do vínculo:', error.message);
                alert(`Erro: ${error.message}`);
            }
        } catch (error) {
            console.error('Erro ao alterar status do vínculo:', error);
            alert('Erro ao processar a solicitação.');
        }
    };

    return (
        <>
            {tipoUsuario === 'Administrador' && (
                <button
                    type="button"
                    className="btn btn-primary mt-3"
                    onClick={() => {
                        setNotificacoesToggle(!notificacoesToggle);
                    }}
                >
                    Notificações
                </button>
            )}

            {notificacoesToggle ? (
                condominiosUsuario.length > 0 ? (
                    <div className="mt-4">
                        <h2>Solicitações</h2>
                        {condominiosUsuario.map((usuario) => (
                            <div key={usuario.id} className="card mb-3">
                                <div className="card-body">
                                    <h5 className="card-title">{usuario.nome}</h5>
                                    <p className="card-text">
                                        <strong>Email:</strong> {usuario.email}
                                    </p>
                                    <p className="card-text">
                                        <strong>CPF:</strong> {usuario.cpf}
                                    </p>
                                    <p className="card-text">
                                        <strong>Telefone:</strong> {usuario.telefone}
                                    </p>
                                    <p className="card-text">
                                        <strong>Tipo de Usuário:</strong> {usuario.tipo_usuario}
                                    </p>
                                    <button
                                        type="button"
                                        className="btn btn-primary mt-3 me-3"
                                        onClick={() => alterarStatusVinculo(usuario.id, 1)}
                                    >
                                        Aceitar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger mt-3"
                                        onClick={() => alterarStatusVinculo(usuario.id, 2)}
                                    >
                                        Recusar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Não foram encontradas solicitações pendentes.</p>
                )
            ) : null}

            {/* Botão de Avisos */}
            <div className="mt-3">
                <button
                    type="button"
                    className="btn btn-secondary"
                    key={condominioID}
                    onClick={() => router.push(`/avisos?id=${condominioID}`)}
                >
                    Avisos
                </button>
            </div>

            {/* Botão de Logout */}
            <div className="mt-4">
                <LogoutButton />
            </div>
            
        </>
    );
}