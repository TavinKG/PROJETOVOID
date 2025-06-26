// components/Navbar.js
import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import LogoutButton from './LogoutButton'; 
import Cookies from 'js-cookie'; // Para acessar tipoUsuario e userId no Navbar diretamente

export default function Navbar({ 
    showBackButton = false, 
    condominioId = null,
    // NOVAS PROPS: Para botões específicos da página do condomínio
    tipoUsuario = null, 
    notificacoesToggle = false, 
    setNotificacoesToggle = () => {}, 
    fetchCondominiosPendentes = () => {} 
}) {
    const router = useRouter();
    // Acessa tipoUsuario e userId se não foram passados (caso de uso onde Navbar é mais genérica)
    const currentTipoUsuario = tipoUsuario || Cookies.get('tipoUsuario');
    const currentUserId = Cookies.get('userId'); // Sempre necessário para LogoutButton e outros

    return (
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
                    {/* Botão Voltar (geral para qualquer página exceto Home) */}
                    {showBackButton && (
                        <button
                            type="button"
                            className="btn btn-secondary me-2" // Removido mb-2
                            onClick={() => {
                                if (condominioId) {
                                    router.push(`/condo?id=${condominioId}`);
                                } else {
                                    router.back(); 
                                }
                            }}
                            style={{background:'none', border:'none'}} // Estilo customizado do seu botão Voltar
                        >
                            Condomínio
                        </button>
                    )}

                    {/* Botões da Página do Condomínio (movidos para cá) */}

                    <button
                        type="button"
                        className="btn btn-info me-2" // Removido mb-2
                        onClick={() => router.push(`/areas-comuns?id=${condominioId}`)}
                        style={{background:'none', border:'none', color:'#fff'}}
                    >
                        Áreas Comuns
                    </button>

                    {currentTipoUsuario === 'Morador' && (
                        <button
                            type="button"
                            className="btn btn-info me-2" // Removido mb-2
                            onClick={() => router.push(`/minhas-reservas?condominioId=${condominioId}`)}
                            style={{background:'none', border:'none', color:'#fff'}}
                        >
                            Minhas Reservas
                        </button>
                    )}

                    {currentTipoUsuario === 'Administrador' && (
                        <button
                            type="button"
                            className="btn btn-info me-2" // Removido mb-2
                            onClick={() => router.push(`/gerenciar-reservas?id=${condominioId}`)}
                            style={{background:'none', border:'none', color:'#fff'}}
                        >
                            Gerenciar Reservas
                        </button>
                    )}

                    <button
                        type="button"
                        className="btn btn-info me-2" // Removido mb-2
                        onClick={() => router.push(`/assembleias?id=${condominioId}`)}
                        style={{background:'none', border:'none', color:'#fff'}}
                    >
                        Assembleias
                    </button>
                    
                    <button
                        type="button"
                        className="btn btn-info me-2" // Removido mb-2
                        onClick={() => router.push(`/galeria?id=${condominioId}`)}
                        style={{background:'none', border:'none', color:'#fff'}}
                    >
                        Galeria de Fotos
                    </button>

                    <button
                        type="button"
                        className="btn btn-info me-2" // Removido mb-2
                        onClick={() => router.push(`/eventos?id=${condominioId}`)}
                        style={{background:'none', border:'none', color:'#fff'}}
                    >
                        Eventos
                    </button>

                    <button
                        type="button"
                        className="btn btn-info me-2" // Removido mb-2
                        onClick={() => router.push(`/avisos?id=${condominioId}`)}
                        style={{background:'none', border:'none', color:'#fff'}}
                    >
                        Avisos
                    </button>

                    {currentTipoUsuario === 'Administrador' && (
                        <button
                            type="button"
                            className="btn btn-primary me-5" // Removido mb-2
                            onClick={() => {
                                setNotificacoesToggle(!notificacoesToggle);
                                if (!notificacoesToggle) {
                                    fetchCondominiosPendentes();
                                }
                            }}
                            style={{background:'none', border:'none', color:'#fff'}}
                        >
                            Gerenciar Ingressos ({/* {condominiosPendentes.length} */} 0) {/* Temporário: count deve ser passado */}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}