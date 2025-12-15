import { useQueue } from '../context/QueueContext';
import './DisplayMonitor.css';

const DisplayMonitor = () => {
    const { queueList } = useQueue();

    // Get completed orders (ready to pick up)
    const completedOrders = queueList.filter(order => order.status === 'completed');

    // Get preparing orders (currently being processed)
    const preparingOrders = queueList.filter(order => order.status === 'preparing');

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

    return (
        <div className="display-monitor">
            <div className="monitor-header">
                <h1>Restoran Kita</h1>
                <p className="subtitle">Monitor Antrian</p>
            </div>

            <div className="monitor-content">
                {/* Ready to Pick Up (Completed) */}
                <div className="monitor-section ready-section">
                    <div className="section-title">
                        <span className="icon">✅</span>
                        <h2>Pesanan Siap</h2>
                    </div>

                    <div className="display-cards">
                        {completedOrders.length > 0 ? (
                            completedOrders.map((order) => (
                                <div key={order.queueNumber} className={`display-card ready-card ${order.called ? 'calling' : ''}`}>
                                    <div className="card-header">
                                        <div className="queue-number-display">
                                            <span className="number">{order.queueNumber}</span>
                                        </div>
                                        <div className="status-badge ready">
                                            {order.called ? '📢 Dipanggil' : 'Siap Diambil'}
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="customer-name">{order.userName}</div>
                                        <div className="order-info">
                                            <span>{order.items.length} item</span>
                                            <span className="separator">•</span>
                                            <span>{formatPrice(getOrderTotal(order.items))}</span>
                                        </div>
                                        {order.skipCount > 0 && (
                                            <div className="skip-indicator">
                                                ⚠️ Dilewati {order.skipCount}x
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-display">
                                <p>Tidak ada pesanan yang siap diambil</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Currently Processing */}
                <div className="monitor-section processing-section">
                    <div className="section-title">
                        <span className="icon">🔥</span>
                        <h2>Sedang Diproses</h2>
                    </div>

                    <div className="display-cards">
                        {preparingOrders.length > 0 ? (
                            preparingOrders.map((order) => (
                                <div key={order.queueNumber} className="display-card processing-card">
                                    <div className="card-header">
                                        <div className="queue-number-display">
                                            <span className="number">{order.queueNumber}</span>
                                        </div>
                                        <div className="status-badge processing">
                                            <span className="pulse-dot"></span>
                                            Diproses
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="customer-name">{order.userName}</div>
                                        <div className="order-info">
                                            <span>{order.items.length} item</span>
                                            <span className="separator">•</span>
                                            <span>{formatPrice(getOrderTotal(order.items))}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-display">
                                <p>Tidak ada pesanan yang sedang diproses</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="monitor-footer">
                <div className="stats">
                    <div className="stat-item">
                        <span className="stat-label">Pesanan Siap:</span>
                        <span className="stat-value">{completedOrders.length}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Sedang Diproses:</span>
                        <span className="stat-value">{preparingOrders.length}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Total Antrian:</span>
                        <span className="stat-value">{queueList.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisplayMonitor;
