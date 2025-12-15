import { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import './OrderHistory.css';

const OrderHistory = () => {
    const { orderHistory, clearAllData } = useQueue();
    const [searchTerm, setSearchTerm] = useState('');

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
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

    // Filter orders based on search term
    const filteredOrders = orderHistory.filter(order =>
        order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.queueNumber.toString().includes(searchTerm)
    );

    // Sort by completion date (newest first)
    const sortedOrders = [...filteredOrders].sort((a, b) =>
        new Date(b.completedAt || b.timestamp) - new Date(a.completedAt || a.timestamp)
    );

    const handleClearHistory = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus semua data? Ini akan menghapus antrian aktif dan riwayat pesanan.')) {
            clearAllData();
        }
    };

    return (
        <div className="order-history">
            <header className="history-header">
                <div className="container">
                    <div className="header-content">
                        <div>
                            <h1>Riwayat Pesanan</h1>
                            <p className="text-secondary">Semua pesanan yang telah selesai</p>
                        </div>
                        <button
                            className="btn btn-secondary"
                            onClick={handleClearHistory}
                        >
                            🗑️ Hapus Semua Data
                        </button>
                    </div>
                </div>
            </header>

            <div className="container">
                {/* Search Bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama atau nomor antrian..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>

                {/* Statistics */}
                <div className="stats-grid">
                    <div className="stat-card card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <span className="stat-label">Total Pesanan</span>
                            <span className="stat-value">{orderHistory.length}</span>
                        </div>
                    </div>
                    <div className="stat-card card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <span className="stat-label">Total Pendapatan</span>
                            <span className="stat-value">
                                {formatPrice(orderHistory.reduce((sum, order) => sum + getOrderTotal(order.items), 0))}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Order History List */}
                {sortedOrders.length === 0 ? (
                    <div className="empty-state card">
                        <p className="text-muted">
                            {searchTerm ? 'Tidak ada pesanan yang cocok dengan pencarian' : 'Belum ada riwayat pesanan'}
                        </p>
                    </div>
                ) : (
                    <div className="history-grid">
                        {sortedOrders.map((order) => (
                            <div key={`${order.queueNumber}-${order.timestamp}`} className="history-card card fade-in">
                                <div className="history-card-header">
                                    <div className="queue-badge">
                                        <span className="queue-label">Antrian</span>
                                        <span className="queue-num">#{order.queueNumber}</span>
                                    </div>
                                    <span className="badge badge-success">✓ Selesai</span>
                                </div>

                                {/* Customer Info */}
                                <div className="customer-info">
                                    <div className="info-row">
                                        <span className="info-icon">👤</span>
                                        <span className="info-text">{order.userName}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-icon">💳</span>
                                        <span className="info-text">{getPaymentMethodName(order.paymentMethod)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-icon">🕒</span>
                                        <span className="info-text">{formatDate(order.completedAt || order.timestamp)}</span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="order-items-summary">
                                    <h4>Pesanan:</h4>
                                    <div className="items-list">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="item-row">
                                                <span className="item-icon">🍽️</span>
                                                <span className="item-name">{item.name}</span>
                                                <span className="item-qty">x{item.quantity}</span>
                                                <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="history-card-footer">
                                    <span className="text-muted">Total:</span>
                                    <span className="total-amount">{formatPrice(getOrderTotal(order.items))}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
