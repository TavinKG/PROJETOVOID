// pages/condo.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';

export default function Condo() {
    const router = useRouter();
    const userId = Cookies.get('userId');
    const [condominioID, setCondominioId] = useState(null);
    const [condominioNome, setCondominioNome] = useState(''); // NOVO ESTADO: para armazenar o nome do condomínio
    const [condominiosPendentes, setCondominiosPendentes] = useState([]);
    const [notificacoesToggle, setNotificacoesToggle] = useState(false);
    const [tipoUsuario, setTipoUsuario] = useState(null);

    const fetchCondominiosPendentes = useCallback(async () => {
        if (!condominioID) return;

        try {
            const response = await fetch(`http://localhost:5000/api/usuariocondominio/${condominioID}/pendentes`);
            if (response.ok) {
                const data = await response.json();
                console.log("Dados de solicitações pendentes:", data.data);
                setCondominiosPendentes(data.data);
            } else {
                console.error('Erro ao buscar usuários pendentes:', response.statusText);
                setCondominiosPendentes([]);
            }
        } catch (error) {
            console.error('Erro ao buscar dados dos usuários:', error);
            setCondominiosPendentes([]);
        }
    }, [condominioID]);

    // NOVO: Função para buscar o nome do condomínio
    const fetchCondominioNome = useCallback(async () => {
        if (!condominioID) return;
        try {
            // Supondo que você tem um endpoint /api/condominios/:id que retorna os detalhes do condomínio
            const response = await fetch(`http://localhost:5000/api/condominios/${condominioID}`);
            if (response.ok) {
                const data = await response.json();
                setCondominioNome(data.nome); // Assume que a API retorna um objeto com a propriedade 'nome'
            } else {
                console.error('Erro ao buscar nome do condomínio:', response.statusText);
                setCondominioNome('Condomínio Não Encontrado');
            }
        } catch (error) {
            console.error('Erro de rede ao buscar nome do condomínio:', error);
            setCondominioNome('Erro ao Carregar Nome');
        }
    }, [condominioID]);


    useEffect(() => {
        if (!userId) {
            router.push('/login');
        } else {
            setCondominioId(router.query.id);
            setTipoUsuario(Cookies.get('tipoUsuario'));
        }
    }, [userId, router]);

    useEffect(() => {
        if (condominioID) {
            fetchCondominiosPendentes();
            fetchCondominioNome(); // NOVO: Chama a função para buscar o nome
        }
    }, [condominioID, fetchCondominiosPendentes, fetchCondominioNome]); // Adiciona fetchCondominioNome às dependências

    const alterarStatusVinculo = async (usuarioId, status) => {
        if (!confirm(`Tem certeza que deseja alterar o status do vínculo para ${status}?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/usuariocondominio/vinculo/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ condominioId: condominioID, usuarioId, status }),
            });

            if (response.ok) {
                alert('Status do vínculo atualizado com sucesso!');
                setCondominiosPendentes(prevPendentes =>
                    prevPendentes.filter(usuario => usuario.id !== usuarioId)
                );
            } else {
                const errorData = await response.json();
                console.error('Erro ao alterar status do vínculo:', errorData.message);
                alert(`Erro: ${errorData.message || 'Erro desconhecido ao processar a solicitação.'}`);
            }
        } catch (error) {
            console.error('Erro ao alterar status do vínculo:', error);
            alert('Erro ao processar a solicitação.');
        }
    };

    return (
        <>
            <Head>
                {/* NOVO: Título da página com o nome do condomínio */}
                <title>{condominioNome ? `${condominioNome} - Condomínio` : 'Página do Condomínio'}</title>
            </Head>

            <div className="container mt-5">
                {/* NOVO: Título principal da página com o nome do condomínio */}
                <h1 className="mb-4">
                    {condominioNome ? `Condomínio ${condominioNome}` : 'Condomínio'}
                </h1>

                {/* Container para os botões de ação */}
                <div className="d-flex flex-wrap align-items-center mb-4">
                    {/* Botão de Voltar para Home */}
                    <button
                        type="button"
                        className="btn btn-secondary me-2 mb-2"
                        onClick={() => router.push('/home')}
                    >
                        Voltar para Home
                    </button>

                    {/* Botão de Notificações (visível apenas para Administrador) */}
                    {tipoUsuario === 'Administrador' && (
                        <button
                            type="button"
                            className="btn btn-primary me-2 mb-2"
                            onClick={() => {
                                setNotificacoesToggle(!notificacoesToggle);
                                if (!notificacoesToggle) {
                                    fetchCondominiosPendentes();
                                }
                            }}
                        >
                            Notificações ({condominiosPendentes.length})
                        </button>
                    )}

                    {/* Botão para Áreas Comuns */}
                    <button
                        type="button"
                        className="btn btn-info me-2 mb-2"
                        onClick={() => router.push(`/areas-comuns?id=${condominioID}`)}
                    >
                        Áreas Comuns
                    </button>

                    {/* Botão para Minhas Reservas (visível apenas para Morador) */}
                    {tipoUsuario === 'Morador' && (
                        <button
                            type="button"
                            className="btn btn-info me-2 mb-2"
                            onClick={() => router.push(`/minhas-reservas?condominioId=${condominioID}`)}
                        >
                            Minhas Reservas
                        </button>
                    )}

                    {/* Botão para Gerenciar Reservas (visível apenas para Administrador) */}
                    {tipoUsuario === 'Administrador' && (
                        <button
                            type="button"
                            className="btn btn-info me-2 mb-2"
                            onClick={() => router.push(`/gerenciar-reservas?id=${condominioID}`)}
                        >
                            Gerenciar Reservas
                        </button>
                    )}

                    {/* Botão Assembleias */}
                    <button
                        type="button"
                        className="btn btn-info me-2 mb-2"
                        onClick={() => router.push(`/assembleias?id=${condominioID}`)}
                    >
                        Assembleias
                    </button>

                    {/* Botão de Avisos */}
                    <button
                        type="button"
                        className="btn btn-info mb-2"
                        onClick={() => router.push(`/avisos?id=${condominioID}`)}
                    >
                        Avisos
                    </button>
                </div>

                {/* Seção de Solicitações (visível se notificacoesToggle for true) */}
                {notificacoesToggle && tipoUsuario === 'Administrador' && (
                    <div className="mt-4">
                        <h2>Solicitações de Ingresso</h2>
                        {condominiosPendentes.length > 0 ? (
                            condominiosPendentes.map((usuario) => (
                                <div key={usuario.id} className="card mb-3 shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">{usuario.nome}</h5>
                                        <p className="card-text mb-1"><strong>Email:</strong> {usuario.email}</p>
                                        <p className="card-text mb-1"><strong>CPF:</strong> {usuario.cpf}</p>
                                        <p className="card-text mb-1"><strong>Telefone:</strong> {usuario.telefone}</p>
                                        <p className="card-text mb-2"><strong>Tipo de Usuário:</strong> {usuario.tipo_usuario}</p>
                                        <div className="d-flex justify-content-end">
                                            <button
                                                type="button"
                                                className="btn btn-success me-2"
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