// pages/areas-comuns.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton'; // Mantenha se quiser o logout aqui também
import Head from 'next/head';

export default function AreasComuns() {
    const router = useRouter();
    const userId = Cookies.get('userId'); // Pode ser útil para verificar permissões futuras
    const [condominioID, setCondominioId] = useState(null);
    const [areasComuns, setAreasComuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) { // Redireciona se não houver usuário logado
            router.push('/login');
        } else {
            // Pega o ID do condomínio da URL
            const { id } = router.query;
            if (id) {
                setCondominioId(id);
            } else {
                // Se não houver ID na URL, pode redirecionar ou mostrar um erro
                console.error("ID do condomínio não encontrado na URL.");
                setError("ID do condomínio não encontrado.");
                setLoading(false);
            }
        }
    }, [userId, router]);

    const fetchAreasComuns = useCallback(async () => {
        if (!condominioID) return; // Só busca se tiver o ID do condomínio

        setLoading(true);
        setError(null); // Limpa erros anteriores
        try {
            // Este é o endpoint que o backend precisará implementar!
            const response = await fetch(`http://localhost:5000/api/condominios/${condominioID}/areas-comuns`); 
            
            if (response.ok) {
                const data = await response.json();
                setAreasComuns(data.areas || []); // Assumindo que o backend retorna um objeto com 'areas'
            } else {
                const errorData = await response.json();
                console.error('Erro ao buscar áreas comuns:', errorData.message || response.statusText);
                setError(`Erro ao carregar áreas comuns: ${errorData.message || 'Erro desconhecido.'}`);
                setAreasComuns([]);
            }
        } catch (err) {
            console.error('Erro ao conectar com a API de áreas comuns:', err);
            setError('Não foi possível conectar com o servidor para buscar as áreas comuns.');
            setAreasComuns([]);
        } finally {
            setLoading(false);
        }
    }, [condominioID]);

    useEffect(() => {
        if (condominioID) {
            fetchAreasComuns();
        }
    }, [condominioID, fetchAreasComuns]);

    return (
        <>
            <Head>
                <title>Áreas Comuns - Condomínio</title>
            </Head>

            <div className="container mt-5">
                <h1 className="mb-4">Áreas Comuns do Condomínio {condominioID && `(${condominioID})`}</h1> {/* Exibe o ID */}

                {/* Botão de Voltar para o Condomínio */}
                <button
                    type="button"
                    className="btn btn-secondary mb-4 me-2"
                    onClick={() => router.push(`/condo?id=${condominioID}`)} // Volta para a página do condomínio específico
                >
                    Voltar para o Condomínio
                </button>

                {/* Botão de Logout - Opcional, pode ser removido se o logout for global */}
                <LogoutButton />

                {loading && <p className="text-info mt-4">Carregando áreas comuns...</p>}
                {error && <p className="text-danger mt-4">{error}</p>}

                {!loading && !error && areasComuns.length === 0 && (
                    <p className="text-info mt-4">Nenhuma área comum encontrada para este condomínio.</p>
                )}

                {!loading && !error && areasComuns.length > 0 && (
                    <div className="row mt-4">
                        {areasComuns.map(area => (
                            <div key={area.id} className="col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">{area.nome}</h5>
                                        <p className="card-text">
                                            <strong>Status:</strong> {' '}
                                            {area.disponibilidade ? 
                                                <span className="badge bg-success">Disponível</span> : 
                                                <span className="badge bg-warning text-dark">Indisponível (Manutenção)</span>
                                            }
                                        </p>
                                        {/* Futuramente, aqui virá um botão para reservar */}
                                        <button className="btn btn-primary btn-sm mt-2" disabled={!area.disponibilidade}>
                                            {area.disponibilidade ? 'Reservar' : 'Indisponível'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}