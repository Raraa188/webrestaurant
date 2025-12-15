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

    // SIMPLE AUTO-PROGRESS - Proses satu per satu, 5 detik per tahap
    useEffect(() => {
        const interval = setInterval(() => {
            setQueueList((prevList) => {
                if (prevList.length === 0) return prevList;

                // Cari order yang sedang preparing
                const preparingOrder = prevList.find(o => o.status === 'preparing');

                if (preparingOrder) {
                    // Jika ada yang preparing, selesaikan (preparing -> completed)
                    return prevList.map(order => {
                        if (order.queueNumber === preparingOrder.queueNumber) {
                            const completed = { ...order, status: 'completed' };
                            saveToOrderHistory(completed);
                            setOrderHistory(loadOrderHistory());
                            return completed;
                        }
                        return order;
                    });
                }

                // Jika tidak ada yang preparing, ambil waiting pertama
                const waitingOrder = prevList.find(o => o.status === 'waiting');

                if (waitingOrder) {
                    // Mulai proses (waiting -> preparing)
                    return prevList.map(order => {
                        if (order.queueNumber === waitingOrder.queueNumber) {
                            return { ...order, status: 'preparing' };
                        }
                        return order;
                    });
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
