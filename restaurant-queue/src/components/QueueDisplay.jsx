import { useQueue } from '../context/QueueContext';
import './QueueDisplay.css';

const QueueDisplay = ({ onBackToMenu, latestQueueNumber }) => {
    const {
        queueList,
        updateQueueStatus,
        addSimulationQueues,
        clearAllData
    } = useQueue();

    const preparingOrders = queueList.filter(order => order.status === 'preparing');
    const waitingOrders = queueList.filter(order => order.status === 'waiting');

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getOrderTotal = (items) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getPaymentMethodName = (methodId) => {
        const methods = {
            cash: 'Tunai',
            debit: 'Kartu Debit',
            credit: 'Kartu Kredit',
            ewallet: 'E-Wallet',
            qris: 'QRIS',
        };
        return methods[methodId] || methodId;
    };

    const handleStatusChange = (queueNumber, currentStatus) => {
        if (currentStatus === 'waiting') {
            updateQueueStatus(queueNumber, 'preparing');
        } else if (currentStatus === 'preparing') {
            updateQueueStatus(queueNumber, 'completed');
            // Auto-remove after animation
            setTimeout(() => {
                updateQueueStatus(queueNumber, 'removed');
            }, 1000);
        }
    };

    const handleClearAll = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus SEMUA antrian dan history?')) {
            clearAllData();
        }
    };

    return (
        <div className="queue-display">
            <header className="queue-header">
                <div className="container">
                    <div className="header-content">
                        <div>
                            <h1>Status Antrian</h1>
                            <p className="text-secondary">Pantau pesanan Anda secara real-time</p>
                        </div>
                        <div className="header-actions">
                            <button
                                className="btn btn-danger"
                                onClick={handleClearAll}
                                title="Hapus semua antrian dan history"
                            >
                                🗑️ Hapus Semua
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={onBackToMenu}
                            >
                                ← Kembali ke Menu
                            </button>
                        </div>
                    </div>

                    {/* Simulation Controls */}
                    <div className="simulation-controls">
                        <div className="simulation-info">
                            <span className="simulation-icon">🤖</span>
                            <div>
                                <h3>Simulasi Antrian</h3>
                                <p>Tambahkan 3 antrian baru secara otomatis</p>
                            </div>
                        </div>
                        <div className="simulation-actions">
                            <button
                                className="btn btn-primary simulation-btn"
                                onClick={addSimulationQueues}
                            >
                                ➕ Tambah 3 Antrian
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container">
                {/* Latest Order Notification */}
                {latestQueueNumber && (
                    <div className="latest-order-banner fade-in">
                        <div className="banner-content">
                            <span className="banner-icon">🎉</span>
                            <div>
                                <h3>Pesanan Berhasil!</h3>
                                <p>Nomor antrian Anda: <strong>#{latestQueueNumber}</strong></p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Now Preparing Section */}
                <section className="queue-section">
                    <div className="section-header">
                        <h2>🔥 Sedang Diproses</h2>
                        <span className="badge badge-warning">{preparingOrders.length} Pesanan</span>
                    </div>

                    {preparingOrders.length === 0 ? (
                        <div className="empty-state card">
                            <p className="text-muted">Belum ada pesanan yang sedang diproses</p>
                        </div>
                    ) : (
                        <div className="queue-grid">
                            {preparingOrders.map((order) => (
                                <div key={order.queueNumber} className="queue-card card preparing slide-in-right">
                                    <div className="queue-card-header">
                                        <div className="queue-number">
                                            <span className="queue-label">Antrian</span>
                                            <span className="queue-num">#{order.queueNumber}</span>
                                        </div>
                                        <span className="badge badge-warning">
                                            <span className="pulse-dot"></span>
                                            Diproses
                                        </span>
                                    </div>

                                    {/* User Info */}
                                    <div className="user-info">
                                        <div className="user-detail">
                                            <span className="user-icon">👤</span>
                                            <span className="user-name">{order.userName}</span>
                                        </div>
                                        <div className="payment-detail">
                                            <span className="payment-icon">💳</span>
                                            <span className="payment-method">{getPaymentMethodName(order.paymentMethod)}</span>
                                        </div>
                                    </div>

                                    <div className="queue-items">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="queue-item">
                                                <div className="item-info">
                                                    <span className="item-name">{item.name}</span>
                                                    <span className="item-qty">x{item.quantity}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="queue-card-footer">
                                        <div className="order-total">
                                            <span className="text-muted">Total:</span>
                                            <span className="total-amount">{formatPrice(getOrderTotal(order.items))}</span>
                                        </div>
                                        <div className="auto-progress-info">
                                            ⏱️ Otomatis diproses sistem
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Waiting Queue Section */}
                <section className="queue-section">
                    <div className="section-header">
                        <h2>⏳ Menunggu</h2>
                        <span className="badge badge-primary">{waitingOrders.length} Pesanan</span>
                    </div>

                    {waitingOrders.length === 0 ? (
                        <div className="empty-state card">
                            <p className="text-muted">Tidak ada pesanan dalam antrian</p>
                        </div>
                    ) : (
                        <div className="queue-grid">
                            {waitingOrders.map((order, index) => (
                                <div key={order.queueNumber} className="queue-card card waiting fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="queue-card-header">
                                        <div className="queue-number">
                                            <span className="queue-label">Antrian</span>
                                            <span className="queue-num">#{order.queueNumber}</span>
                                        </div>
                                        <span className="badge badge-primary">Menunggu</span>
                                    </div>

                                    {/* User Info */}
                                    <div className="user-info">
                                        <div className="user-detail">
                                            <span className="user-icon">👤</span>
                                            <span className="user-name">{order.userName}</span>
                                        </div>
                                        <div className="payment-detail">
                                            <span className="payment-icon">💳</span>
                                            <span className="payment-method">{getPaymentMethodName(order.paymentMethod)}</span>
                                        </div>
                                    </div>

                                    <div className="queue-items">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="queue-item">
                                                <div className="item-info">
                                                    <span className="item-name">{item.name}</span>
                                                    <span className="item-qty">x{item.quantity}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="queue-card-footer">
                                        <div className="order-total">
                                            <span className="text-muted">Total:</span>
                                            <span className="total-amount">{formatPrice(getOrderTotal(order.items))}</span>
                                        </div>
                                        {order.priority && (
                                            <div className="priority-info">
                                                📊 Prioritas: <strong>{order.priority.toFixed(1)}</strong>
                                                {order.priority < 3 && ' 🚀'}
                                            </div>
                                        )}
                                        <div className="queue-position-info">
                                            Posisi #{index + 1} dalam antrian
                                        </div>
                                        <div className="auto-progress-info">
                                            ⏱️ Akan diproses otomatis berdasarkan prioritas
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default QueueDisplay;
