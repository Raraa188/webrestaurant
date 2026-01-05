import { useState, useEffect, useRef } from 'react';
import { useBankQueue } from '../context/BankQueueContext';
import './Simulation.css';

const Simulation = () => {
    const { takeTicket, callNext, completeService, tellers, queues, currentCalls, serviceCategories } = useBankQueue();
    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState(2000); // milliseconds
    const [stats, setStats] = useState({
        totalTickets: 0,
        totalServed: 0,
        totalWaiting: 0
    });

    const intervalRef = useRef(null);

    // Random name generator
    const randomNames = [
        'Budi Santoso', 'Ani Wijaya', 'Citra Dewi', 'Dedi Kurniawan',
        'Eka Putri', 'Fajar Rahman', 'Gita Sari', 'Hendra Gunawan',
        'Indah Permata', 'Joko Widodo', 'Kartika Sari', 'Lukman Hakim',
        'Maya Angelina', 'Nanda Pratama', 'Oki Setiana', 'Putri Ayu'
    ];

    const getRandomName = () => {
        return randomNames[Math.floor(Math.random() * randomNames.length)];
    };

    const getRandomServiceType = () => {
        const types = Object.keys(serviceCategories);
        return types[Math.floor(Math.random() * types.length)];
    };

    // Generate random ticket
    const generateRandomTicket = () => {
        const serviceType = getRandomServiceType();
        const ticket = takeTicket(serviceType);
        if (ticket) {
            setStats(prev => ({
                ...prev,
                totalTickets: prev.totalTickets + 1,
                totalWaiting: prev.totalWaiting + 1
            }));
            console.log(`[SIMULATION] Generated ticket: ${ticket.prefix}${ticket.displayNumber} for ${serviceType}`);
        }
    };

    // Auto call next customer for random teller
    const autoCallNext = () => {
        // Get active tellers that are not currently serving
        const availableTellers = tellers.filter(t =>
            t.status === 'active' && !t.currentQueue
        );

        if (availableTellers.length === 0) return;

        // Pick random available teller
        const randomTeller = availableTellers[Math.floor(Math.random() * availableTellers.length)];

        // Check if there's queue for this teller type
        const queue = queues[randomTeller.type];
        if (queue && queue.length > 0) {
            callNext(randomTeller.id);
            console.log(`[SIMULATION] Teller ${randomTeller.name} called next customer`);
        }
    };

    // Auto complete service for random teller
    const autoCompleteService = () => {
        // Get tellers that are currently serving
        const busyTellers = tellers.filter(t => t.currentQueue !== null);

        if (busyTellers.length === 0) return;

        // Pick random busy teller
        const randomTeller = busyTellers[Math.floor(Math.random() * busyTellers.length)];

        completeService(randomTeller.id);
        setStats(prev => ({
            ...prev,
            totalServed: prev.totalServed + 1,
            totalWaiting: Math.max(0, prev.totalWaiting - 1)
        }));
        console.log(`[SIMULATION] Teller ${randomTeller.name} completed service`);
    };

    // Main simulation loop
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                const action = Math.random();

                if (action < 0.4) {
                    // 40% chance: Generate new ticket
                    generateRandomTicket();
                } else if (action < 0.7) {
                    // 30% chance: Call next customer
                    autoCallNext();
                } else {
                    // 30% chance: Complete service
                    autoCompleteService();
                }
            }, speed);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [isRunning, speed, tellers, queues]);

    const handleStart = () => {
        setIsRunning(true);
        console.log('[SIMULATION] Started');
    };

    const handleStop = () => {
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        console.log('[SIMULATION] Stopped');
    };

    const handleReset = () => {
        handleStop();
        setStats({
            totalTickets: 0,
            totalServed: 0,
            totalWaiting: 0
        });
        console.log('[SIMULATION] Reset');
    };

    // Calculate current waiting
    const currentWaiting = Object.values(queues).reduce((total, queue) => total + queue.length, 0);

    return (
        <div className="simulation">
            <div className="simulation-container">
                <div className="simulation-header">
                    <h1>Simulasi Otomatis</h1>
                    <p>Simulasi sistem antrian bank secara otomatis</p>
                </div>

                <div className="simulation-controls">
                    <div className="control-group">
                        <label>Kecepatan Simulasi:</label>
                        <select
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            disabled={isRunning}
                        >
                            <option value={500}>Sangat Cepat (0.5s)</option>
                            <option value={1000}>Cepat (1s)</option>
                            <option value={2000}>Normal (2s)</option>
                            <option value={3000}>Lambat (3s)</option>
                            <option value={5000}>Sangat Lambat (5s)</option>
                        </select>
                    </div>

                    <div className="control-buttons">
                        {!isRunning ? (
                            <button className="btn-start" onClick={handleStart}>
                                Mulai Simulasi
                            </button>
                        ) : (
                            <button className="btn-stop" onClick={handleStop}>
                                Hentikan Simulasi
                            </button>
                        )}
                        <button className="btn-reset" onClick={handleReset}>
                            Reset
                        </button>
                    </div>
                </div>

                <div className="simulation-stats">
                    <div className="stat-card">

                        <div className="stat-content">
                            <div className="stat-value">{stats.totalTickets}</div>
                            <div className="stat-label">Total Tiket</div>
                        </div>
                    </div>

                    <div className="stat-card">

                        <div className="stat-content">
                            <div className="stat-value">{currentWaiting}</div>
                            <div className="stat-label">Sedang Menunggu</div>
                        </div>
                    </div>

                    <div className="stat-card">

                        <div className="stat-content">
                            <div className="stat-value">{stats.totalServed}</div>
                            <div className="stat-label">Telah Dilayani</div>
                        </div>
                    </div>

                    <div className="stat-card">

                        <div className="stat-content">
                            <div className="stat-value">{currentCalls.length}</div>
                            <div className="stat-label">Sedang Dilayani</div>
                        </div>
                    </div>
                </div>

                <div className="simulation-info">
                    <h3>Status Teller</h3>
                    <div className="teller-status-grid">
                        {tellers.map(teller => (
                            <div key={teller.id} className={`teller-status ${teller.currentQueue ? 'busy' : 'available'}`}>
                                <div className="teller-status-name">{teller.name}</div>
                                <div className="teller-status-state">
                                    {teller.currentQueue ? (
                                        <span className="status-busy">
                                            Melayani {teller.currentQueue.prefix}{teller.currentQueue.displayNumber}
                                        </span>
                                    ) : (
                                        <span className="status-available">Tersedia</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="simulation-queue">
                    <h3>Antrian per Kategori</h3>
                    <div className="queue-grid">
                        {Object.entries(serviceCategories).map(([key, category]) => (
                            <div key={key} className="queue-category-card">
                                <div className="queue-category-header">

                                    <span className="queue-name">{category.name}</span>
                                </div>
                                <div className="queue-count">{queues[key]?.length || 0}</div>
                                <div className="queue-label">Menunggu</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulation;
