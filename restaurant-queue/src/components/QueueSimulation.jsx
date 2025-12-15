import React, { useState, useEffect, useRef } from 'react';
import './QueueSimulation.css';

// Helper untuk generate random name
const generateName = () => {
    const names = ['Budi Santoso', 'Siti Nurhaliza', 'Andi Wijaya', 'Dewi Lestari', 'Rudi Hartono',
        'Maya Sari', 'Joko Widodo', 'Rina Susanti', 'Doni Pratama', 'Lisa Anggraeni',
        'Agus Setiawan', 'Nina Kartika', 'Hadi Gunawan', 'Tina Marlina', 'Eko Prasetyo'];
    return names[Math.floor(Math.random() * names.length)];
};

// Helper untuk generate random order
const generateOrder = (queueNum) => {
    const items = [
        { name: 'Nasi Goreng Spesial', icon: '🍳' },
        { name: 'Mie Goreng Seafood', icon: '🍜' },
        { name: 'Ayam Bakar Madu', icon: '🍗' },
        { name: 'Sate Ayam 10 tusuk', icon: '🍢' },
        { name: 'Bakso Komplit', icon: '🥘' },
        { name: 'Gado-Gado Jakarta', icon: '🥗' },
        { name: 'Soto Ayam Lamongan', icon: '🍲' },
        { name: 'Nasi Uduk', icon: '🍚' },
        { name: 'Ayam Geprek', icon: '🐔' }
    ];

    const numItems = Math.floor(Math.random() * 3) + 1;
    const orderItems = [];
    for (let i = 0; i < numItems; i++) {
        const item = items[Math.floor(Math.random() * items.length)];
        orderItems.push({ ...item, qty: Math.floor(Math.random() * 3) + 1 });
    }

    const total = orderItems.reduce((sum, item) => sum + (item.qty * 25000), 0);
    const paymentMethods = ['Tunai', 'Debit Card', 'Credit Card', 'QRIS', 'GoPay', 'OVO', 'Dana'];

    return {
        id: queueNum,
        queueNumber: queueNum,
        customerName: generateName(),
        items: orderItems,
        total: total,
        payment: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        status: 'waiting',
        timestamp: Date.now()
    };
};

