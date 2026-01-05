import { useBankQueue } from '../context/BankQueueContext';
import logo from '../assets/download.png';
import './CustomerMonitor.css';

const CustomerMonitor = () => {
    const { tellers, currentCalls } = useBankQueue();

    return (
        <div className="customer-monitor">
            <div className="monitor-header">
                <div className="header-logo">
                    <img src={logo} alt="BankUCA" className="logo-image" />
                    <h1>BankUCA</h1>
                </div>
                <p className="monitor-subtitle">Customer Queue System</p>
            </div>

            <div className="teller-display-grid">
                {tellers.map((teller) => {
                    // Find if this teller is calling someone
                    const call = currentCalls.find(c => c.tellerId === teller.id);
                    const isCalling = call !== undefined;
                    const isActive = teller.status === 'active';

                    return (
                        <div
                            key={teller.id}
                            className={`teller-display ${isCalling ? 'calling' : ''} ${!isActive ? 'inactive' : ''}`}
                        >
                            <div className="teller-header">
                                <div className="teller-title">{teller.name}</div>
                            </div>

                            <div className="teller-content">
                                {!isActive ? (
                                    // Teller is closed
                                    <>
                                        <div className="closed-status">TUTUP</div>
                                        <div className="closed-icon">🚫</div>
                                    </>
                                ) : isCalling ? (
                                    // Teller is calling a customer
                                    <>
                                        <div className="call-status">SEDANG MEMANGGIL</div>
                                        <div className="queue-display-large">
                                            <div className="queue-prefix-large">{call.prefix}</div>
                                            <div className="queue-number-large">{call.displayNumber}</div>
                                        </div>
                                        <div className="pulse-indicator"></div>
                                    </>
                                ) : (
                                    // Teller is waiting
                                    <>
                                        <div className="waiting-status">MENUNGGU</div>
                                        <div className="waiting-icon">⏳</div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CustomerMonitor;
