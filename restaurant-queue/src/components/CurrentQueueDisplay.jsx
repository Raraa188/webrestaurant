import { useQueue } from '../context/QueueContext';
import './CurrentQueueDisplay.css';

const CurrentQueueDisplay = () => {
    const { queueList } = useQueue();

    // Get current processing queue (preparing status)
    const currentQueue = queueList.find(order => order.status === 'preparing');

    // Get upcoming queues (waiting status) - show max 3
    const upcomingQueues = queueList
        .filter(order => order.status === 'waiting')
        .slice(0, 3);

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
        <div className="current-queue-display">
            <div className="container">
                {/* Current Processing */}
                <div className="current-section">
                    <h2 className="section-title">🔥 Sedang Diproses</h2>
                    {currentQueue ? (
                        <div className="current-queue-card">
                            <div className="queue-number-large">
                                <span className="label">Antrian</span>
                                <span className="number">#{currentQueue.queueNumber}</span>
                            </div>
                            <div className="queue-details">
                                <div className="detail-row">
                                    <span className="icon">👤</span>
                                    <span className="text">{currentQueue.userName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="icon">🍽️</span>
                                    <span className="text">{currentQueue.items.length} item</span>
                                </div>
                                <div className="detail-row">
                                    <span className="icon">💰</span>
                                    <span className="text">{formatPrice(getOrderTotal(currentQueue.items))}</span>
                                </div>
                            </div>
                            <div className="processing-indicator">
                                <div className="pulse-ring"></div>
                                <span>Sedang Diproses...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-current">
                            <p>Tidak ada antrian yang sedang diproses</p>
                        </div>
                    )}
                </div>

                {/* Upcoming Queues */}
                <div className="upcoming-section">
                    <h2 className="section-title">⏳ Antrian Berikutnya</h2>
                    {upcomingQueues.length > 0 ? (
                        <div className="upcoming-list">
                            {upcomingQueues.map((order, index) => (
                                <div key={order.queueNumber} className="upcoming-card">
                                    <div className="upcoming-position">#{index + 1}</div>
                                    <div className="upcoming-info">
                                        <div className="upcoming-number">Antrian #{order.queueNumber}</div>
                                        <div className="upcoming-name">{order.userName}</div>
                                        <div className="upcoming-items">{order.items.length} item</div>
                                    </div>
                                    <div className="upcoming-total">
                                        {formatPrice(getOrderTotal(order.items))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-upcoming">
                            <p>Tidak ada antrian berikutnya</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CurrentQueueDisplay;