const QueueSimulation = () => {
    const [currentQueue, setCurrentQueue] = useState(1);
    const [preparing, setPreparing] = useState(null);
    const [waitingQueue, setWaitingQueue] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [canceledOrders, setCanceledOrders] = useState([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationSpeed, setSimulationSpeed] = useState(2000);
    const [autoCancelChance, setAutoCancelChance] = useState(15); // 15% chance
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const simulationInterval = useRef(null);
    const utteranceRef = useRef(null);

    // Initialize queue
    useEffect(() => {
        const initial = [];
        for (let i = 0; i < 8; i++) {
            initial.push(generateOrder(currentQueue + i));
        }
        setWaitingQueue(initial);
    }, []);

    // Fungsi untuk mengumumkan nomor antrian dengan suara
    const announceQueue = (queueNumber) => {
        if (!voiceEnabled || !window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const text = `Antrian nomor ${queueNumber}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    // Auto process simulation
    useEffect(() => {
        if (isSimulating && currentQueue <= 100) {
            simulationInterval.current = setInterval(() => {
                processNextOrder();
            }, simulationSpeed);
        } else if (currentQueue > 100 && !preparing) {
            setIsSimulating(false);
        }

        return () => {
            if (simulationInterval.current) {
                clearInterval(simulationInterval.current);
            }
        };
    }, [isSimulating, waitingQueue, preparing, currentQueue, simulationSpeed]);

    // Cleanup voice on unmount
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const processNextOrder = () => {
        // Jika sedang ada yang preparing, cek apakah akan di-cancel otomatis atau complete
        if (preparing) {
            const shouldAutoCancel = Math.random() * 100 < autoCancelChance;

            if (shouldAutoCancel) {
                // Cancel otomatis oleh sistem
                const order = {
                    ...preparing,
                    status: 'canceled',
                    canceledAt: Date.now(),
                    cancelReason: 'Dibatalkan otomatis oleh sistem'
                };
                setCanceledOrders(prev => [order, ...prev]);
                setPreparing(null);
            } else {
                completeOrder(preparing);
            }
            return;
        }

        // Ambil order pertama dari waiting queue
        if (waitingQueue.length > 0) {
            const nextOrder = waitingQueue[0];
            setPreparing(nextOrder);
            setWaitingQueue(prev => prev.slice(1));

            // Announce queue number
            announceQueue(nextOrder.queueNumber);
            return;
        }

        // Jika tidak ada antrian tapi belum sampai 100, generate baru
        if (currentQueue <= 100) {
            const newOrder = generateOrder(currentQueue);
            setPreparing(newOrder);
            setCurrentQueue(prev => prev + 1);

            // Announce queue number
            announceQueue(newOrder.queueNumber);

            // Generate next orders untuk antrian
            const nextOrders = [];
            for (let i = 0; i < 5; i++) {
                if (currentQueue + i + 1 <= 100) {
                    nextOrders.push(generateOrder(currentQueue + i + 1));
                }
            }
            setWaitingQueue(nextOrders);
            setCurrentQueue(prev => prev + nextOrders.length);
        }
    };

    const completeOrder = (order) => {
        setCompletedOrders(prev => [order, ...prev]);
        setPreparing(null);
    };

    const cancelOrder = (orderId, fromPreparing = false, reason = 'Dibatalkan oleh customer') => {
        if (fromPreparing) {
            const order = { ...preparing, status: 'canceled', canceledAt: Date.now(), cancelReason: reason };
            setCanceledOrders(prev => [order, ...prev]);
            setPreparing(null);
        } else {
            const order = waitingQueue.find(o => o.id === orderId);
            if (order) {
                const canceledOrder = { ...order, status: 'canceled', canceledAt: Date.now(), cancelReason: reason };
                setCanceledOrders(prev => [canceledOrder, ...prev]);
                setWaitingQueue(prev => prev.filter(o => o.id !== orderId));
            }
        }
    };

    const startSimulation = () => {
        setIsSimulating(true);
    };

    const stopSimulation = () => {
        setIsSimulating(false);
        if (simulationInterval.current) {
            clearInterval(simulationInterval.current);
        }
        // Stop any ongoing speech
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };

    const resetSimulation = () => {
        stopSimulation();
        setCurrentQueue(1);
        setPreparing(null);
        setWaitingQueue([]);
        setCompletedOrders([]);
        setCanceledOrders([]);

        const initial = [];
        for (let i = 0; i < 8; i++) {
            initial.push(generateOrder(1 + i));
        }
        setWaitingQueue(initial);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const progress = Math.min(((currentQueue - 1) / 99) * 100, 100);

    // Calculate auto vs manual cancels
    const autoCancels = canceledOrders.filter(o => o.cancelReason === 'Dibatalkan otomatis oleh sistem').length;
    const manualCancels = canceledOrders.filter(o => o.cancelReason !== 'Dibatalkan otomatis oleh sistem').length;

    return (
        <div className="queue-simulation">
            <header className="queue-header">
                <div className="container">
                    <div className="header-content">
                        <div>
                            <h1>🎮 Simulasi Antrian Restaurant</h1>
                            <p className="text-secondary">
                                Simulasi otomatis antrian 1-100 dengan fitur auto-cancel dan voice announcement
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container">
                {/* Statistics */}
                <div className="stats-grid">
                    <div className="stat-card card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <span className="stat-label">Antrian Saat Ini</span>
                            <span className="stat-value">{preparing ? preparing.queueNumber : currentQueue - 1}</span>
                        </div>
                    </div>
                    <div className="stat-card card">
                        <div className="stat-icon">🔥</div>
                        <div className="stat-content">
                            <span className="stat-label">Sedang Diproses</span>
                            <span className="stat-value">{preparing ? 1 : 0}</span>
                        </div>
                    </div>
                    <div className="stat-card card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <span className="stat-label">Selesai</span>
                            <span className="stat-value">{completedOrders.length}</span>
                        </div>
                    </div>
                    <div className="stat-card card">
                        <div className="stat-icon">❌</div>
                        <div className="stat-content">
                            <span className="stat-label">Dibatalkan</span>
                            <span className="stat-value">{canceledOrders.length}</span>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                                marginTop: '0.5rem',
                                display: 'flex',
                                gap: '0.5rem',
                                justifyContent: 'space-between'
                            }}>
                                <span>🤖 Auto: {autoCancels}</span>
                                <span>👤 Manual: {manualCancels}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Completion Banner */}
                {currentQueue > 100 && !preparing && (
                    <div className="completion-banner">
                        <h3>🎉 Simulasi Selesai!</h3>
                        <p style={{ margin: 0 }}>Semua antrian dari 1 sampai 100 telah diproses</p>
                    </div>
                )}

                {/* Simulation Controls */}
                <div className="simulation-controls card">
                    <div className="simulation-info">
                        <span className="simulation-icon">🎮</span>
                        <div>
                            <h3>Kontrol Simulasi</h3>
                            <p>Simulasi otomatis dari antrian 1 sampai 100 dengan cancel otomatis</p>
                        </div>
                    </div>

                    {isSimulating && (
                        <div className="simulation-running">
                            <div className="simulation-progress-container">
                                <div className="simulation-status">
                                    <span>Progress Simulasi</span>
                                    <span>{progress.toFixed(1)}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progress}%` }}>
                                        {progress > 15 && `${progress.toFixed(0)}%`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="simulation-actions">
                        {!isSimulating ? (
                            <>
                                <button
                                    onClick={startSimulation}
                                    className="btn btn-primary"
                                    disabled={currentQueue > 100 && !preparing}
                                >
                                    ▶️ Mulai Simulasi
                                </button>
                                <button
                                    onClick={processNextOrder}
                                    className="btn btn-secondary"
                                    disabled={currentQueue > 100 && !preparing}
                                >
                                    ⏭️ Proses Manual
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={stopSimulation}
                                className="btn btn-danger"
                            >
                                ⏸️ Hentikan Simulasi
                            </button>
                        )}
                        <button
                            onClick={resetSimulation}
                            className="btn btn-secondary"
                        >
                            🔄 Reset
                        </button>

                        <select
                            value={simulationSpeed}
                            onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                            className="simulation-speed-select"
                        >
                            <option value={1000}>⚡ Cepat (1s)</option>
                            <option value={2000}>🐇 Normal (2s)</option>
                            <option value={3000}>🐢 Lambat (3s)</option>
                        </select>

                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={`btn ${voiceEnabled ? 'btn-primary' : 'btn-secondary'}`}
                            title={voiceEnabled ? 'Suara Aktif' : 'Suara Nonaktif'}
                        >
                            {voiceEnabled ? '🔊 Suara ON' : '🔇 Suara OFF'}
                        </button>

                        {voiceEnabled && (
                            <button
                                onClick={() => announceQueue(preparing ? preparing.queueNumber : currentQueue - 1)}
                                className="btn btn-secondary"
                                title="Test suara pemanggilan"
                            >
                                🔊 Test Suara
                            </button>
                        )}
                    </div>

                    <div className="auto-cancel-control">
                        <label className="auto-cancel-label">
                            <span>⚠️ Auto Cancel:</span>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                value={autoCancelChance}
                                onChange={(e) => setAutoCancelChance(Number(e.target.value))}
                                className="auto-cancel-slider"
                            />
                            <span className="auto-cancel-value">{autoCancelChance}%</span>
                        </label>
                    </div>

                    <div className="simulation-info-box">
                        ℹ️ <strong>Info:</strong> Sistem akan secara otomatis membatalkan pesanan dengan peluang {autoCancelChance}% untuk mensimulasikan pembatalan real (stok habis, pelanggan tidak datang, dll).
                        Setiap antrian baru akan diumumkan dengan suara jika fitur suara aktif.
                    </div>
                </div>

                {/* Current Preparing Order */}
                {preparing && (
                    <section className="queue-section">
                        <div className="section-header">
                            <h2>🔥 Sedang Diproses</h2>
                            <span className="badge badge-warning">1 Pesanan</span>
                        </div>

                        <div className="queue-card card preparing">
                            <div className="queue-card-header">
                                <div className="queue-number">
                                    <span className="queue-label">Antrian</span>
                                    <span className="queue-num">#{preparing.queueNumber}</span>
                                </div>
                                <span className="badge badge-warning">
                                    <span className="pulse-dot"></span>
                                    Sedang Dimasak
                                </span>
                            </div>

                            <div className="user-info">
                                <div className="user-detail">
                                    <span className="user-icon">👤</span>
                                    <span className="user-name">{preparing.customerName}</span>
                                </div>
                                <div className="payment-detail">
                                    <span className="payment-icon">💳</span>
                                    <span className="payment-method">{preparing.payment}</span>
                                </div>
                            </div>

                            <div className="queue-items">
                                {preparing.items.map((item, idx) => (
                                    <div key={idx} className="queue-item">
                                        <div className="item-info">
                                            <span className="item-icon">{item.icon}</span>
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-qty">x{item.qty}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="queue-card-footer">
                                <div className="order-total">
                                    <span className="text-muted">Total:</span>
                                    <span className="total-amount">{formatCurrency(preparing.total)}</span>
                                </div>
                                <div className="btn-group">
                                    <button
                                        onClick={() => completeOrder(preparing)}
                                        className="btn btn-success"
                                    >
                                        ✅ Selesai
                                    </button>
                                    <button
                                        onClick={() => cancelOrder(preparing.id, true)}
                                        className="btn btn-danger"
                                    >
                                        ❌ Batalkan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Waiting Queue */}
                {waitingQueue.length > 0 && (
                    <section className="queue-section">
                        <div className="section-header">
                            <h2>⏳ Menunggu</h2>
                            <span className="badge badge-primary">{waitingQueue.length} Pesanan</span>
                        </div>

                        <div className="queue-grid">
                            {waitingQueue.map((order, idx) => (
                                <div key={order.id} className="queue-card card waiting fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                                    <div className="queue-card-header">
                                        <div className="queue-number">
                                            <span className="queue-label">Antrian</span>
                                            <span className="queue-num">#{order.queueNumber}</span>
                                        </div>
                                        {idx === 0 && (
                                            <span className="badge badge-primary">Berikutnya</span>
                                        )}
                                    </div>

                                    <div className="user-info">
                                        <div className="user-detail">
                                            <span className="user-icon">👤</span>
                                            <span className="user-name">{order.customerName}</span>
                                        </div>
                                        <div className="payment-detail">
                                            <span className="payment-icon">💳</span>
                                            <span className="payment-method">{order.payment}</span>
                                        </div>
                                    </div>

                                    <div className="queue-items">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="queue-item">
                                                <div className="item-info">
                                                    <span className="item-icon">{item.icon}</span>
                                                    <span className="item-name">{item.name}</span>
                                                    <span className="item-qty">x{item.qty}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="queue-card-footer">
                                        <div className="order-total">
                                            <span className="text-muted">Total:</span>
                                            <span className="total-amount">{formatCurrency(order.total)}</span>
                                        </div>
                                        <button
                                            onClick={() => cancelOrder(order.id)}
                                            className="btn btn-danger"
                                        >
                                            ❌ Batalkan
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {!preparing && waitingQueue.length === 0 && currentQueue <= 100 && (
                    <div className="empty-state card">
                        <p className="text-muted">Tidak ada antrian. Klik "Proses Manual" atau "Mulai Simulasi" untuk memulai</p>
                    </div>
                )}

                {/* Completed & Canceled Orders */}
                <div className="history-grid">
                    {/* Completed Orders */}
                    <div>
                        <div className="section-header">
                            <h2>✅ Selesai</h2>
                            <span className="badge badge-success">{completedOrders.length} pesanan</span>
                        </div>
                        <div className="history-list">
                            {completedOrders.slice(0, 20).map((order) => (
                                <div key={order.id} className="history-card card completed">
                                    <div className="history-card-content">
                                        <div>
                                            <div className="history-queue-number">#{order.queueNumber} - {order.customerName}</div>
                                            <div className="history-details">
                                                {order.items.length} item • {formatCurrency(order.total)}
                                            </div>
                                        </div>
                                        <span className="history-icon">✅</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Canceled Orders */}
                    <div>
                        <div className="section-header">
                            <h2>❌ Dibatalkan</h2>
                            <span className="badge badge-danger">{canceledOrders.length} pesanan</span>
                        </div>
                        <div className="history-list">
                            {canceledOrders.slice(0, 20).map((order) => (
                                <div key={order.id} className="history-card card canceled">
                                    <div className="history-card-content">
                                        <div>
                                            <div className="history-queue-number">#{order.queueNumber} - {order.customerName}</div>
                                            <div className="history-details">
                                                {order.items.length} item • {formatCurrency(order.total)}
                                            </div>
                                            <div className="cancel-reason">
                                                {order.cancelReason === 'Dibatalkan otomatis oleh sistem' ? '🤖' : '👤'}
                                                {order.cancelReason}
                                            </div>
                                        </div>
                                        <span className="history-icon">❌</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueueSimulation;
