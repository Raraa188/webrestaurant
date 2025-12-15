import { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
    loadQueueList,
    saveQueueList,
    loadQueueCounter,
    saveQueueCounter,
    loadOrderHistory,
    saveToOrderHistory,
    clearAllData as clearStorageData,
} from '../utils/localStorage';
import { menuData } from '../data/menuData';

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
    const [queueList, setQueueList] = useState(loadQueueList());
    const [queueCounter, setQueueCounter] = useState(loadQueueCounter());
    const [currentCart, setCurrentCart] = useState([]);
    const [orderHistory, setOrderHistory] = useState(loadOrderHistory());

    // Auto-save to localStorage
    useEffect(() => {
        saveQueueList(queueList);
    }, [queueList]);

    useEffect(() => {
        saveQueueCounter(queueCounter);
    }, [queueCounter]);

    // Voice announcement function
    const announceQueue = (queueNumber) => {
        // Check if voice is enabled from localStorage
        const voiceEnabled = localStorage.getItem('voiceEnabled');
        if (voiceEnabled === 'false' || !window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const text = `Antrian nomor ${queueNumber}, pesanan Anda sudah siap`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        window.speechSynthesis.speak(utterance);
    };

    // SIMPLE AUTO-PROGRESS - Proses satu per satu, 5 detik per tahap
    useEffect(() => {
        const interval = setInterval(() => {
            setQueueList((prevList) => {
                if (prevList.length === 0) return prevList;

                // Cari order yang sedang preparing
                const preparingOrder = prevList.find(o => o.status === 'preparing');

                if (preparingOrder) {
                    // Jika ada yang preparing, selesaikan (preparing -> completed)
                    const updatedList = prevList.map(order => {
                        if (order.queueNumber === preparingOrder.queueNumber) {
                            const completed = { ...order, status: 'completed' };
                            saveToOrderHistory(completed);
                            setOrderHistory(loadOrderHistory());

                            // Announce queue number dengan suara
                            announceQueue(completed.queueNumber);

                            return completed;
                        }
                        return order;
                    });
                    return updatedList;
                }

                // Jika tidak ada yang preparing, ambil waiting dengan prioritas
                let waitingOrders = prevList.filter(o => o.status === 'waiting');

                if (waitingOrders.length > 0) {
                    // Helper: cek apakah order punya main course
                    const hasMainCourse = (order) => {
                        return order.items.some(item => item.category === 'Main Course');
                    };

                    // Reorder waiting queue berdasarkan prioritas
                    // 1. Order tanpa main course (prioritas tinggi)
                    // 2. Order dengan main course (prioritas rendah)
                    const ordersWithoutMainCourse = waitingOrders.filter(o => !hasMainCourse(o));
                    const ordersWithMainCourse = waitingOrders.filter(o => hasMainCourse(o));

                    // Jika ada order dengan main course, pindahkan ke posisi +2
                    let reorderedWaiting = [];
                    if (ordersWithMainCourse.length > 0 && ordersWithoutMainCourse.length > 0) {
                        // Ambil order tanpa main course dulu
                        reorderedWaiting = [...ordersWithoutMainCourse];

                        // Insert order dengan main course di posisi +2
                        ordersWithMainCourse.forEach(mainCourseOrder => {
                            const insertPos = Math.min(2, reorderedWaiting.length);
                            reorderedWaiting.splice(insertPos, 0, mainCourseOrder);
                        });
                    } else {
                        // Jika semua sama jenisnya, tetap urutan asli
                        reorderedWaiting = waitingOrders;
                    }

                    // Ambil order pertama dari waiting yang sudah direorder
                    const nextOrder = reorderedWaiting[0];

                    // Update queue dengan urutan baru
                    const otherOrders = prevList.filter(o => o.status !== 'waiting');
                    const newWaitingQueue = reorderedWaiting.map(order =>
                        order.queueNumber === nextOrder.queueNumber
                            ? { ...order, status: 'preparing' }
                            : order
                    );

                    return [...otherOrders, ...newWaitingQueue];
                }

                // Hapus completed setelah 10 detik
                const now = Date.now();
                return prevList.filter(order => {
                    if (order.status === 'completed') {
                        // Tidak ada timestamp, langsung hapus
                        return false;
                    }
                    return true;
                });
            });
        }, 5000); // 5 detik

        return () => clearInterval(interval);
    }, []);

    // Cart functions
    const addToCart = (item) => {
        setCurrentCart((prevCart) => {
            const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCurrentCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === itemId);
            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map((item) =>
                    item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
                );
            }
            return prevCart.filter((item) => item.id !== itemId);
        });
    };

    const clearCart = () => {
        setCurrentCart([]);
    };

    const getCartTotal = () => {
        return currentCart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getCartItemCount = () => {
        return currentCart.reduce((count, item) => count + item.quantity, 0);
    };

    const submitOrder = (userName, paymentMethod) => {
        if (currentCart.length === 0) return null;

        const newOrder = {
            queueNumber: queueCounter,
            userName,
            items: currentCart,
            status: 'waiting',
            paymentMethod,
            timestamp: new Date().toISOString(),
            skipCount: 0,
        };

        setQueueList((prev) => [...prev, newOrder]);
        setQueueCounter((prev) => prev + 1);
        clearCart();

        return queueCounter;
    };

    const updateQueueStatus = (queueNumber, newStatus) => {
        setQueueList((prevList) =>
            prevList.map((order) => {
                if (order.queueNumber === queueNumber) {
                    const updatedOrder = { ...order, status: newStatus };
                    if (newStatus === 'completed') {
                        saveToOrderHistory(updatedOrder);
                        setOrderHistory(loadOrderHistory());
                    }
                    return updatedOrder;
                }
                return order;
            })
        );
    };

    const clearAllData = () => {
        setQueueList([]);
        setQueueCounter(1);
        setOrderHistory([]);
        setCurrentCart([]);
        clearStorageData();
    };

    // Skip order: 2x skip = hangus
    const skipOrder = (queueNumber) => {
        setQueueList((prevList) => {
            const order = prevList.find(o => o.queueNumber === queueNumber);
            if (!order) return prevList;

            const newSkipCount = (order.skipCount || 0) + 1;

            // Jika sudah di-skip 2 kali, hapus (hangus)
            if (newSkipCount >= 2) {
                console.log(`Pesanan #${queueNumber} hangus (skip 2x)`);

                // Simpan ke riwayat sebagai "dibatalkan"
                const cancelledOrder = {
                    ...order,
                    status: 'cancelled',
                    skipCount: newSkipCount,
                    cancelledAt: new Date().toISOString(),
                    cancelReason: 'Tidak diambil (2x skip)'
                };
                saveToOrderHistory(cancelledOrder);
                setOrderHistory(loadOrderHistory());

                return prevList.filter(o => o.queueNumber !== queueNumber);
            }

            // Skip pertama: mundur 2 posisi ke waiting queue
            const updatedOrder = {
                ...order,
                status: 'waiting',
                skipCount: newSkipCount
            };

            // Remove dari posisi current
            const newList = prevList.filter(o => o.queueNumber !== queueNumber);

            // Pisahkan berdasarkan status
            const preparingOrders = newList.filter(o => o.status === 'preparing');
            const waitingOrders = newList.filter(o => o.status === 'waiting');
            const completedOrders = newList.filter(o => o.status === 'completed');

            // Insert di posisi +2 dalam waiting queue (mundur 2 antrian)
            const insertPosition = Math.min(2, waitingOrders.length);
            waitingOrders.splice(insertPosition, 0, updatedOrder);

            // Gabungkan kembali: preparing, waiting (dengan order yang di-skip), completed
            return [...preparingOrders, ...waitingOrders, ...completedOrders];
        });
    };

    // Add 3 simulation queues
    const addSimulationQueues = () => {
        const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
        const newQueues = [];

        for (let i = 0; i < 3; i++) {
            const randomName = names[Math.floor(Math.random() * names.length)];
            const randomItemCount = Math.floor(Math.random() * 3) + 1;
            const randomItems = [];

            for (let j = 0; j < randomItemCount; j++) {
                const randomItem = menuData[Math.floor(Math.random() * menuData.length)];
                randomItems.push({
                    ...randomItem,
                    quantity: Math.floor(Math.random() * 2) + 1,
                });
            }

            const newOrder = {
                queueNumber: queueCounter + i,
                userName: randomName,
                items: randomItems,
                status: 'waiting',
                paymentMethod: 'cash',
                timestamp: new Date().toISOString(),
                skipCount: 0,
            };

            newQueues.push(newOrder);
        }

        setQueueList((prev) => [...prev, ...newQueues]);
        setQueueCounter((prev) => prev + 3);
    };

    const value = {
        queueList,
        queueCounter,
        currentCart,
        orderHistory,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount,
        submitOrder,
        updateQueueStatus,
        addSimulationQueues,
        clearAllData,
        skipOrder,
    };

    return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
};

export const useQueue = () => {
    const context = useContext(QueueContext);
    if (!context) {
        throw new Error('useQueue must be used within QueueProvider');
    }
    return context;
};
