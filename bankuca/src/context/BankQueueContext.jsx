import { createContext, useContext, useState } from 'react';
import { tellerData, serviceCategories } from '../data/tellerData';

const BankQueueContext = createContext();

export const BankQueueProvider = ({ children }) => {
    // Queue counters per category (for generating ticket numbers)
    const [queueCounters, setQueueCounters] = useState({
        'TELLER': 1,
        'CS': 1,
        'LOAN': 1,
        'INVESTMENT': 1
    });

    // Queues per category (waiting tickets)
    const [queues, setQueues] = useState({
        'TELLER': [],
        'CS': [],
        'LOAN': [],
        'INVESTMENT': []
    });

    // Teller states
    const [tellers, setTellers] = useState(tellerData);

    // Current calls (teller yang sedang memanggil nasabah)
    const [currentCalls, setCurrentCalls] = useState([]);

    // Voice settings
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    // Take ticket - Generate nomor antrian
    const takeTicket = (serviceType) => {
        const category = serviceCategories[serviceType];
        if (!category) return null;

        const prefix = category.prefix;
        const number = queueCounters[serviceType];
        const paddedNumber = String(number).padStart(3, '0');

        const ticket = {
            id: `${prefix}${paddedNumber}`,
            prefix,
            number: paddedNumber,
            displayNumber: number,
            serviceType,
            serviceName: category.name,
            timestamp: new Date().toISOString(),
            status: 'waiting'
        };

        // Add to queue
        setQueues(prev => ({
            ...prev,
            [serviceType]: [...prev[serviceType], ticket]
        }));

        // Increment counter
        setQueueCounters(prev => ({
            ...prev,
            [serviceType]: prev[serviceType] + 1
        }));

        // Calculate waiting info
        const waitingCount = queues[serviceType].length;
        const estimatedTime = waitingCount * 5; // 5 minutes per customer

        console.log('Ticket taken:', ticket);

        return {
            ...ticket,
            waitingCount,
            estimatedTime
        };
    };

    // Call next customer
    const callNext = (tellerId) => {
        const teller = tellers.find(t => t.id === tellerId);
        if (!teller) {
            console.log('Teller not found:', tellerId);
            return null;
        }

        const queue = queues[teller.type];
        if (!queue || queue.length === 0) {
            console.log('No queue for teller type:', teller.type);
            return null;
        }

        const nextCustomer = queue[0];
        console.log('Calling next customer:', nextCustomer);

        // Update teller current queue
        setTellers(prev => prev.map(t =>
            t.id === tellerId
                ? { ...t, currentQueue: nextCustomer }
                : t
        ));

        // Add to current calls
        const newCall = {
            tellerId,
            tellerName: teller.name,
            prefix: nextCustomer.prefix,
            number: nextCustomer.number,
            displayNumber: nextCustomer.displayNumber,
            serviceType: nextCustomer.serviceType,
            id: nextCustomer.id
        };

        setCurrentCalls(prev => {
            const filtered = prev.filter(c => c.tellerId !== tellerId);
            const updated = [...filtered, newCall];
            console.log('Updated currentCalls:', updated);
            return updated;
        });

        // Remove from queue
        setQueues(prev => ({
            ...prev,
            [teller.type]: prev[teller.type].slice(1)
        }));

        // Voice announcement
        announceQueue(nextCustomer, teller);

        return nextCustomer;
    };

    // Complete service
    const completeService = (tellerId) => {
        console.log('Completing service for teller:', tellerId);

        // Clear teller current queue
        setTellers(prev => prev.map(t =>
            t.id === tellerId
                ? { ...t, currentQueue: null }
                : t
        ));

        // Remove from current calls
        setCurrentCalls(prev => {
            const updated = prev.filter(c => c.tellerId !== tellerId);
            console.log('Updated currentCalls after complete:', updated);
            return updated;
        });
    };

    // Voice announcement
    const announceQueue = (customer, teller) => {
        if (!voiceEnabled || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const text = `Nomor antrian ${customer.prefix} ${customer.displayNumber}, silakan menuju ${teller.name}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        window.speechSynthesis.speak(utterance);
    };

    // Toggle voice
    const toggleVoice = () => {
        setVoiceEnabled(prev => !prev);
    };

    // Get total waiting
    const getTotalWaiting = () => {
        return Object.values(queues).reduce((total, queue) => total + queue.length, 0);
    };

    // Get waiting by type
    const getWaitingByType = (type) => {
        return queues[type]?.length || 0;
    };

    const value = {
        queues,
        tellers,
        currentCalls,
        voiceEnabled,
        takeTicket,
        callNext,
        completeService,
        toggleVoice,
        getTotalWaiting,
        getWaitingByType,
        serviceCategories
    };

    // Debug log
    console.log('BankQueueContext state:', {
        queues,
        currentCalls: currentCalls.length,
        tellers: tellers.map(t => ({ id: t.id, name: t.name, hasQueue: !!t.currentQueue }))
    });

    return (
        <BankQueueContext.Provider value={value}>
            {children}
        </BankQueueContext.Provider>
    );
};

export const useBankQueue = () => {
    const context = useContext(BankQueueContext);
    if (!context) {
        throw new Error('useBankQueue must be used within BankQueueProvider');
    }
    return context;
};
