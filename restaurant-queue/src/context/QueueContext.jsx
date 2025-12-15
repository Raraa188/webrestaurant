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
import { saveOrderToDatabase, getOrderHistory, clearOrderHistory } from '../services/database';
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

    // Load order history from Supabase on mount
    useEffect(() => {
        const loadHistoryFromDatabase = async () => {
            const history = await getOrderHistory();
            setOrderHistory(history);
        };
        loadHistoryFromDatabase();
    }, []);

    // SIMPLE AUTO-PROGRESS - Proses satu per satu, 5 detik per tahap
    useEffect(() => {
        const interval = setInterval(() => {
            setQueueList((prevList) => {
                if (prevList.length === 0) return prevList;

                // Cari order yang sedang preparing
                const preparingOrder = prevList.find(o => o.status === 'preparing');

                if (preparingOrder) {
                    // Jika ada yang preparing, selesaikan (preparing -> completed)
                    return prevList.map(async (order) => {
                        if (order.queueNumber === preparingOrder.queueNumber) {
                            const completed = { ...order, status: 'completed' };
                            // Save to database
                            await saveOrderToDatabase(completed);
                            // Also save to localStorage as backup
                            saveToOrderHistory(completed);
                            // Refresh history from database
                            const updatedHistory = await getOrderHistory();
                            setOrderHistory(updatedHistory);
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
            skipCount: 0, // Track how many times order has been skipped
        };

        setQueueList((prev) => [...prev, newOrder]);
        setQueueCounter((prev) => prev + 1);
        clearCart();

        return queueCounter;
    };

    const updateQueueStatus = async (queueNumber, newStatus) => {
        setQueueList((prevList) =>
            prevList.map((order) => {
                if (order.queueNumber === queueNumber) {
                    const updatedOrder = { ...order, status: newStatus };
                    if (newStatus === 'completed') {
                        // Save to database asynchronously
                        saveOrderToDatabase(updatedOrder).then(() => {
                            // Refresh history from database
                            getOrderHistory().then(history => {
                                setOrderHistory(history);
                            });
                        });
                        // Also save to localStorage as backup
                        saveToOrderHistory(updatedOrder);
                    }
                    return updatedOrder;
                }
                return order;
            })
        );
    };

    const clearAllData = async () => {
        setQueueList([]);
        setQueueCounter(1);
        setCurrentCart([]);
        clearStorageData();
        // Clear from database
        await clearOrderHistory();
        setOrderHistory([]);
    };

    // Skip order function: move back 2 positions or cancel if skipped 2 times
    const skipOrder = (queueNumber) => {
        setQueueList((prevList) => {
            const orderIndex = prevList.findIndex(o => o.queueNumber === queueNumber);
            if (orderIndex === -1) return prevList;

            const order = prevList[orderIndex];
            const newSkipCount = (order.skipCount || 0) + 1;

            // If skipped 2 times, remove from queue (cancel order)
            if (newSkipCount >= 2) {
                console.log(`Order #${queueNumber} cancelled after 2 skips`);
                return prevList.filter(o => o.queueNumber !== queueNumber);
            }

            // Move back 2 positions
            const updatedOrder = { ...order, skipCount: newSkipCount, status: 'waiting' };
            const newList = prevList.filter(o => o.queueNumber !== queueNumber);

            // Find new position (2 positions back from current)
            const waitingOrders = newList.filter(o => o.status === 'waiting');
            const insertIndex = Math.min(waitingOrders.length, 2); // Move back 2 positions

            // Insert at new position
            const beforeWaiting = newList.filter(o => o.status !== 'waiting');
            const afterInsert = waitingOrders.slice(0, insertIndex);
            const remaining = waitingOrders.slice(insertIndex);

            return [...beforeWaiting, ...afterInsert, updatedOrder, ...remaining];
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
                skipCount: 0, // Initialize skipCount for simulation orders
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
        skipOrder, // Export skip function
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
