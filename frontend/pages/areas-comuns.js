// pages/areas-comuns.js
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';

// Importe seu módulo CSS
import styles from '../styles/areas-comuns.module.css'; // AJUSTE O CAMINHO CONFORME SEU PROJETO

export default function AreasComuns() {
    const router = useRouter();
    const userId = Cookies.get('userId'); 
    const [condominioID, setCondominioId] = useState(null);
    const [areasComuns, setAreasComuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) { 
            router.push('/login');
        } else {
            const { id } = router.query;
            if (id) {
                setCondominioId(id);
            } else {
                console.error("ID do condomínio não encontrado na URL.");
                setError("ID do condomínio não encontrado.");
                setLoading(false);
            }
        }
    }, [userId, router]);

    const fetchAreasComuns = useCallback(async () => {
        if (!condominioID) return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/condominios/${condominioID}/areas-comuns`); 
            
            if (response.ok) {
                const data = await response.json();
                setAreasComuns(data.areas || []);
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
                <title>{`Áreas Comuns ${condominioID ? `- Condomínio ${condominioID}` : ''}`}</title> {/* CORREÇÃO AQUI */}
            </Head>
            {/* O estilo global para o body agora é no styles/areas-comuns.module.css */}

            <div className={`container mt-5 ${styles.container}`}> {/* Usa a classe container do CSS Module */}
                <h1 className={`${styles.mainTitle}`}> {/* Usa a classe customizada para o título principal */}
                    Áreas Comuns do Condomínio {condominioID && `(ID: ${condominioID})`}
                </h1>

                {/* Botões de Ação no Topo */}
                <div className={`${styles.actionButtonsContainer}`}> {/* Usa a classe customizada para o container de botões */}
                    <div>
                        <button
                            type="button"
                            className={`${styles.btnCustomSecondary} me-2`} /* Aplica classe customizada e margem Bootstrap */
                            onClick={() => router.push(`/condo?id=${condominioID}`)}
                        >
                            Voltar para o Condomínio
                        </button>
                    </div>
                    <div>
                        {/* Certifique-se de que LogoutButton aceita um `className` prop, ou renderize-o diretamente para aplicar o estilo */}
                        <LogoutButton className={`${styles.btnCustomSecondary}`} />
                    </div>
                </div>

                {loading && <p className={`${styles.textInfoCustom} text-center mt-4`}>Carregando áreas comuns...</p>}
                {error && <p className={`${styles.textDangerCustom} text-center mt-4`}>{error}</p>}

                {!loading && !error && areasComuns.length === 0 && (
                    <p className={`${styles.textInfoCustom} text-center mt-4`}>Nenhuma área comum encontrada para este condomínio.</p>
                )}

                {!loading && !error && areasComuns.length > 0 && (
                    <div className="row g-4 mt-4">
                        {areasComuns.map(area => (
                            <div key={area.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <div className={`${styles.areaCardCustom} h-100`}> {/* Aplica a classe customizada ao card */}
                                    <div className={`${styles.cardBodyCustom}`}> {/* Aplica a classe customizada ao card-body */}
                                        <h5 className={`${styles.cardTitleCustom}`}>{area.nome}</h5> {/* Aplica a classe customizada ao título do card */}
                                        <p className={`${styles.cardTextCustom} flex-grow-1`}> {/* Aplica a classe customizada ao texto do card */}
                                            <strong>Status:</strong> {' '}
                                            {area.disponibilidade ? (
                                                <span className={`${styles.badgeCustom} ${styles.badgeSuccessCustom}`}>Disponível</span>
                                            ) : (
                                                <span className={`${styles.badgeCustom} ${styles.badgeWarningCustom}`}>Indisponível</span>
                                            )}
                                        </p>
                                        <div className="mt-auto">
                                            <button
                                                className={`${styles.btnCustomPrimary} w-100`}
                                                disabled={!area.disponibilidade}
                                            >
                                                {area.disponibilidade ? 'Reservar' : 'Indisponível'}
                                            </button>
                                        </div>
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