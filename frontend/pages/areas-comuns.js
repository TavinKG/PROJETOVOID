// pages/areas-comuns.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


export default function AreasComuns() {
    const router = useRouter();
    const userId = Cookies.get('userId'); 
    const [condominioID, setCondominioId] = useState(null);
    const [areasComuns, setAreasComuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showReservaModal, setShowReservaModal] = useState(false);
    const [selectedArea, setSelectedArea] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const [showConfirmacaoModal, setShowConfirmacaoModal] = useState(false);
    const [reservationTitle, setReservationTitle] = useState('');
    const [reservationNotes, setReservationNotes] = useState('');
    const [reservationEndTime, setReservationEndTime] = useState('');

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

    // LÓGICA PARA GERAÇÃO DE SLOTS DE HORÁRIO (AGORA SÓ GERA POTENCIAIS SLOTS)
    const getPotentialSlots = useCallback((date) => {
        const slots = [];
        const startHour = 10;
        const endHour = 22; 
        const interval = 3;

        const dayOfWeek = date.getDay();
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const selectedDay = new Date(date);
        selectedDay.setHours(0, 0, 0, 0);

        if (selectedDay < today || !isWeekend) {
            return [];
        }
        
        let currentStartHour = startHour;
        if (selectedDay.getTime() === today.getTime()) {
            const now = new Date();
            const currentHour = now.getHours();
            
            currentStartHour = startHour; 
            while (currentStartHour < currentHour && currentStartHour < endHour) { 
                currentStartHour += interval;
            }
            if (currentStartHour >= endHour) return []; 
        }

        for (let hour = currentStartHour; hour < endHour; hour += interval) { 
            if (hour >= startHour) {
                const formattedHour = String(hour).padStart(2, '0');
                slots.push({ time: `${formattedHour}:00`, isAvailable: true }); // isAvailable será atualizado pelo backend
            }
        }
        return slots;
    }, []);

    // NOVO: Função para buscar a disponibilidade real dos slots do backend
    const fetchSlotsAvailability = useCallback(async (areaId, date) => {
        if (!areaId || !date) return [];

        const formattedDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        try {
            const response = await fetch(`http://localhost:5000/api/reservas/disponibilidade/${areaId}/${formattedDate}`);
            if (response.ok) {
                const data = await response.json();
                return data.slots || []; // Retorna os slots com status de disponibilidade do backend
            } else {
                console.error('Erro ao buscar disponibilidade de slots:', response.statusText);
                return [];
            }
        } catch (err) {
            console.error('Erro de rede ao buscar disponibilidade de slots:', err);
            return [];
        }
    }, []);


    // Função para abrir o modal de reserva
    const handleReservarClick = async (area) => { // AGORA É ASYNC
        setSelectedArea(area);
        const today = new Date();
        setSelectedDate(today); 
        
        // NOVO: Busca a disponibilidade real ao abrir o modal
        const initialSlots = await fetchSlotsAvailability(area.id, today);
        setAvailableSlots(initialSlots);

        setSelectedSlot(null);
        setShowReservaModal(true);
    };

    // Função para mudar o dia no calendário
    const onCalendarChange = async (date) => { // AGORA É ASYNC
        setSelectedDate(date);
        
        // NOVO: Busca a disponibilidade real ao mudar o dia no calendário
        const updatedSlots = await fetchSlotsAvailability(selectedArea.id, date);
        setAvailableSlots(updatedSlots);
        
        setSelectedSlot(null);
    };

    const closeReservaModal = () => {
        setShowReservaModal(false);
        setSelectedArea(null);
        setSelectedDate(new Date()); 
        setAvailableSlots([]);
        setSelectedSlot(null);
    };

    const handleConfirmarReservaClick = () => {
        if (selectedSlot && selectedDate) {
            const [hours, minutes] = selectedSlot.time.split(':').map(Number);
            const endDate = new Date(selectedDate);
            endDate.setHours(hours + 3, minutes, 0, 0); 

            setReservationEndTime(endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
            
            setShowReservaModal(false);
            setShowConfirmacaoModal(true);
        }
    };

    const closeConfirmacaoModal = () => {
        setShowConfirmacaoModal(false);
        setReservationTitle('');
        setReservationNotes('');
        setReservationEndTime('');
    };

    const handleSubmitReserva = async (e) => {
        e.preventDefault();

        if (!selectedArea || !selectedDate || !selectedSlot || !userId || !condominioID) {
            alert('Erro: Informações de reserva incompletas.');
            return;
        }

        const [hours, minutes] = selectedSlot.time.split(':').map(Number);
        const dataInicioObj = new Date(selectedDate);
        dataInicioObj.setHours(hours, minutes, 0, 0);

        const dataFimObj = new Date(selectedDate);
        dataFimObj.setHours(hours + 3, minutes, 0, 0);

        const reservaData = {
            areaId: selectedArea.id,
            usuarioId: userId,
            condominioId: condominioID,
            dataInicio: dataInicioObj.toISOString(),
            dataFim: dataFimObj.toISOString(),
            titulo: reservationTitle,
            observacoes: reservationNotes,
            status: '0', // Status inicial como pendente ('0')
        };

        try {
            const response = await fetch('http://localhost:5000/api/reservas/criar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservaData),
            });

            if (response.ok) {
                alert('Solicitação de reserva enviada com sucesso! Aguardando aprovação.');
                closeConfirmacaoModal();
                closeReservaModal();
                fetchAreasComuns(); // Recarrega as áreas para talvez mostrar alguma mudança de status
            } else {
                const errorData = await response.json();
                console.error('Erro ao enviar reserva:', errorData);
                alert(`Erro ao reservar área: ${errorData.message || 'Erro desconhecido.'}`);
            }
        } catch (error) {
            console.error('Erro de rede ou ao enviar reserva:', error);
            alert('Erro ao processar a reserva. Tente novamente.');
        }
    };

    const tileDisabled = ({ date, view }) => {
        if (view === 'month') {
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            const calendarDay = new Date(date);
            calendarDay.setHours(0, 0, 0, 0);

            if (calendarDay < today) {
                return true;
            }
            return date.getDay() === 1 || date.getDay() === 2 || date.getDay() === 3 || date.getDay() === 4 || date.getDay() === 5;
        }
        return false;
    };

    return (
        <>
            <Head>
                <title>Áreas Comuns - Condomínio</title>
            </Head>

            <div className="container mt-5">
                <h1 className="mb-4">Áreas Comuns do Condomínio {condominioID && `(${condominioID})`}</h1>

                <button
                    type="button"
                    className="btn btn-secondary mb-4 me-2"
                    onClick={() => router.push(`/condo?id=${condominioID}`)}
                >
                    Voltar para o Condomínio
                </button>
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
                                        <button 
                                            className="btn btn-primary btn-sm mt-2" 
                                            disabled={!area.disponibilidade}
                                            onClick={() => handleReservarClick(area)}
                                        >
                                            {area.disponibilidade ? 'Reservar' : 'Indisponível'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL DE RESERVA DE ÁREA COMUM (Seleção de Data/Hora) */}
            {showReservaModal && selectedArea && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Reservar {selectedArea.nome}</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={closeReservaModal}></button>
                            </div>
                            <div className="modal-body">
                                {/* CALENDÁRIO */}
                                <div className="d-flex justify-content-center mb-3">
                                    <Calendar
                                        onChange={onCalendarChange}
                                        value={selectedDate}
                                        minDate={new Date()} // Desabilita datas passadas
                                        minDetail="month" // Não permite ir para visualização de ano/década
                                        maxDetail="month" // Não permite ir para visualização de ano/década
                                        tileDisabled={tileDisabled} // Desabilita dias de semana
                                        locale="pt-BR" // Define o idioma para Português
                                    />
                                </div>

                                {/* HORÁRIOS DISPONÍVEIS/INDISPONÍVEIS */}
                                <h6 className="text-center mb-3">
                                    Horários disponíveis para {' '}
                                    {selectedDate.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                                </h6>
                                <div className="d-flex flex-wrap justify-content-center gap-2">
                                    {availableSlots.length > 0 ? (
                                        availableSlots.map((slot, index) => (
                                            <button
                                                key={index}
                                                className={`btn ${selectedSlot && selectedSlot.time === slot.time ? 'btn-primary' : (slot.isAvailable ? 'btn-outline-primary' : 'btn-secondary')}`}
                                                disabled={!slot.isAvailable}
                                                onClick={() => setSelectedSlot(slot)}
                                            >
                                                {slot.time}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-muted">Não há horários disponíveis para este dia. Selecione um Sábado ou Domingo futuro.</p>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeReservaModal}>
                                    Fechar
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-success" 
                                    disabled={!selectedSlot}
                                    onClick={handleConfirmarReservaClick}
                                >
                                    Confirmar Reserva
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO DE RESERVA (Formulário) */}
            {showConfirmacaoModal && selectedArea && selectedDate && selectedSlot && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirmar Reserva de {selectedArea.nome}</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={closeConfirmacaoModal}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmitReserva}>
                                    <div className="mb-3">
                                        <label htmlFor="reservationTitle" className="form-label">Título da Reserva (opcional)</label>
                                        <input
                                            type="text"
                                            id="reservationTitle"
                                            className="form-control"
                                            value={reservationTitle}
                                            onChange={(e) => setReservationTitle(e.target.value)}
                                            placeholder="Ex: Aniversário, Reunião, etc."
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Data e Hora da Reserva</label>
                                        <p>
                                            <strong>Início:</strong> {selectedDate.toLocaleDateString('pt-BR')} às {selectedSlot.time}
                                        </p>
                                        <p>
                                            <strong>Fim:</strong> {selectedDate.toLocaleDateString('pt-BR')} às {reservationEndTime}
                                        </p>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="reservationNotes" className="form-label">Observações (opcional)</label>
                                        <textarea
                                            id="reservationNotes"
                                            className="form-control"
                                            rows="3"
                                            value={reservationNotes}
                                            onChange={(e) => setReservationNotes(e.target.value)}
                                            placeholder="Detalhes adicionais da reserva..."
                                        ></textarea>
                                    </div>
                                    <div className="d-flex justify-content-end mt-4">
                                        <button type="button" className="btn btn-secondary me-2" onClick={closeConfirmacaoModal}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn btn-success">
                                            Finalizar Reserva
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}