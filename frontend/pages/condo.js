import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react'; // Adicionado useCallback
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head'; // Importar Head para o título da página

export default function Condo() {
    const router = useRouter();
    const userId = Cookies.get('userId');
    const [condominioID, setCondominioId] = useState(null);
    const [condominiosPendentes, setCondominiosPendentes] = useState([]); // Renomeado para clareza
    const [notificacoesToggle, setNotificacoesToggle] = useState(false);
    const [tipoUsuario, setTipoUsuario] = useState(null);

    // Usa useCallback para memorizar a função e evitar recriações desnecessárias
    const fetchCondominiosPendentes = useCallback(async () => {
        if (!condominioID) return; // Garante que condominioID existe

        try {
            const response = await fetch(`http://localhost:5000/api/usuariocondominio/${condominioID}/pendentes`);
            if (response.ok) {
                const data = await response.json();
                console.log("Dados de solicitações pendentes:", data.data);
                setCondominiosPendentes(data.data);
            } else {
                console.error('Erro ao buscar usuários pendentes:', response.statusText);
                setCondominiosPendentes([]); // Garante lista vazia em caso de erro
            }
        } catch (error) {
            console.error('Erro ao buscar dados dos usuários:', error);
            setCondominiosPendentes([]); // Garante lista vazia em caso de erro
        }
    }, [condominioID]); // Depende do condominioID

    useEffect(() => {
        if (!userId) {
            router.push('/login');
        } else {
            setCondominioId(router.query.id);
            setTipoUsuario(Cookies.get('tipoUsuario'));
        }
    }, [userId, router]);

    // Dispara a busca quando condominioID é definido ou muda
    useEffect(() => {
        if (condominioID) {
            fetchCondominiosPendentes();
        }
    }, [condominioID, fetchCondominiosPendentes]); // Adicionado fetchCondominiosPendentes como dependência

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
                
                // *** MELHORIA AQUI: REMOVER DA LISTA INSTANTANEAMENTE ***
                setCondominiosPendentes(prevPendentes => 
                    prevPendentes.filter(usuario => usuario.id !== usuarioId)
                );
                // fetchCondominiosPendentes(); // Esta linha se torna opcional para atualização imediata, mas pode ser mantida para garantir consistência a longo prazo
                                               // Se houver muitos administradores, um fetch pode ser melhor para ter a lista mais atualizada do BD.
                                               // Para o seu caso (TCC), filtrar localmente já é suficiente e resolve o problema visual.

            } else {
                const error = await response.json();
                console.error('Erro ao alterar status do vínculo:', error.message);
                alert(`Erro: ${error.message || 'Erro desconhecido ao processar a solicitação.'}`);
            }
        } catch (error) {
            console.error('Erro ao alterar status do vínculo:', error);
            alert('Erro ao processar a solicitação.');
        }
    };

    return (
        <>
            <Head>
                <title>Condomínio - Notificações</title>
            </Head>

            <div className="container mt-5"> {/* Container para melhor organização */}
                <h1 className="mb-4">Página do Condomínio</h1> {/* Título da página */}

                {/* Botão de Notificações (visível apenas para Administrador) */}
                {tipoUsuario === 'Administrador' && (
                    <button
                        type="button"
                        className="btn btn-primary mt-3 me-2" // Adicionado margem para o botão de Avisos
                        onClick={() => {
                            setNotificacoesToggle(!notificacoesToggle);
                            // Se as notificações forem abertas, force a busca para ter os dados mais recentes
                            if (!notificacoesToggle) {
                                fetchCondominiosPendentes(); 
                            }
                        }}
                    >
                        Notificações ({condominiosPendentes.length}) {/* Contagem de notificações */}
                    </button>
                )}

                {/* Botão de Avisos */}
                <button
                    type="button"
                    className="btn btn-secondary mt-3"
                    onClick={() => router.push(`/avisos?id=${condominioID}`)} // CondominioID já deve estar disponível
                >
                    Avisos
                </button>

                {/* Seção de Solicitações (visível se notificacoesToggle for true) */}
                {notificacoesToggle && tipoUsuario === 'Administrador' && ( // Verifica também se é Administrador
                    <div className="mt-4">
                        <h2>Solicitações de Ingresso</h2> {/* Título mais descritivo */}
                        {condominiosPendentes.length > 0 ? (
                            condominiosPendentes.map((usuario) => (
                                <div key={usuario.id} className="card mb-3 shadow-sm"> {/* Adicionado sombra */}
                                    <div className="card-body">
                                        <h5 className="card-title">{usuario.nome}</h5>
                                        <p className="card-text mb-1"><strong>Email:</strong> {usuario.email}</p>
                                        <p className="card-text mb-1"><strong>CPF:</strong> {usuario.cpf}</p>
                                        <p className="card-text mb-1"><strong>Telefone:</strong> {usuario.telefone}</p>
                                        <p className="card-text mb-2"><strong>Tipo de Usuário:</strong> {usuario.tipo_usuario}</p>
                                        <div className="d-flex justify-content-end"> {/* Alinha botões à direita */}
                                            <button
                                                type="button"
                                                className="btn btn-success me-2" // Alterado para success e margem
                                                onClick={() => alterarStatusVinculo(usuario.id, 1)}
                                            >
                                                Aceitar
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() => alterarStatusVinculo(usuario.id, 2)}
                                            >
                                                Recusar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-info">Não há solicitações de ingresso pendentes no momento.</p>
                        )}
                    </div>
                )}
                
                {/* Botão de Logout */}
                <div className="mt-4">
                    <LogoutButton />
                </div>
            </div>
        </>
    );
}