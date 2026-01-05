import { useState } from 'react';
import { useBankQueue } from '../context/BankQueueContext';
import './TicketKiosk.css';

const TicketKiosk = () => {
    const [customerName, setCustomerName] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [showTicket, setShowTicket] = useState(false);
    const [ticketData, setTicketData] = useState(null);
    const { takeTicket, serviceCategories } = useBankQueue();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!customerName.trim() || !selectedService) {
            alert('Mohon isi nama lengkap dan pilih layanan');
            return;
        }

        const ticket = takeTicket(selectedService);
        if (ticket) {
            setTicketData({ ...ticket, customerName });
            setShowTicket(true);

            // Reset form
            setCustomerName('');
            setSelectedService('');

            // Auto hide after 8 seconds
            setTimeout(() => {
                setShowTicket(false);
                setTicketData(null);
            }, 8000);
        }
    };

    return (
        <div className="ticket-kiosk">
            <div className="kiosk-container">
                <div className="kiosk-header">
                    <h1>Daftar Antrian</h1>
                    <p className="kiosk-subtitle">Pilih layanan dan isi data diri Anda untuk mendapatkan nomor antrian.</p>
                </div>

                <form className="kiosk-form" onSubmit={handleSubmit}>
                    {/* Nama Lengkap */}
                    <div className="form-group">
                        <label htmlFor="customer-name">Nama Lengkap</label>
                        <input
                            type="text"
                            id="customer-name"
                            placeholder="Masukkan nama lengkap Anda"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Pilih Layanan */}
                    <div className="form-group">
                        <label>Pilih Layanan</label>
                        <div className="service-options">
                            {Object.entries(serviceCategories).map(([key, category]) => (
                                <label key={key} className={`service-option ${selectedService === key ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="service"
                                        value={key}
                                        checked={selectedService === key}
                                        onChange={(e) => setSelectedService(e.target.value)}
                                    />
                                    <div className="option-content">
                                        <div className="option-header">
                                            <span className="option-title">{category.name}</span>
                                        </div>
                                        <p className="option-description">
                                            {category.services.slice(0, 2).join(', ')}
                                            {category.services.length > 2 && '...'}
                                        </p>
                                    </div>
                                    <div className="radio-indicator"></div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="submit-btn">
                        Ambil Nomor Antrian
                    </button>
                </form>
            </div>

            {showTicket && ticketData && (
                <div className="ticket-modal" onClick={() => setShowTicket(false)}>
                    <div className="ticket-paper" onClick={(e) => e.stopPropagation()}>
                        <div className="ticket-header">
                            <h2>🏦 BankUCA</h2>
                            <p className="ticket-date">
                                {new Date().toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            <p className="ticket-time">
                                {new Date().toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>

                        <div className="ticket-number">
                            <div className="queue-prefix">{ticketData.prefix}</div>
                            <div className="queue-num">{ticketData.displayNumber}</div>
                        </div>

                        <div className="ticket-info">
                            <div className="info-row">
                                <span className="info-label">Nama:</span>
                                <span className="info-value">{ticketData.customerName}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Layanan:</span>
                                <span className="info-value">{ticketData.serviceName}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Antrian di depan:</span>
                                <span className="info-value">{ticketData.waitingCount} orang</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Estimasi waktu:</span>
                                <span className="info-value">~{ticketData.estimatedTime} menit</span>
                            </div>
                        </div>

                        <div className="ticket-footer">
                            <p>Terima kasih atas kunjungan Anda</p>
                            <p className="ticket-note">Harap simpan nomor antrian ini</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketKiosk;
