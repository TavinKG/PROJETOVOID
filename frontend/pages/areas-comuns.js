import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';
import Image from 'next/image';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


export default function AreasComuns() {
    const router = useRouter();
    const userId = Cookies.get('userId'); 
    const [condominioID, setCondominioId] = useState(null);
    const [condominioNome, setCondominioNome] = useState('');
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

    const fetchCondominioNome = useCallback(async () => {
        if (!condominioID) return;
        try {
            const response = await fetch(`http://localhost:5000/api/condominios/${condominioID}`);
            if (response.ok) {
                const data = await response.json();
                setCondominioNome(data.nome);
            } else {
                console.error('Erro ao buscar nome do condomínio:', response.statusText);
                setCondominioNome('Condomínio Desconhecido');
            }
        } catch (error) {
            console.error('Erro de rede ao buscar nome do condomínio:', error);
            setCondominioNome('Erro ao Carregar Nome');
        }
    }, [condominioID]);


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
            fetchCondominioNome();
        }
    }, [condominioID, fetchAreasComuns, fetchCondominioNome]);


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
                slots.push({ time: `${formattedHour}:00`, isAvailable: false });
            }
        }
        return slots;
    }, []);

    const fetchSlotsAvailability = useCallback(async (areaId, date) => {
        if (!areaId || !date) return [];

        const formattedDate = date.toISOString().split('T')[0]; 
        try {
            const response = await fetch(`http://localhost:5000/api/reservas/disponibilidade/${areaId}/${formattedDate}`);
            if (response.ok) {
                const data = await response.json();
                return data.slots || [];
            } else {
                console.error('Erro ao buscar disponibilidade de slots:', response.statusText);
                return [];
            }
        } catch (err) {
            console.error('Erro de rede ao buscar disponibilidade de slots:', err);
            return [];
        }
    }, []);


    const handleReservarClick = async (area) => {
        setSelectedArea(area);
        const today = new Date();
        setSelectedDate(today); 
        
        const fetchedSlots = await fetchSlotsAvailability(area.id, today);
        setAvailableSlots(fetchedSlots);

        setSelectedSlot(null);
        setShowReservaModal(true);
    };

    const onCalendarChange = async (date) => {
        setSelectedDate(date);
        
        const fetchedSlots = await fetchSlotsAvailability(selectedArea.id, date);
        setAvailableSlots(fetchedSlots);
        
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
            const [startHours, startMinutes] = selectedSlot.time.split(':').map(Number);
            
            // Cria um objeto Date para o início do slot (em UTC)
            const startDateObj = new Date(selectedDate);
            startDateObj.setUTCHours(startHours, startMinutes, 0, 0);

            // Cria um objeto Date para o FIM do slot (3 horas depois, em UTC)
            const endDateObj = new Date(selectedDate);
            endDateObj.setUTCHours(startHours + 3, startMinutes, 0, 0); 

            // Formata a hora de fim para exibição, também em UTC (HH:MM)
            const formattedEndTime = endDateObj.toLocaleTimeString('pt-BR', { // Esta é a formatação do FIM
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false, 
                timeZone: 'UTC' 
            });
            setReservationEndTime(formattedEndTime); // Define o estado com a hora de fim formatada
            
            setShowReservaModal(false); // Esconde o modal de seleção de data/hora
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
        dataInicioObj.setUTCHours(hours, minutes, 0, 0);

        const dataFimObj = new Date(selectedDate);
        dataFimObj.setUTCHours(hours + 3, minutes, 0, 0);

        const reservaData = {
            areaId: selectedArea.id,
            usuarioId: userId,
            condominioId: condominioID,
            dataInicio: dataInicioObj.toISOString(),
            dataFim: dataFimObj.toISOString(),
            titulo: reservationTitle,
            observacoes: reservationNotes,
            status: '0', 
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
                fetchAreasComuns();
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
                {}
                <title>{condominioNome ? `${condominioNome} - Áreas Comuns` : 'Áreas Comuns - Condomínio'}</title>
            </Head>

            <nav className="navbar navbar-expand-lg shadow-sm" style={{height:'10vh'}}> {}
                <div className="container-fluid">
                    {}
                    <a className="navbar-brand d-flex align-items-center" href="/home">
                        <Image 
                            src="/logos/horizontal-escuro-cheio.png"
                            alt="VOID Logo" 
                            width={170} 
                            height={170} 
                            priority={true} 
                            style={{marginLeft:'125px', objectFit: 'contain'}}
                        />
                    </a>
    
                    {}
                    <div className="d-flex align-items-center" style={{marginRight:'125px'}}>
                        <button
                        type="button"
                        className="btn btn-secondary me-3 rounded-pill"
                        onClick={() => router.push(`/condo?id=${condominioID}`)}
                    >
                        Voltar
                    </button>
                    <LogoutButton />
                    </div>
                </div>
            </nav>

            <div className="container mt-5">
                {}
                <h1 className="mb-4">
                    {condominioNome ? `Áreas Comuns do Condomínio ${condominioNome}` : 'Áreas Comuns do Condomínio'}
                    {}
                </h1>

                {loading && <p className="text-info mt-4">Carregando áreas comuns...</p>}
                {error && <p className="text-danger mt-4">{error}</p>}
                {!loading && !error && areasComuns.length === 0 && (
                    <p className="text-info mt-4">Nenhuma área comum encontrada para este condomínio.</p>
                )}

                {!loading && !error && areasComuns.length > 0 && (
                    <div className="row mt-4">
                        {areasComuns.map(area => (
                            <div key={area.id} className="col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 shadow-sm rounded-4" style={{backgroundColor: 'rgb(3 7 18)', color: '#fff', border: '2px solid #4fc1e9'}}>
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
                                            className="btn btn-info btn-sm mt-2 rounded-pill" 
                                            disabled={!area.disponibilidade}
                                            onClick={() => handleReservarClick(area)}
                                            style={{fontWeight: 'bold'}}
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

            {}
            {showReservaModal && selectedArea && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content" style={{ backgroundColor: '#fff', color: 'rgb(3 7 18)', fontWeight: 'bold' }}>
                            <div className="modal-header">
                                <h5 className="modal-title">Reservar {selectedArea.nome}</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={closeReservaModal}></button>
                            </div>
                            <div className="modal-body">
                                {}
                                <div className="d-flex justify-content-center mb-3">
                                    <Calendar
                                        onChange={onCalendarChange}
                                        value={selectedDate}
                                        minDate={new Date()}
                                        minDetail="month"
                                        maxDetail="month"
                                        tileDisabled={tileDisabled}
                                        locale="pt-BR"
                                    />
                                </div>

                                <style jsx global>{`
                                    .react-calendar__navigation button:disabled {
                                       background-color:rgb(3 7 18);
                                        color:#fff;
                                    }
                                    .react-calendar__navigation button {
                                        min-width: 44px;
                                        background: rgb(3 7 18);
                                    }
                                    .react-calendar__month-view__days__day--weekend {
                                        color: rgb(3 7 18);
                                    }
                                    .react-calendar__tile--active {
                                        background: #4fc1e9;
                                        color: white;
                                    }
                                    .react-calendar__tile--active {
                                        background: #4fc1e9;
                                        color: white;
                                    }
                                `}</style>

                                {}
                                <h6 className="text-center mb-3">
                                    Horários disponíveis para {' '}
                                    {selectedDate.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                                </h6>
                                <div className="d-flex flex-wrap justify-content-center gap-2">
                                    {availableSlots.length > 0 ? (
                                        availableSlots.map((slot, index) => (
                                            <button
                                                key={index}
                                                className={`btn ${selectedSlot && selectedSlot.time === slot.time ? 'btn-info' : (slot.isAvailable ? 'btn-outline-info' : 'btn-secondary')} rounded-pill`}
                                                disabled={!slot.isAvailable}
                                                onClick={() => setSelectedSlot(slot)}
                                                style={{color: 'rgb(3 7 18)'}}
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
                                <button 
                                    type="button" 
                                    className="btn btn-info rounded-pill" 
                                    disabled={!selectedSlot || !selectedSlot.isAvailable}
                                    onClick={handleConfirmarReservaClick}
                                    style={{fontWeight: 'bold'}}
                                >
                                    Confirmar Reserva
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {}
            {showConfirmacaoModal && selectedArea && selectedDate && selectedSlot && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content" style={{ backgroundColor: '#fff', color: 'rgb(3 7 18)'}}>
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
                                        <button type="submit" className="btn btn-info rounded-pill">
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