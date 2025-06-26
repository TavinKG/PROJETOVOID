// pages/condo.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';
import Image from 'next/image';

export default function Condo() {
    const router = useRouter();
    const userId = Cookies.get('userId');
    const [condominioID, setCondominioId] = useState(null);
    const [condominioNome, setCondominioNome] = useState(''); // NOVO ESTADO: para armazenar o nome do condomínio
    const [condominiosPendentes, setCondominiosPendentes] = useState([]);
    const [tipoUsuario, setTipoUsuario] = useState(null);
    const [showNotificacoesModal, setNotificacoesModal] = useState(false);

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

            <nav className="navbar navbar-expand-lg shadow-sm" style={{height:'10vh'}}> {/* Usando bg-light, ajuste para sua cor padrão */}
                <div className="container-fluid">
                    {/* Logo na Esquerda */}
                    <a className="navbar-brand d-flex align-items-center" href="/home">
                        <Image 
                            src="/logos/horizontal-escuro-cheio.png" // Ajuste o src para o caminho real da sua logo
                            alt="VOID Logo" 
                            width={170} 
                            height={170} 
                            priority={true} 
                            style={{marginLeft:'125px', objectFit: 'contain'}} // objectFit para ajustar imagem
                        />
                    </a>
    
                    {/* Botões alinhados à Direita */}
                    <div className="d-flex align-items-center" style={{marginRight:'125px'}}>
                        {/* Botão de Notificações (visível apenas para Administrador) */}
                        {tipoUsuario === 'Administrador' && (
                            <button
                                type="button"
                                className="btn btn-primary me-2"
                                onClick={() => setNotificacoesModal(true)}
                                style={{color:'#fff', background:'none', border:'none'}}
                            >
                                Gerenciar Ingressos ({condominiosPendentes.length})
                            </button>
                        )}

                        {/* Botão para Áreas Comuns */}
                        <button
                            type="button"
                            className="btn btn-info me-2"
                            onClick={() => router.push(`/areas-comuns?id=${condominioID}`)}
                            style={{color:'#fff', background:'none', border:'none'}}
                        >
                            Áreas Comuns
                        </button>

                        {/* Botão para Minhas Reservas (visível apenas para Morador) */}
                        {tipoUsuario === 'Morador' && (
                            <button
                                type="button"
                                className="btn btn-info me-2"
                                onClick={() => router.push(`/minhas-reservas?condominioId=${condominioID}`)}
                                style={{color:'#fff', background:'none', border:'none'}}
                            >
                                Minhas Reservas
                            </button>
                        )}

                        {/* Botão para Gerenciar Reservas (visível apenas para Administrador) */}
                        {tipoUsuario === 'Administrador' && (
                            <button
                                type="button"
                                className="btn btn-info me-2"
                                onClick={() => router.push(`/gerenciar-reservas?id=${condominioID}`)}
                                style={{color:'#fff', background:'none', border:'none'}}
                            >
                                Gerenciar Reservas
                            </button>
                        )}

                        {/* Botão Assembleias */}
                        <button
                            type="button"
                            className="btn btn-info me-2"
                            onClick={() => router.push(`/assembleias?id=${condominioID}`)}
                            style={{color:'#fff', background:'none', border:'none'}}
                        >
                            Assembleias
                        </button>

                        {/* NOVO BOTÃO: Galeria de Fotos */}
                        <button
                            type="button"
                            className="btn btn-info me-2" // Escolha uma cor apropriada
                            onClick={() => router.push(`/galeria?id=${condominioID}`)}
                            style={{color:'#fff', background:'none', border:'none'}}
                        >
                            Galeria de Fotos
                        </button>

                        {/* NOVO BOTÃO: Eventos */}
                        <button
                            type="button"
                            className="btn btn-info me-2" // Usando 'primary' para destaque, pode mudar
                            onClick={() => router.push(`/eventos?id=${condominioID}`)}
                            style={{color:'#fff', background:'none', border:'none'}}
                        >
                            Eventos
                        </button>

                        {/* Botão de Avisos */}
                        <button
                            type="button"
                            className="btn btn-info me-5"
                            onClick={() => router.push(`/avisos?id=${condominioID}`)}
                            style={{color:'#fff', background:'none', border:'none'}}
                        >
                            Avisos
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary me-3 rounded-pill"
                            onClick={() => router.push('/home')}
                        >
                            Voltar
                        </button>
                        <LogoutButton />

                    </div>
                </div>
            </nav>

            <div className="container mt-5">
                {/* NOVO: Título principal da página com o nome do condomínio */}
                <h1 className="mb-4 text-center">
                    {condominioNome ? `Condomínio ${condominioNome}` : 'Condomínio'}
                </h1>

                {showNotificacoesModal && (tipoUsuario === 'Administrador') && (
                    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content" style={{color:'rgb(3 7 18)'}}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Solicitações de Ingresso</h5>
                                    <button type="button" className="btn-close" aria-label="Close" onClick={() => setNotificacoesModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    {condominiosPendentes.length > 0 ? (
                                        condominiosPendentes.map((usuario) => (
                                            <div key={usuario.id} className="card mb-3 mt-4 shadow-sm rounded-4" style={{backgroundColor: 'rgb(3 7 18)', color: '#fff', border: '2px solid #4fc1e9'}}>
                                                <div className="card-body">
                                                    <h5 className="card-title mb-4">{usuario.nome}</h5>
                                                    <p className="card-text mb-1"><strong>Email:</strong> {usuario.email}</p>
                                                    <p className="card-text mb-1"><strong>CPF:</strong> {usuario.cpf}</p>
                                                    <p className="card-text mb-1"><strong>Telefone:</strong> {usuario.telefone}</p>
                                                    <p className="card-text mb-2"><strong>Tipo de Usuário:</strong> {usuario.tipo_usuario}</p>
                                                    <div className="d-flex justify-content-end">
                                                        <button
                                                            type="button"
                                                            className="btn btn-success me-2 rounded-pill"
                                                            onClick={() => alterarStatusVinculo(usuario.id, 1)}
                                                        >
                                                            Aceitar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger rounded-pill"
                                                            onClick={() => alterarStatusVinculo(usuario.id, 2)}
                                                        >
                                                            Recusar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-dark">Não há solicitações de ingresso pendentes no momento.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}