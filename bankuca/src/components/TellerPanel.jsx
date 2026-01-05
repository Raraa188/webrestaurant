import { useState } from 'react';
import { useBankQueue } from '../context/BankQueueContext';
import './TellerPanel.css';

const TellerPanel = () => {
    const [selectedTellerId, setSelectedTellerId] = useState(1);
    const { tellers, callNext, completeService, getWaitingByType } = useBankQueue();

    const selectedTeller = tellers.find(t => t.id === selectedTellerId);
    const waitingCount = selectedTeller ? getWaitingByType(selectedTeller.type) : 0;

    const handleCallNext = () => {
        if (selectedTellerId) {
            callNext(selectedTellerId);
        }
    };

    const handleComplete = () => {
        if (selectedTellerId) {
            completeService(selectedTellerId);
        }
    };

    const callButtonText = waitingCount > 0
        ? `Panggil Nasabah Berikutnya (${waitingCount} menunggu)`
        : 'Panggil Nasabah Berikutnya';

    return (
        <div className="teller-panel">
            <div className="panel-container">
                <div className="panel-header">
                    <h1>Panel Teller</h1>
                    <p>Manajemen Antrian Nasabah</p>
                </div>

                <div className="teller-selector">
                    <label htmlFor="teller-select">Pilih Teller:</label>
                    <select
                        id="teller-select"
                        value={selectedTellerId}
                        onChange={(e) => setSelectedTellerId(Number(e.target.value))}
                    >
                        {tellers.map((teller) => (
                            <option key={teller.id} value={teller.id}>
                                {teller.name} - {teller.type}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="teller-info">
                    <div className="info-item">
                        <span className="info-label">Nama:</span>
                        <span className="info-value">{selectedTeller?.name || '-'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Tipe:</span>
                        <span className="info-value">{selectedTeller?.type || '-'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Status:</span>
                        <span className={`status-badge ${selectedTeller?.status || 'closed'}`}>
                            {selectedTeller?.status === 'active' ? 'Aktif' :
                                selectedTeller?.status === 'break' ? 'Istirahat' : 'Tutup'}
                        </span>
                    </div>
                </div>

                <div className="current-queue">
                    {selectedTeller?.currentQueue ? (
                        <>
                            <div className="queue-label">Nasabah Saat Ini</div>
                            <div className="queue-number-display">
                                <span className="current-prefix">
                                    {selectedTeller.currentQueue.prefix}
                                </span>
                                <span className="current-number">
                                    {selectedTeller.currentQueue.displayNumber}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="no-current">
                            <div className="empty-icon">📭</div>
                            <div className="empty-text">Tidak ada nasabah</div>
                        </div>
                    )}
                </div>

                <div className="action-buttons">
                    <button
                        className="btn-call"
                        onClick={handleCallNext}
                        disabled={waitingCount === 0 || selectedTeller?.currentQueue !== null}
                    >
                        {callButtonText}
                    </button>

                    <button
                        className="btn-complete"
                        onClick={handleComplete}
                        disabled={!selectedTeller?.currentQueue}
                    >
                        Selesai Layanan
                    </button>
                </div>

                <div className="waiting-info">
                    <h3>Antrian Menunggu ({waitingCount})</h3>
                    <div className="waiting-count-display">
                        <div className="count-number">{waitingCount}</div>
                        <div className="count-label">Nasabah</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TellerPanel;
